"""只读采集公开接口与展示图片，生成本地模拟预览快照；不携带登录凭证。"""
import concurrent.futures
import datetime
import hashlib
import json
from pathlib import Path
import urllib.parse
import urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = 'https://www.zhxiaoyuan.cn/agentPlatformSch/#/desktop-app'
API_BASE = 'https://www.zhxiaoyuan.cn/wxcepClient1/'
RESOURCE_BASE = 'https://www.zhxiaoyuan.cn/wxcep-resource/common/studyResourceAtlas/'
SNAPSHOT_DIR = ROOT / 'src/mock'
ASSET_DIR = ROOT / 'mock-assets'
FAILURES = []


def read_json(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'LocalPreviewSnapshot/1.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)
    if payload.get('result') is not True or payload.get('code') != 200:
        raise ValueError(f'公开接口未成功：{url}')
    return payload.get('data')


def read_optional(url):
    try:
        return read_json(url)
    except Exception as error:
        FAILURES.append({'url': url, 'reason': str(error)})
        return None


def redact(value):
    if isinstance(value, dict):
        return {
            key: redact(item) for key, item in value.items()
            if not any(word in key.lower() for word in ('token', 'secret', 'password', 'apikey'))
        }
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


def prepare_agent(row):
    # 登录账号、内部用户 ID 与第三方访问凭证不属于本地页面展示数据。
    result = {
        key: value for key, value in row.items()
        if key not in ('createLoginName', 'createUserId', 'reviewerId', 'reviewerLoginName')
    }
    if result.get('accessConfig'):
        try:
            result['accessConfig'] = json.dumps(redact(json.loads(result['accessConfig'])), ensure_ascii=False)
        except (TypeError, ValueError):
            result['accessConfig'] = None
    return result


def download_image(url):
    try:
        digest = hashlib.sha256(url.encode()).hexdigest()[:20]
        extension = Path(urllib.parse.urlparse(url).path).suffix.lower()
        if extension not in ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'):
            extension = '.png'
        name = digest + extension
        path = ASSET_DIR / name
        if not path.exists():
            with urllib.request.urlopen(url, timeout=30) as response:
                content_type = response.headers.get('Content-Type', '')
                if not content_type.startswith('image/'):
                    raise ValueError('响应不是图片')
                path.write_bytes(response.read())
            if extension in ('.png', '.jpg', '.jpeg', '.webp'):
                with Image.open(path) as image:
                    image.thumbnail((1280, 800), Image.Resampling.LANCZOS)
                    if extension in ('.jpg', '.jpeg'):
                        image.convert('RGB').save(path, quality=82, optimize=True)
                    else:
                        image.save(path, optimize=True)
        return url, '/mock-assets/' + name
    except Exception as error:
        FAILURES.append({'url': url, 'reason': str(error)})
        return url, ''


def main():
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    agents = []
    page_no = 1
    while True:
        page = read_json(f'{API_BASE}common/aiAgent/pageList?pageNo={page_no}&pageSize=100')
        agents.extend(prepare_agent(row) for row in page['dataList'])
        if not page['pagination']['hasNextPage']:
            break
        page_no += 1
    if len({row['id'] for row in agents}) != page['pagination']['total']:
        raise ValueError('采集列表存在缺页或重复，请重试')
    banners = read_json(f'{API_BASE}common/aiBanner/list?isDelete=1') or []
    subject_map = {}
    for school_id in sorted({row['schoolId'] for row in agents}):
        rows = read_optional(f'{RESOURCE_BASE}getSchoolAutonomicResourceAtlsList?schoolId={school_id}') or []
        subject_map.update({row['id']: row for row in rows})
    subjects = list(subject_map.values())
    materials = {}
    chapters = {}
    subject_ids = sorted({
        value for row in agents for value in (row.get('subjectCodes') or '').split(',')
        if value and value != '-1'
    })
    material_ids = sorted({
        value for row in agents for value in (row.get('materialIds') or '').split(',')
        if value and value != '-1'
    })
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        results = pool.map(read_optional, [
            f'{RESOURCE_BASE}getGradeAtlasDetailListByAtlasId?atlasId={value}' for value in subject_ids
        ])
        materials = dict(zip(subject_ids, results))
        results = pool.map(read_optional, [
            f'{RESOURCE_BASE}findGradeAtlasDetailList?pidAtlasId={value}' for value in material_ids
        ])
        chapters = dict(zip(material_ids, results))
    logo_url = 'https://cdnfile-10043692.file.myqcloud.com/productVersion/projects/agentPlatform/djcjzx_logo.jpg'
    avatar_url = 'https://cdnfile-10043692.file.myqcloud.com/wxcep/default_avatar.png'
    image_urls = {logo_url, avatar_url}
    for row in agents:
        for field in ('coverImg', 'logoImg'):
            raw = row.get(field)
            if not raw:
                continue
            try:
                files = json.loads(raw)
                if isinstance(files, list):
                    image_urls.update(item['attachmentKey'] for item in files if item.get('attachmentKey', '').startswith('http'))
            except (TypeError, ValueError):
                if raw.startswith('http'):
                    image_urls.add(raw)
    image_urls.update(row['bannerLogo'] for row in banners if row.get('bannerLogo'))
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        image_map = dict(pool.map(download_image, sorted(image_urls)))
    # 保留接口字段结构，只将展示图片改为本地路径；失败图片留空，不回落到远端请求。
    for row in agents:
        for field in ('coverImg', 'logoImg'):
            raw = row.get(field)
            if not raw:
                continue
            try:
                files = json.loads(raw)
                if isinstance(files, list):
                    for item in files:
                        item['attachmentKey'] = image_map.get(item.get('attachmentKey'), '')
                    row[field] = json.dumps(files, ensure_ascii=False)
            except (TypeError, ValueError):
                row[field] = image_map.get(raw, '')
    for row in banners:
        row['bannerLogo'] = image_map.get(row.get('bannerLogo'), '')
    snapshot = {
        'agents': agents, 'banners': [prepare_agent(row) for row in banners],
        'subjects': subjects, 'materials': materials, 'chapters': chapters,
        'defaultLogo': image_map.get(logo_url, ''), 'defaultAvatar': image_map.get(avatar_url, '')
    }
    metadata = {
        'sourceUrl': SOURCE_URL,
        'capturedAt': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(timespec='seconds'),
        'agentCount': len(agents), 'bannerCount': len(banners),
        'schoolIds': sorted({row['schoolId'] for row in agents}),
        'scope': '链接未限定学校，采集公开列表全量数据；不代表单个学校或当前登录用户的数据。',
        'localImageCount': sum(bool(value) for value in image_map.values()),
        'defaultLogo': snapshot['defaultLogo'],
        'failures': FAILURES,
        'status': {
            'list': '已采集完整分页快照', 'details': '复用公开列表完整展示字段，未执行外部应用',
            'filters': '已采集公开学科与现有资源对应的教材、章节',
            'personalData': '未采集私人收藏、使用记录或草稿；由本地交互产生',
            'platformSettings': '未取得学校平台配置，保留原有默认名称与标识',
            'uploadsAndAi': '未接入，本地模式不调用上传服务或第三方 AI'
        }
    }
    (SNAPSHOT_DIR / 'snapshot.json').write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
    (SNAPSHOT_DIR / 'snapshot-meta.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()

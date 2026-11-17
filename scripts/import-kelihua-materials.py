"""Import the supplied school files; never invent prompts, metrics or missing assets."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import unicodedata
import xml.etree.ElementTree as ET
from zipfile import ZipFile

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--extracted', type=Path, help='Optional extraction cache from the supplied files')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = root / 'public/kelihua-materials'
output.mkdir(parents=True, exist_ok=True)
lesson_map = json.loads((root / 'scripts/kelihua-lesson-map.json').read_text())

def extract_records():
    from pypdf import PdfReader
    records = []
    for source in sorted((args.source / '课例/课例').iterdir()):
        if source.suffix == '.pdf':
            text = '\n'.join(page.extract_text() or '' for page in PdfReader(source).pages)
        elif source.suffix == '.docx':
            with ZipFile(source) as archive:
                document = ET.fromstring(archive.read('word/document.xml'))
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                text = '\n'.join(''.join(node.text or '' for node in paragraph.findall('.//w:t', ns)) for paragraph in document.findall('.//w:p', ns))
        elif source.suffix == '.doc':
            text = subprocess.check_output(['textutil', '-convert', 'txt', '-stdout', str(source)]).decode()
        else:
            continue
        records.append({'file': 'kelihua/' + str(source.relative_to(args.source)), 'text': text})
    return records

records = json.loads(args.extracted.read_text()) if args.extracted else extract_records()
if set(Path(record['file']).name for record in records) != set(lesson_map):
    raise ValueError('Source files changed; update scripts/kelihua-lesson-map.json before importing.')
# Keep original extraction order for the explicit lesson-resource associations below.
records.sort(key=lambda record: Path(record['file']).name)
unit_map = {}
lessons = []
manifest = []

def copy_file(path, folder='sources'):
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    name = digest[:16] + path.suffix.lower()
    target = output / folder / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)
    manifest.append({'source': str(path.relative_to(args.source)), 'asset': str(target.relative_to(root / 'public')), 'sha256': digest})
    return 'kelihua-materials/' + folder + '/' + name

def get_unit(subject, title):
    key = subject + ':' + title
    if key not in unit_map:
        unit_map[key] = {'id': 'unit-' + hashlib.sha256(key.encode()).hexdigest()[:10], 'subject': subject, 'title': title, 'order': '主题单元', 'edition': '以原文为准', 'grade': '跨年级', 'volume': '', 'lessons': []}
    return unit_map[key]

for index, record in enumerate(records):
    source = args.source / Path(record['file']).relative_to('kelihua')
    title, author = source.stem.rsplit('——', 1)
    text = unicodedata.normalize('NFKC', record['text']).replace('\x00', '')
    compact = re.sub(r'\s+', '', text)
    metadata = lesson_map[source.name]
    grade = metadata['grade']
    unit = get_unit(metadata['subject'], metadata['theme'])
    summary_match = re.search(r'(?:【内容概述】|【教材分析】|内容概述)(.*?)(?:【学情|【教学|【学习|学习目标)', compact)
    summary = summary_match.group(1) if summary_match else compact
    summary = summary[:240] + ('…' if len(summary) > 240 else '')
    lesson = {'id': 'lesson-' + hashlib.sha256(source.name.encode()).hexdigest()[:12], 'title': title.strip(), 'teacher': author.strip().rstrip('.'), 'school': '南京市科利华中学', 'subject': metadata['subject'], 'grade': grade, 'unitId': unit['id'], 'unitTitle': unit['title'], 'goal': summary, 'sourceText': text, 'sourceName': source.name, 'sourcePath': str(source.relative_to(args.source)), 'asset': copy_file(source, 'lessons'), 'format': source.suffix[1:].upper(), 'ai': bool(re.search(r'AI|人工智能|智能体|数字人', compact)), 'featured': False, 'cover': 'science' if metadata['subject'] in ['sx','wl','hx','sw','xx'] else 'book', 'kinds': ['原始课例'], 'resourceIds': []}
    if metadata['note']: lesson['metadataNote'] = metadata['note']
    unit['lessons'].append(lesson)
    lessons.append(lesson)

resources = []
def resource(name, author, subject, theme, kind='tool', url='', desc='', source_name='', asset='', related=None, note=''):
    unit = get_unit(subject, theme)
    index = len(resources) + 1
    item = {'id': 'resource-' + hashlib.sha256((name + author).encode()).hexdigest()[:12], 'name': name, 'author': author, 'dept': '', 'matrix': 'subject', 'subject': subject, 'unitId': unit['id'], 'unitTitle': theme, 'type': kind, 'url': url, 'asset': asset, 'desc': desc or name, 'sourceName': source_name, 'sourceNote': note, 'status': 'published', 'order': index, 'code': f'XK-{subject.upper()}-{index:03}', 'scene': 'teach', 'grades': [], 'prompt': '', 'persona': '', 'reply': '', 'steps': [], 'availability': '本地原件已导入' if asset else '已收录链接 · 外部服务待验证' if url else '使用地址待补充', 'promptStatus': '人设与回复未提供' if kind == 'agent' else '提示词未提供'}
    resources.append(item)
    for lesson_index in related or []:
        lessons[lesson_index]['resourceIds'].append(item['id'])
        if lessons[lesson_index]['grade'] not in item['grades']: item['grades'].append(lessons[lesson_index]['grade'])
    return item

resource('AI伴学宝','包桂霞','xx','人工智能的实现方式','agent','https://chatglm.cn/share/FF10pxyI','协助探究 K-均值聚类算法，讨论数据影响、算法偏见及生活中的应用。',lessons[23]['sourceName'],related=[23])
resource('小科','李佳静','xx','具身智能','agent',desc='帮助学生完成机器人设计卡，梳理应用场景、感知模块、思考模块和行动模块。',source_name=lessons[61]['sourceName'],related=[61])
resource('探究域——科学探究教学助手','纪甜甜','wl','科学探究（跨单元）',url='https://tanjiuyu.coze.site/teacher/board',desc='教师端创建任务，学生端收集并对比各组实验图片，支持科学实验课堂反馈。',source_name='说明文档 纪甜甜.docx',note='原文定位为师生实验平台，按交互工具收录。')
source = args.source / '说明文档  周翔宇.docx'
with ZipFile(source) as archive:
    doc = ET.fromstring(archive.read('word/document.xml'))
    ns = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text = '\n'.join(''.join(n.text or '' for n in p.findall('.//w:t',ns)) for p in doc.findall('.//w:p',ns))
for number, (name, url) in enumerate(re.findall(r'作品\d+名称[：:]\s*(.*?)\s*所属知识模块[：:].*?作品链接[：:]\s*(https?://\S+)',text,re.S),1):
    theme = '简单电路' if number in [1,2,3,4,5,6,7,13] else '力与运动' if number in [8,9] else '功与能' if number in [10,11] else '科学探究（跨单元）'
    resource(name.strip(),'周翔宇','wl',theme,url=url,source_name=source.name,note='原说明将城墙稳定性标为电；此处按作品内容暂归力与运动，待作者核实。' if number==8 else '')
resource('凸透镜成像规律在线数智平台 · 学生端','赵妍妮','wl','光的折射与透镜',url='https://convex.njysnet.com/student.html?projectId=1',desc='分组记录物距、像距与像高，支持实验数据修改和比较。',source_name='凸透镜成像规律平台-学生端-教师端简介.docx',related=[26])
resource('凸透镜成像规律在线数智平台 · 教师端','赵妍妮','wl','光的折射与透镜',url='https://convex.njysnet.com/teacher.html?projectId=1',desc='汇总实验数据，展示成像特点、轴图和折线图。',source_name='凸透镜成像规律平台-学生端-教师端简介.docx',related=[26])
for name, desc in [('用电器大调查','收集生活中的调档现象，辅助课前认知调查。'),('学习使用滑动变阻器','汇总六组接线实验，对比滑动过程中的电流变化。'),('《变阻器》做中学实践性作业交互平台','分层实践作业与五维评价，支持同伴作品交流。')]:
    resource(name,'赵妍妮','wl','欧姆定律',desc=desc,source_name='变阻器课前课中课后交互平台.docx',related=[59])
local = args.source / '交互网页和智能体 赵妍妮'
for source in sorted(local.rglob('*.html')):
    asset = copy_file(source, 'tools')
    # Preserve relative supporting images for the original HTML without executing it during import.
    support = source.parent / (source.stem + '_files')
    if support.is_dir(): shutil.copytree(support, output / 'tools' / support.name, dirs_exist_ok=True)
    resource(source.stem,'赵妍妮','wl','质量与密度',desc='原始交互网页已导入，使用范围和联网功能以原页面说明为准。',source_name=str(source.relative_to(args.source)),asset=asset)
for source in local.rglob('*.ggb'):
    resource('凸透镜成像规律 · GeoGebra 实验','赵妍妮','wl','光的折射与透镜',desc='下载原始 GGB 文件后使用 GeoGebra 打开。',source_name=source.name,asset=copy_file(source,'tools'),related=[26])
for source in args.source.rglob('*.docx'):
    if '课例' not in source.parts: copy_file(source)
for unit in unit_map.values():
    unit['grades'] = sorted(set(l['grade'] for l in unit['lessons']))
    unit['designer'] = '、'.join(dict.fromkeys(l['teacher'] for l in unit['lessons']))
    unit['bigIdea'] = '按所提供课例的知识主题归档；正式大单元名称与课时顺序待教研组确认。'
    unit['task'] = '查看原始学程设计及关联智能体、工具。'
(root / 'src/kelihua/data/school-materials.json').write_text(json.dumps({'units':list(unit_map.values()),'resources':resources},ensure_ascii=False,indent=2) + '\n')
(root / 'src/kelihua/data/materials-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2) + '\n')
print(f'Imported {len(lessons)} lessons, {len(resources)} resources, {len(unit_map)} themes, {len(manifest)} source files.')

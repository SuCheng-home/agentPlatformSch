import { businessFetch } from '@/utils/fetch';
import { store } from 'auth-layout-wxj';
import { fetch } from '@/utils/api-request';

// 字典接口按应用等级区分租户层级：0 市 1 区 2 校
const DICT_URL_MAP = {
  0: '/common/dict/tenant/city/listByConstantId',
  1: '/common/dict/tenant/area/listByConstantId',
  2: '/common/dict/tenant/unit/listByConstantId'
};

/**
 * 获取学科列表：返回全量学科，业务侧按 typeCode（学段编码）过滤
 * @param {Object} params 查询参数，无筛选条件时传空对象
 */
export function getSubList(schoolId) {
  return businessFetch({
    url: '/wxcep-resource/common/studyResourceAtlas/getSchoolAutonomicResourceAtlsList',
    method: 'get',
    params: { schoolId }
  });
}

/**
 * 系统级别教材列表（分页）：按学段 + 学科筛选，供教材下拉选择
 * @param {Object} params 查询参数，含 pageNober、pageSize、studyLevelCode、subjectCode
 */
export function pageByOrg(atlasId) {
  return businessFetch({
    url: '/wxcep-resource/common/studyResourceAtlas/getGradeAtlasDetailListByAtlasId',
    method: 'get',
    params: { atlasId }
  });
}

/**
 * 获取教材章节树：materialId 缺省时返回全量章节树
 * @param {string} pidAtlasId 教材 ID
 */
export function materialChapterTree(pidAtlasId) {
  return businessFetch({
    url: '/wxcep-resource/common/studyResourceAtlas/findGradeAtlasDetailList',
    method: 'get',
    params: { pidAtlasId }
  });
}

/**
 * 按常量 ID 获取字典项列表
 * @param {number|string|Object} query 常量 ID（见 utils/constantDict.js），或直接传入完整查询参数对象
 * @param {number} type 应用等级，缺省时取环境变量 APP_LEVEL
 */
export function getDictList(query, type = null) {
  const apiType = type || Number(import.meta.env.VITE_APP_LEVEL ?? 2);
  // 本地演示模式下组织信息可能为空，需兜底避免取值报错
  const schoolInfo = store.state.schoolInfo || {};
  const params = query && typeof query === 'object'
    ? query
    : {
      constantId: query,
      orgCode: schoolInfo.orgCode,
      orgType: schoolInfo.orgType,
      tenantId: schoolInfo.tenantId
    };

  return businessFetch({
    url: DICT_URL_MAP[apiType],
    method: 'get',
    params
  });
}

/**
 * 获取腾讯云 COS 临时签名（图片 / 附件上传使用）
 * @param {{ sysBucket?: number }} args sysBucket 1=普通桶 2=系统桶
 * 返回体：{ result, data: '<json string>' }
 */
export function getWxCosFileSign(args = { sysBucket: 1 }) {
  const params = new URLSearchParams();
  params.append('sysBucket', args.sysBucket);
  return fetch({
    url: 'common/getWxCosFileSign',
    method: 'get',
    params
  });
}

/**
 * 记录已上传文件信息（COS 上传成功后调用）
 * 注：该接口用 JSON body（content-type: application/json），schoolId 保持数值类型。
 * 需用 transformRequest 恒等变换覆盖 auth-layout-wxj 实例级 transformRequest，避免 Content-Type 丢失。
 * @param {Object} args { fileId, fileSize, fileUrl, moduleCode, moduleName, schoolId }
 */
export function addWxfileInfo(args = {}) {
  return fetch({
    headers: { 'Content-Type': 'application/json' },
    url: 'common/wxfileInfo/addWxfileInfo',
    method: 'post',
    data: JSON.stringify(args),
    transformRequest: [(d) => d]
  });
}

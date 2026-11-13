import { fetch } from '@/utils/api-request';

const BASE_URL = 'structure/aiSystem';

/**
 * 查询本校平台设置信息（管理端·需登录，用于回显）
 * 返回 data 为单个 AiPlatformSetInfoModel；该校未保存过时为 null
 */
export function getPlatformSetInfo() {
  return fetch({
    url: `${BASE_URL}/aiSetInfo/get`,
    method: 'get',
  });
}

/**
 * 保存平台设置信息（管理端·需登录）
 * 按学校唯一：整行覆盖语义（REPLACE INTO），未传字段会被置为 null，需回显后完整提交
 * @param {Object} data { platformLogo, platformName, platformOptDocs }
 */
export function savePlatformSetInfo(data) {
  return fetch({
    url: `${BASE_URL}/aiSetInfo/save`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest，用恒等变换保留 application/json
    transformRequest: [d => d]
  });
}

/**
 * 查询平台设置信息（公开·非鉴权，供门户/桌面端按学校ID加载 Logo、名称等）
 * @param {string|number} schoolId 学校ID（路径变量）
 */
export function getPublicPlatformSetInfo(schoolId) {
  return fetch({
    url: `common/aiPlatform/${schoolId}/setInfo`,
    method: 'get',
  });
}

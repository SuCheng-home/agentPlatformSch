import { fetch } from '@/utils/api-request';

const BASE_URL = 'structure/aiSystem';

/**
 * Banner 列表（分页）
 * @param {Object} params { pageNo, pageSize, schoolId, bannerTitle }
 */
export function getBannerPageList(params) {
  return fetch({
    url: `${BASE_URL}/aiBanner/pageList`,
    method: 'get',
    params,
  });
}

/**
 * Banner 列表（公开接口·不分页，用于首页展示）
 * @param {Object} params { schoolId, isDelete } 传 isDelete=1 仅取启用中的 Banner
 */
export function getBannerList(params) {
  return fetch({
    url: 'common/aiBanner/list',
    method: 'get',
    params,
  });
}

/**
 * 新增 Banner
 * @param {Object} data { bannerTitle, bannerLogo, bannerLink, sortNo }
 */
export function addBanner(data) {
  return fetch({
    url: `${BASE_URL}/aiBanner/add`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest，用恒等变换保留 application/json
    transformRequest: [d => d]
  });
}

/**
 * 编辑 Banner
 * @param {Object} data { id, bannerTitle, bannerLogo, bannerLink, sortNo }
 */
export function updateBanner(data) {
  return fetch({
    url: `${BASE_URL}/aiBanner/update`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest，用恒等变换保留 application/json
    transformRequest: [d => d]
  });
}

/**
 * 删除 Banner（后端逻辑删除）
 * @param {string} id Banner 主键 ID
 */
export function deleteBanner(id) {
  return fetch({
    url: `${BASE_URL}/aiBanner/delete/${id}`,
    method: 'post',
  });
}

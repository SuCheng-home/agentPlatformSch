import { fetch } from '@/utils/api-request';

const BASE_URL = 'structure/aiSystem';

/**
 * 新增收藏/点赞
 */
export function addFavorite(data) {
  return fetch({
    url: `${BASE_URL}/aiFavorite/add`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest（会把 content-type 移到 method 级导致丢失），
    // 用恒等变换保留 application/json，与 smartSports/examManage-pc 的 JSON POST 保持一致
    transformRequest: [d => d]
  });
}

/**
 * 取消收藏/点赞
 */
export function deleteFavorite(data) {
  return fetch({
    url: `${BASE_URL}/aiFavorite/delete`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest（会把 content-type 移到 method 级导致丢失），
    // 用恒等变换保留 application/json，与 smartSports/examManage-pc 的 JSON POST 保持一致
    transformRequest: [d => d]
  });
}

/**
 * 获取用户收藏/点赞信息
 * @param objectId 收藏/点赞对象的ID
 * @param type 操作类型：1 收藏 2 点赞
 */
export function getUserFavoriteInfo(objectId, type) {
  return fetch({
    url: `${BASE_URL}/aiFavorite/getUserFavoriteInfo`,
    method: 'get',
    params: { objectId, type },
  });
}

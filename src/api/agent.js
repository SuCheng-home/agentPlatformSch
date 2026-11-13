import { fetch } from '@/utils/api-request';

const BASE_URL = 'structure/aiSystem';

/**
 * 管理端 - 智能体列表（分页）
 */
export function getAdminAgentList(params) {
  return fetch({
    url: `${BASE_URL}/aiAgent/admin/list`,
    method: 'get',
    params,
  });
}

/**
 * 教师端 - 获取智能体列表（分页）
 */
export function getAgentPageList(params) {
  return fetch({
    url: `${BASE_URL}/aiAgent/pageList`,
    method: 'get',
    params,
  });
}

/**
 * 获取智能体详情
 */
export function getAgentDetail(id) {
  return fetch({
    url: `${BASE_URL}/aiAgent/get/${id}`,
    method: 'get',
  });
}

/**
 * 新增智能体
 */
export function addAgent(data) {
  return fetch({
    url: `${BASE_URL}/aiAgent/add`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest（会把 content-type 移到 method 级导致丢失），
    // 用恒等变换保留 application/json，与 smartSports/examManage-pc 的 JSON POST 保持一致
    transformRequest: [d => d]
  });
}

/**
 * 修改智能体
 */
export function updateAgent(data) {
  return fetch({
    url: `${BASE_URL}/aiAgent/update`,
    headers: { 'Content-Type': 'application/json' },
    method: 'post',
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest（会把 content-type 移到 method 级导致丢失），
    // 用恒等变换保留 application/json，与 smartSports/examManage-pc 的 JSON POST 保持一致
    transformRequest: [d => d]
  });
}

/**
 * 删除智能体
 */
export function deleteAgent(id) {
  return fetch({
    url: `${BASE_URL}/aiAgent/delete`,
    method: 'get',
    params: { id },
  });
}

/**
 * 获取我的智能体统计信息
 */
export function getMyAgentStats() {
  return fetch({
    url: `${BASE_URL}/aiAgent/myStats`,
    method: 'get'
  });
}


/**
 * 获取当前登录用户收藏的智能体列表（分页）
 */
export function getMyCollectAgentPageList(params) {
  return fetch({
    url: `${BASE_URL}/aiAgent/getMyCollectAgentPageList`,
    method: 'get',
    params,
  });
}

/**
 * 获取使用记录列表（分页）
 * 返回当前用户使用过的智能体列表
 */
export function getUseRecordPageList(params) {
  return fetch({
    url: `${BASE_URL}/aiAgentUseRecord/pageList`,
    method: 'get',
    params,
  });
}

/**
 * 非鉴权 - 获取智能体列表（分页）：用于跳过扫码登录的体验模式
 */
export function getCommonAgentPageList(params) {
  return fetch({
    url: `/common/aiAgent/pageList`,
    method: 'get',
    params,
  });
}

/**
 * 非鉴权 - 获取智能体详情
 */
export function getCommonAgentDetail(id) {
  return fetch({
    url: `/common/aiAgent/get/${id}`,
    method: 'get',
  });
}

/**
 * 非鉴权 - 更新浏览数
 */
export function updateViewNum(id) {
  return fetch({
    url: `/common/aiAgent/updateViewNum`,
    method: 'get',
    params: { id },
  });
}


/**
 * 保存使用记录
 * 用户打开/使用智能体时调用，首次使用新增记录，重复使用更新最近使用时间
 */
export function saveUseRecord(agentId) {
  return fetch({
    url: `${BASE_URL}/aiAgentUseRecord/save`,
    method: 'get',
    params: { agentId },
  });
}

/**
 * 审批智能体（通过 / 驳回）
 * @param {{ id: number|string, approvalStatus: number, reviewComment?: string }} data
 *   approvalStatus: 1=审批通过, 2=审批不通过（与后端 ApproveParams 约定一致）
 */
export function auditAgent(data) {
  return fetch({
    url: `${BASE_URL}/aiAgent/admin/approve`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest（会把 content-type 移到 method 级导致丢失），
    // 用恒等变换保留 application/json，与 smartSports/examManage-pc 的 JSON POST 保持一致
    transformRequest: [d => d]
  });
}

/**
 * 上/下架智能体（管理列表切换发布状态）
 * @param {{ id: number|string, status: number }} data status: 1=上架, 0=下架
 */
export function updateAgentStatus(data) {
  return fetch({
    url: `${BASE_URL}/aiAgent/admin/onOrOffLaunch`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(data),
    // 覆盖 auth-layout-wxj 实例级 transformRequest（会把 content-type 移到 method 级导致丢失），
    // 用恒等变换保留 application/json，与 smartSports/examManage-pc 的 JSON POST 保持一致
    transformRequest: [d => d]
  });
}

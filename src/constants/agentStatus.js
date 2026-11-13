// 审批查询状态（列表接口 approvalStatus 参数）
export const APPROVAL_STATUS_PENDING = 0;   // 待审批
export const APPROVAL_STATUS_MANAGE = 1;    // 管理列表
export const APPROVAL_STATUS_APPROVED = 99; // 已审批

// 审批提交状态（审批接口请求体 approvalStatus 参数，与 ApproveParams 约定一致）
export const APPROVE_PASS = 1;    // 审批通过
export const APPROVE_REJECT = 2;  // 审批不通过

/** 时间格式化：兼容时间戳 / ISO 字符串 */
export function formatTime(val) {
  if (!val) return '-';
  const date = typeof val === 'number' ? new Date(val) : new Date(val);
  if (Number.isNaN(date.getTime())) return String(val);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

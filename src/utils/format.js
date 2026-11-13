// 通用格式化工具

/**
 * 使用次数格式化：大于等于 1 万显示为「x.x万」，否则按千分位显示
 * @param {number} count 使用次数
 * @returns {string} 格式化后的文本
 */
export function formatUses(count) {
  return count >= 10000
    ? `${(count / 10000).toFixed(1)}万`
    : Number(count).toLocaleString('zh-CN');
}

export default formatUses;

// 封面图生成：按应用主题色 + 首字生成 16:9 SVG 封面（离线 data URI，无需外部图片）

// 按系数加深/减淡十六进制颜色，返回 rgb() 字符串
function shade(hex, factor) {
  const num = parseInt(hex.slice(1), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;
}

/**
 * 生成智能体封面 SVG（data URI）
 * @param {Object} agent 智能体数据，需包含 id、color、letter、subject
 * @returns {string} 可直接用于 <img src> 的 data URI
 */
export function createCoverSvg(agent) {
  const color = agent.color;
  const seed = (agent.id * 7919) % 360;
  const subjectLabel = agent.subject === '通用' ? '跨学科通用' : agent.subject;

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
    + `<stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, 0.4)}"/>`
    + '</linearGradient></defs>'
    + '<rect width="320" height="180" fill="url(#g)"/>'
    + `<circle cx="${272 - (seed % 60)}" cy="26" r="72" fill="#ffffff" opacity=".08"/>`
    + `<circle cx="${36 + (seed % 50)}" cy="164" r="92" fill="#ffffff" opacity=".07"/>`
    + '<circle cx="160" cy="90" r="118" fill="none" stroke="#ffffff" opacity=".1" stroke-width="1.5" stroke-dasharray="4 7"/>'
    + `<rect x="${22 + (seed % 28)}" y="${118 - (seed % 22)}" width="44" height="44" rx="10" fill="#ffffff" opacity=".12" `
    + `transform="rotate(${seed % 28 - 14} ${44 + (seed % 28)} ${140 - (seed % 22)})"/>`
    + `<text x="160" y="110" text-anchor="middle" font-size="70" font-weight="800" fill="#ffffff" opacity=".97" font-family="PingFang SC">${agent.letter}</text>`
    + `<text x="160" y="150" text-anchor="middle" font-size="16" fill="#ffffff" opacity=".85" letter-spacing="3" font-family="PingFang SC">${subjectLabel}</text>`
    + '</svg>';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default createCoverSvg;

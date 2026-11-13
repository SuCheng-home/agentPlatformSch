
/**
 * 生成一个uuid
 */
export function uuid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
}

/**
 * 生成一个用不重复的ID， 时间戳+随机数
 */
export function GenNonDuplicateID(randomLength = 6) {
  let idStr = Date.now().toString(36)
  idStr += Math.random().toString(36).substr(3, randomLength)
  return idStr
}

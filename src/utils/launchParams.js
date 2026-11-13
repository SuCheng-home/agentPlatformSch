/**
 * 启动参数持久化工具
 * 微信扫码登录成功后是「整页重定向」回项目，回调地址由后端 redirect_url 决定，只保留 origin + path，
 * 入口 URL 上的 schoolId、skipLogin 会丢失，故需在跳转前缓存、落地后回退读取。
 *
 * 载体选择：以 Cookie 为主、sessionStorage 为辅。
 * 线上入口是 https://www.zhxiaoyuan.cn，而 redirect_url 配的是 http://，scheme 变化即换源，
 * sessionStorage / localStorage 按 origin 隔离会「凭空消失」；Cookie 按 host 存取、不区分协议，可跨这次往返。
 */
import Cookies from 'js-cookie';

/** 启动参数名 → sessionStorage 键映射 */
const LAUNCH_PARAM_KEYS = {
  schoolId: 'desktop_app_school_id',
  skipLogin: 'desktop_app_skip_login'
};

/** 启动参数 Cookie 名 */
const LAUNCH_PARAM_COOKIE = 'AgentPlatformSch-LaunchParams';

/** 启动参数有效期（分钟）：只需覆盖一次扫码回调往返，js-cookie 的 expires 以天为单位 */
const LAUNCH_PARAM_TTL_MINUTES = 30;

/**
 * 从当前地址收集启动参数：
 * 同时兼容参数写在 hash 之后（#/desktop-app?skipLogin=1）与写在 hash 之前（/?skipLogin=1#/desktop-app）两种入口形式
 * @returns {Object} 仅含 URL 中真实存在的参数
 */
function parseUrlParams() {
  const { search, hash } = window.location;
  const hashIndex = hash.indexOf('?');
  const fromHash = new URLSearchParams(hashIndex === -1 ? '' : hash.slice(hashIndex + 1));
  const fromSearch = new URLSearchParams(search);
  const params = {};
  Object.keys(LAUNCH_PARAM_KEYS).forEach((key) => {
    const value = fromHash.get(key) || fromSearch.get(key);
    if (value) params[key] = value;
  });
  return params;
}

/** 读取已缓存的启动参数：Cookie（跨协议/跨源）优先，其次同标签页 sessionStorage */
function readCachedParams() {
  const params = {};
  let cached = {};
  try {
    cached = JSON.parse(Cookies.get(LAUNCH_PARAM_COOKIE) || '{}') || {};
  } catch (e) {
    cached = {};
  }
  Object.keys(LAUNCH_PARAM_KEYS).forEach((key) => {
    const value = cached[key] || sessionStorage.getItem(LAUNCH_PARAM_KEYS[key]);
    if (value) params[key] = value;
  });
  return params;
}

/**
 * 缓存启动参数：URL 上的值覆盖同名旧值，URL 未携带的参数保留已缓存值，
 * 避免回调后 URL 已无参数反而把缓存清空
 */
export function persistLaunchParams() {
  const urlParams = parseUrlParams();
  if (!Object.keys(urlParams).length) return;
  const snapshot = Object.assign(readCachedParams(), urlParams);
  Cookies.set(LAUNCH_PARAM_COOKIE, JSON.stringify(snapshot), {
    expires: LAUNCH_PARAM_TTL_MINUTES / 60 / 24,
    path: '/',
    sameSite: 'Lax'
  });
  Object.keys(LAUNCH_PARAM_KEYS).forEach((key) => {
    if (snapshot[key]) {
      sessionStorage.setItem(LAUNCH_PARAM_KEYS[key], snapshot[key]);
    }
  });
}

/**
 * 读取启动参数：路由 query → 当前地址 → Cookie / sessionStorage 逐级兜底
 * @param {string} key schoolId | skipLogin
 * @param {string} [routeValue] 调用方已取到的 $route.query 值，传入可保证路由变化时重新求值
 * @returns {string} 参数值，无则返回空字符串
 */
export function getLaunchParam(key, routeValue) {
  if (routeValue !== undefined && routeValue !== '') return routeValue;
  const fromUrl = parseUrlParams()[key];
  if (fromUrl) return fromUrl;
  return readCachedParams()[key] || '';
}

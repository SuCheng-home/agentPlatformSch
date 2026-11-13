/**
 * 鉴权工具函数：替代原 auth-layout-zw 的 mixin / getToken / setToken / gotoLoginPage / logoutRmCookies
 * 统一基于 auth-layout-wxj 的 store 与 Cookie 管理
 */
import Cookies from 'js-cookie';
import { store, logOut } from 'auth-layout-wxj';
import { MOCK_DATA_ENABLED } from '@/config/local-preview';
import snapshotMeta from '@/mock/snapshot-meta.json';

// ==================== Token 管理 ====================

const TOKEN_KEY = 'Admin-Token';

/**
 * 获取当前用户 Token
 * @returns {string|undefined}
 */
export function getToken() {
  return store.state.token || Cookies.get(TOKEN_KEY);
}

/**
 * 设置用户 Token（写入 Cookie，供后续请求拦截器自动注入）
 * @param {string} token
 */
export function setToken(token) {
  Cookies.set(TOKEN_KEY, token);
}

/**
 * 移除用户 Token
 */
export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}

// ==================== 登录/登出 ====================

/**
 * 跳转 IDS 登录页，携带当前页面作为回调
 * 开发/联调环境使用 :3600 端口
 */
export function gotoLoginPage() {
  if (MOCK_DATA_ENABLED) {
    return;
  }
  window.location.href = import.meta.env.VITE_LOGIN_URL;
}

/**
 * 退出登录：清除服务端会话与本地 Cookie，然后跳转登录页
 * @returns {Promise<void>}
 */
export async function logoutRmCookies() {
  if (MOCK_DATA_ENABLED) {
    return;
  }
  try {
    await logOut();
  } catch (e) {
    // 接口失败时仍清除本地状态
    removeToken();
  }
}

// ==================== 附件下载 URL 工具 ====================

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || '';

/** 默认头像 URL */
export const defaultAvatarUrl = MOCK_DATA_ENABLED
  ? '/mock-assets/default-avatar.svg'
  : 'https://cdnfile-10043692.file.myqcloud.com/wxcep/default_avatar.png';

/** 本地模式使用已采集的默认学校标识，不访问图片 CDN。 */
export const defaultSchoolLogoUrl = MOCK_DATA_ENABLED
  ? snapshotMeta.defaultLogo
  : 'https://cdnfile-10043692.file.myqcloud.com/productVersion/projects/agentPlatform/djcjzx_logo.jpg';

/**
 * 根据附件 key 获取下载地址（替代原 mixin.getDownloadUrlByAttachmentKey）
 * @param {string} key 附件 key 或完整 URL
 * @returns {string}
 */
export function getDownloadUrlByAttachmentKey(key) {
  if (!key) return '';
  const str = String(key);
  if (str.indexOf('http') === 0) {
    return str;
  }
  return `${BASE_API_URL}/common/attachment/download/${str}`;
}

// 内网私有包 auth-layout-wxj 无法从公共 npm 安装时（如 v0 / CI 预览环境）的替身实现。
// 仅在 node_modules 中缺少真实包时由 vite.config.js 启用；内网安装了真实包时完全不会被使用。
// 不伪造用户、Token 或权限，业务数据仍依赖 VITE_USE_MOCK 本地快照。
import Vue from 'vue';
import axios from 'axios';

const UNAVAILABLE_MESSAGE = '当前环境未安装内网登录组件 auth-layout-wxj，无法使用登录相关功能';

const state = Vue.observable({
  token: '',
  userInfo: null,
  schoolInfo: null,
  permissions: []
});

export const store = {
  state,
  getters: {
    get name() {
      return (state.userInfo && state.userInfo.name) || '';
    },
    get avatar() {
      return (state.userInfo && state.userInfo.avatar) || '';
    }
  },
  commit() {},
  dispatch() {
    return Promise.resolve();
  }
};

export function isShowByPermission(permission) {
  return !permission || state.permissions.includes(permission);
}

export function initApp() {
  return Promise.resolve();
}

export function logOut() {
  state.token = '';
  state.userInfo = null;
  return Promise.resolve();
}

export function getAxiosService(config = {}) {
  const instance = axios.create(config);
  instance.interceptors.response.use((response) => response.data);
  return instance;
}

export const fetch = getAxiosService({ baseURL: import.meta.env.VITE_BASE_API_URL });

export function initCodeByWx() {
  console.warn(`[auth-layout-wxj shim] ${UNAVAILABLE_MESSAGE}`);
}

export function loginByWx() {
  return Promise.reject(new Error(UNAVAILABLE_MESSAGE));
}

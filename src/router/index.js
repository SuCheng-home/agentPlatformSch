import Vue from 'vue';
import Router from 'vue-router';
import store from '../store';
import { getToken, gotoLoginPage } from '@/utils/auth';
import { LOCAL_PREVIEW_ENABLED, MOCK_DATA_ENABLED } from '@/config/local-preview';
import routes from './routes';
import { kelihuaGuard } from '@/kelihua/routes';
import { actions as kelihuaActions } from '@/kelihua/store';

Vue.use(Router);

const router = new Router({ routes });

// 全局前置守卫：默认保留登录校验，仅启用临时本地预览开关时跳过。
router.beforeEach((to, from, next) => {
  // 科利华中学平台使用独立的登录页与权限判断
  if (to.path === '/kelihua' || to.path.startsWith('/kelihua/')) {
    kelihuaGuard(to, from, next);
    return;
  }
  // 临时本地预览：暂停登录拦截与扫码回调跳转，不创建登录态或注入模拟数据。
  if (LOCAL_PREVIEW_ENABLED || MOCK_DATA_ENABLED) {
    next();
    return;
  }
  // 微信扫码回调：整页重定向到项目首页，code 位于 # 之前的 window.location.search；
  // 而换取登录态的逻辑只在 /desktop-app 页的 QrcodeLogin 组件内，故检测到 code 时先重定向过去
  const wxCode = new URLSearchParams(window.location.search).get('code');
  if (wxCode && to.path !== '/desktop-app') {
    // 从科利华登录页发起的扫码，回调后回到科利华登录页完成换取登录态
    next({ path: kelihuaActions.hasQrReturn() ? '/kelihua/login' : '/desktop-app' });
    return;
  }
  if (to.meta.requireAuth && !getToken()) {
    gotoLoginPage();
    next(false);
    return;
  }
  if (getToken()) {
    store.dispatch('agent/initBaseData');
  }
  next();
});

// 根据路由 meta 设置文档标题
router.afterEach((to) => {
  if (to.meta && to.meta.klhTitle) {
    document.title = to.meta.klhTitle;
    return;
  }
  if (to.meta && to.meta.title) {
    // 与 side-nav 的 appName 保持一致：未配置平台名称时默认「AI智能体平台」
    const platformName = store.getters['agent/platformName'] || 'AI智能体平台';
    document.title = `${to.meta.title} · ${platformName}`;
  }
});

export default router;

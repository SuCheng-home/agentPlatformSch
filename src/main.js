import './envSetup'; // ⚠️ 必须第一个引入，设置 auth-layout-wxj 环境
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'auth-layout-components/dist/index/style.css';
import { initApp, store as authStore } from 'auth-layout-wxj';

import App from './App.vue';
import router from './router';
import store from './store';
import { LOCAL_PREVIEW_ENABLED, MOCK_DATA_ENABLED } from '@/config/local-preview';
import { persistLaunchParams } from '@/utils/launchParams';
import '@/styles/global.scss';

Vue.config.productionTip = false;
Vue.use(ElementUI);

// 启动参数（schoolId、skipLogin）先行缓存：扫码/SSO 回调整页重定向后 URL 上的参数会丢失，回调落地时从本地缓存恢复
persistLaunchParams();

// 应用挂载：列表数据由路由组件 mounted 中 syncPage 统一调度加载
function bootstrap() {
  if (MOCK_DATA_ENABLED) {
    store.dispatch('agent/initBaseData');
  }
  new Vue({
    router,
    store,
    beforeCreate() {
      this.$authStore = authStore;
    },
    render: (h) => h(App)
  }).$mount('#app');
}

// 临时本地预览：暂停执行原 initApp() 登录初始化，直接挂载实际业务页面。
// 登录流程保留在 else 分支；关闭 VITE_SKIP_LOGIN 并重启后即可恢复。
if (LOCAL_PREVIEW_ENABLED || MOCK_DATA_ENABLED) {
  bootstrap();
} else {
  initApp()
    .then(bootstrap)
    .catch((error) => {
      console.warn('[agentPlatformSch] 登录初始化失败，业务接口仍需有效会话：', error);
      bootstrap();
    });
}

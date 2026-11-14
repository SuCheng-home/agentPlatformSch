import DefaultLayout from '@/components/layout/default-layout.vue';
import AgentSquare from '@/views/agent-square/index.vue';
import AgentApprove from '@/views/agent-approve/index.vue';
import AgentManage from '@/views/agent-manage/index.vue';
import BannerManage from '@/views/banner-manage/index.vue';
import PlatformSet from '@/views/platform-set/index.vue';
import DesktopApp from '@/views/desktop-app/index.vue';
import AgentShare from '@/views/agent-share/index.vue';
import Manual from '@/views/manual/index.vue';
import { NAV_PAGES } from '@/config/nav';
import kelihuaRoutes from '@/kelihua/routes';

// 特定导航项对应的独立页面组件；未列出的导航项复用「智能体广场」视图
const PAGE_COMPONENT_MAP = {
  approve: AgentApprove,
  manage: AgentManage,
  banner: BannerManage,
  platformSet: PlatformSet
};

/** 由导航叶子项生成主内容区路由 */
function createNavRoute(item) {
  return {
    path: item.key,
    name: item.key,
    component: PAGE_COMPONENT_MAP[item.key] || AgentSquare,
    meta: { title: item.title, page: item.key, requireAuth: true }
  };
}

// 展开导航配置：含 children 的分组项仅生成子路由，叶子项直接映射为路由
const navRoutes = NAV_PAGES.reduce((routes, item) => {
  if (item.children && item.children.length) {
    return routes.concat(item.children.map(createNavRoute));
  }
  routes.push(createNavRoute(item));
  return routes;
}, []);

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/home',
    children: [
      ...navRoutes,
      // 平台使用手册：固定在侧栏底部的菜单页，iframe 内嵌在线文档
      {
        path: 'manual',
        name: 'manual',
        component: Manual,
        meta: { title: '平台使用手册', page: 'manual', requireAuth: true }
      }
    ]
  },
  // 隐藏路由：课堂桌面应用（独立全屏页面，不使用默认布局）
  // 查询参数 skipLogin=1 时，登录页展示「跳过登录，直接体验」按钮
  {
    path: '/desktop-app',
    name: 'desktop-app',
    component: DesktopApp,
    meta: { title: '课堂桌面', hidden: true, requireAuth: false }
  },
  // 隐藏路由：智能体分享预览页（独立全屏，引用 app-preview 组件）
  // 查询参数 ?id=xxx 指定智能体；未登录访问时自动开启体验模式走非鉴权接口
  {
    path: '/agent-share',
    name: 'agent-share',
    component: AgentShare,
    meta: { title: '智能体预览', hidden: true, requireAuth: false }
  },
  // 南京市科利华中学 · 科智汇｜AI矩阵平台（独立登录页与布局，入口 #/kelihua）
  ...kelihuaRoutes,
  { path: '*', redirect: '/home' }
];

export default routes;

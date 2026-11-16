// 南京市科利华中学 · 科智汇｜AI矩阵平台：独立路由，与九中平台的布局、样式互不影响
import './styles/kelihua.scss';
import state, { actions, getters } from './store';

const Login = () => import('./views/login.vue');
const Layout = () => import('./views/Layout.vue');
const Home = () => import('./views/home.vue');
const SubjectMatrix = () => import('./views/subject-matrix.vue');
const LessonDetail = () => import('./views/lesson-detail.vue');
const EducationMatrix = () => import('./views/EducationMatrix.vue');
const CaseMatrix = () => import('./views/case-matrix.vue');
const PromptLibrary = () => import('./views/PromptLibrary.vue');
const BuildCenter = () => import('./views/BuildCenter.vue');
const ReviewCenter = () => import('./views/ReviewCenter.vue');
const CatalogManage = () => import('./views/catalog-manage.vue');

const TITLE = '科智汇｜AI矩阵平台';

/** 科利华路由守卫（由全局 beforeEach 调用）：未登录回到科利华登录页；无权限页面回到学科矩阵 */
export function kelihuaGuard(to, from, next) {
  if (to.path === '/kelihua/login') {
    next();
    return;
  }
  actions.restoreSession();
  if (!state.session.loggedIn) {
    next({ path: '/kelihua/login', query: { redirect: to.fullPath } });
    return;
  }
  const perm = to.meta.klhPermission;
  if (perm && !getters.can(perm)) {
    next('/kelihua/subject');
    return;
  }
  next();
}

const page = (path, component, title, extra = {}) => ({
  path,
  component,
  meta: { title, klhTitle: `${title} · ${TITLE}`, requireAuth: false, hidden: true, ...extra }
});

export const KELIHUA_TITLE = TITLE;

export default [
  {
    path: '/kelihua/login',
    name: 'kelihua-login',
    component: Login,
    meta: { klhTitle: `登录 · ${TITLE}`, requireAuth: false, hidden: true }
  },
  {
    path: '/kelihua',
    component: Layout,
    redirect: '/kelihua/home',
    meta: { requireAuth: false, hidden: true },
    children: [
      page('home', Home, '首页'),
      page('subject', SubjectMatrix, '学科应用矩阵'),
      page('lesson/:id', LessonDetail, '课时详情'),
      page('education', EducationMatrix, '育人管理矩阵'),
      page('course', CaseMatrix, '学程案例矩阵'),
      page('prompts', PromptLibrary, '提示词库'),
      page('build', BuildCenter, '共建中心'),
      page('review', ReviewCenter, '审核发布', { klhPermission: 'review' }),
      page('catalog', CatalogManage, '目录管理', { klhPermission: 'manage' })
    ]
  }
];

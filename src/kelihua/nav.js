import { getters } from './store';

/** 平台栏目：侧边导航与首页快捷入口共用，权限栏目按当前身份动态出现 */
export function navItems() {
  const items = [
    { to: '/kelihua/home', label: '首页', icon: 'building' },
    { to: '/kelihua/subject', label: '学科应用', icon: 'book', matrix: true },
    { to: '/kelihua/education', label: '育人管理', icon: 'heart', matrix: true },
    { to: '/kelihua/course', label: '学程案例', icon: 'route', matrix: true, also: ['/kelihua/lesson'] },
    { to: '/kelihua/prompts', label: '提示词库', icon: 'prompt' },
    { to: '/kelihua/build', label: '共建中心', icon: 'upload' }
  ];
  if (getters.can('review')) {
    items.push({ to: '/kelihua/review', label: '审核发布', icon: 'stamp', badge: getters.pendingForMe().length });
  }
  if (getters.can('manage')) items.push({ to: '/kelihua/catalog', label: '目录管理', icon: 'layers' });
  return items;
}

export function isNavActive(item, path) {
  return [item.to, ...(item.also || [])].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

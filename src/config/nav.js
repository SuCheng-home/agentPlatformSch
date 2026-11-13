// 侧边栏导航配置：叶子项 key 同时作为路由 name、路由 path 与列表筛选模式标识
// icon 对应 constants/icons.js 中的图标名；badge 为 'favorite' 时展示收藏数角标，为 'pendingApproval' 时展示待审批数角标
export const NAV_PAGES = [
  { key: 'home', title: '首页', icon: 'home' },
  { key: 'agents', title: '智能体广场', icon: 'agents' },
  // { key: 'tools', title: '实用工具', icon: 'tools' },
  { key: 'favorites', title: '我的收藏', icon: 'heart', badge: 'favorite' },
  { key: 'created', title: '我创建的', icon: 'users' },
  { key: 'recent', title: '最近使用', icon: 'clock' },
  { key: 'competition', title: '智能体大赛', icon: 'award' },
  {
    key: 'settings',
    title: '智能体管理',
    icon: 'setting',
    permission: '/aiAgent/aiAgentManage',
    children: [
      { key: 'approve', title: '智能体审批', icon: 'audit', badge: 'pendingApproval' },
      { key: 'manage', title: '智能体管理', icon: 'folder' },
      { key: 'banner', title: 'Banner图设置', icon: 'image' },
      { key: 'platformSet', title: '平台设置', icon: 'tools' }
    ]
  }
];

// 页面 key → 标题映射（含子菜单），供视图与路由 meta 复用
export const PAGE_TITLE_MAP = NAV_PAGES.reduce((map, item) => {
  if (item.children && item.children.length) {
    item.children.forEach((child) => {
      map[child.key] = child.title;
    });
  } else {
    map[item.key] = item.title;
  }
  return map;
}, {});

export default NAV_PAGES;

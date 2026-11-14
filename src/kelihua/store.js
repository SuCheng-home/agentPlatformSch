// 科智汇平台状态：会话、资源库、审批流与分类字典
// 当前为前端内存数据，接口就绪后可将 actions 内部替换为 API 调用，组件无需改动。
import Vue from 'vue';
import { getToken } from '@/utils/auth';
import { LOCAL_PREVIEW_ENABLED, MOCK_DATA_ENABLED } from '@/config/local-preview';
import { SUBJECTS, DOMAINS, SCENES, PROMPT_CATEGORIES, GRADES } from './data/taxonomy';
import { buildSeedResources, buildSeedSubmissions } from './data/resources';
import { UNITS } from './data/units';

export const DEMO_MODE = LOCAL_PREVIEW_ENABLED || MOCK_DATA_ENABLED;

export const ROLES = {
  teacher: { label: '教师', name: '陈雨桐', title: '语文教师' },
  reviewer: { label: '教研组长', name: '何静', title: '文科教研组长 · 初审' },
  admin: { label: '平台管理员', name: '周老师', title: '信息中心 · 终审发布' }
};

// 审批流程：教师提交 → 教研组/部门初审 → 平台管理员终审发布
export const APPROVAL_STAGES = [
  { key: 'submit', label: '教师提交' },
  { key: 'first', label: '教研组初审', role: 'reviewer' },
  { key: 'final', label: '管理员终审', role: 'admin' },
  { key: 'publish', label: '发布上架' }
];

const RETURN_FLAG = 'klh_login_return';

const state = Vue.observable({
  session: { loggedIn: false, role: 'teacher' },
  resources: buildSeedResources(),
  submissions: buildSeedSubmissions(),
  units: UNITS,
  subjects: SUBJECTS.map((s) => ({ ...s })),
  domains: DOMAINS.map((d) => ({ ...d })),
  scenes: SCENES,
  grades: GRADES,
  promptCategories: [...PROMPT_CATEGORIES],
  drawer: { open: false, resourceId: null }
});

function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function codePrefix(item) {
  if (item.matrix === 'subject') {
    const s = state.subjects.find((x) => x.key === item.subject);
    return `XK-${s ? s.code : 'QT'}`;
  }
  if (item.matrix === 'education') {
    const d = state.domains.find((x) => x.key === item.domain);
    return `YR-${d ? d.code : 'QT'}`;
  }
  return 'TS';
}

function nextCode(item) {
  const prefix = codePrefix(item);
  const max = state.resources
    .filter((r) => r.code && r.code.startsWith(`${prefix}-`))
    .reduce((m, r) => Math.max(m, parseInt(r.code.split('-').pop(), 10) || 0), 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

/** 同一排序分组：学科矩阵按学科、育人矩阵按领域、提示词按分类 */
export function groupKey(r) {
  if (r.matrix === 'subject') return `subject:${r.subject}`;
  if (r.matrix === 'education') return `education:${r.domain}`;
  return `prompt:${r.category}`;
}

export const getters = {
  role: () => state.session.role,
  roleInfo: () => ROLES[state.session.role],
  can(action) {
    const role = state.session.role;
    if (action === 'review') return role === 'reviewer' || role === 'admin';
    if (action === 'manage') return role === 'admin';
    return true;
  },
  published(filterFn) {
    return state.resources
      .filter((r) => r.status === 'published' && (!filterFn || filterFn(r)))
      .sort((a, b) => a.order - b.order);
  },
  findById: (id) => state.resources.find((r) => r.id === id),
  findAgentByName: (name) => state.resources.find((r) => r.type === 'agent' && r.name === name),
  subjectLabel: (key) => (state.subjects.find((s) => s.key === key) || {}).label || '',
  domainLabel: (key) => (state.domains.find((d) => d.key === key) || {}).label || '',
  sceneLabel: (key) => (state.scenes.find((s) => s.key === key) || {}).label || '',
  /** 提示词库：独立提示词 + 智能体自带的提示词说明 */
  allPrompts() {
    return state.resources
      .filter((r) => r.status === 'published' && r.prompt && (r.type === 'prompt' || r.type === 'agent'))
      .sort((a, b) => a.order - b.order);
  },
  /** 当前角色待处理的审批 */
  pendingForMe() {
    const role = state.session.role;
    return state.submissions.filter((s) => {
      if (s.status !== 'pending') return false;
      if (role === 'admin') return true;
      if (role === 'reviewer') return s.stage === 1;
      return false;
    });
  },
  mySubmissions() {
    const me = ROLES[state.session.role].name;
    return state.submissions.filter((s) => s.author === me || s.mine);
  }
};

export const actions = {
  restoreSession() {
    if (!DEMO_MODE && getToken()) {
      state.session.loggedIn = true;
    }
  },
  demoLogin(role) {
    state.session.role = role;
    state.session.loggedIn = true;
  },
  switchRole(role) {
    state.session.role = role;
  },
  logout() {
    state.session.loggedIn = false;
  },
  /** 微信扫码会整页跳转，回调落地时据此回到科利华登录页而非课堂桌面 */
  markQrReturn() {
    sessionStorage.setItem(RETURN_FLAG, '1');
  },
  consumeQrReturn() {
    const flag = sessionStorage.getItem(RETURN_FLAG) === '1';
    sessionStorage.removeItem(RETURN_FLAG);
    return flag;
  },
  hasQrReturn: () => sessionStorage.getItem(RETURN_FLAG) === '1',

  openResource(id) {
    state.drawer.resourceId = id;
    state.drawer.open = true;
  },
  closeResource() {
    state.drawer.open = false;
  },

  submit(form) {
    const me = ROLES[state.session.role];
    const item = {
      ...form,
      id: `s${Date.now()}`,
      author: me.name,
      dept: me.title,
      mine: true,
      status: 'pending',
      stage: 1,
      submittedAt: now(),
      history: [{ at: now(), who: me.name, action: '提交审核', note: '' }]
    };
    state.submissions.unshift(item);
    return item;
  },
  resubmit(id, form) {
    const s = state.submissions.find((x) => x.id === id);
    if (!s) return;
    Object.assign(s, form, { status: 'pending', stage: 1 });
    s.history.push({ at: now(), who: ROLES[state.session.role].name, action: '修改后重新提交', note: '' });
  },
  approve(id, note) {
    const s = state.submissions.find((x) => x.id === id);
    if (!s) return null;
    const who = `${ROLES[state.session.role].title.split(' · ')[0]} · ${ROLES[state.session.role].name}`;
    if (s.stage === 1) {
      s.stage = 2;
      s.history.push({ at: now(), who, action: '初审通过', note });
      return null;
    }
    s.status = 'published';
    s.stage = 3;
    s.history.push({ at: now(), who, action: '终审通过并发布', note });
    const order = state.resources.reduce((m, r) => Math.max(m, r.order), 0) + 1;
    const published = {
      ...s,
      id: `r${Date.now()}`,
      code: nextCode(s),
      order,
      status: 'published',
      steps: s.type === 'tool'
        ? ['点击「打开工具」进入工具页面', '上传或输入素材', '预览生成结果并下载使用']
        : ['点击「进入使用」打开智能体对话', '按提示输入关键信息', '根据输出继续追问或调整'],
      featured: false
    };
    state.resources.push(published);
    s.publishedId = published.id;
    s.publishedCode = published.code;
    return published;
  },
  reject(id, note) {
    const s = state.submissions.find((x) => x.id === id);
    if (!s) return;
    s.status = 'rejected';
    const who = `${ROLES[state.session.role].title.split(' · ')[0]} · ${ROLES[state.session.role].name}`;
    s.history.push({ at: now(), who, action: '退回修改', note });
  },

  /** 在同一分组内上移/下移 */
  move(id, dir) {
    const r = state.resources.find((x) => x.id === id);
    if (!r) return;
    const group = getters.published((x) => groupKey(x) === groupKey(r));
    const idx = group.findIndex((x) => x.id === id);
    const target = group[idx + dir];
    if (!target) return;
    const tmp = r.order;
    r.order = target.order;
    target.order = tmp;
  },
  updateResource(id, patch) {
    const r = state.resources.find((x) => x.id === id);
    if (!r) return;
    const regroup = ['matrix', 'subject', 'domain', 'category'].some((k) => k in patch && patch[k] !== r[k]);
    Object.assign(r, patch);
    if (regroup && !patch.code) r.code = nextCode(r);
  },
  setOffline(id, offline) {
    const r = state.resources.find((x) => x.id === id);
    if (r) r.status = offline ? 'offline' : 'published';
  },
  renumberGroup(key) {
    const group = state.resources
      .filter((r) => groupKey(r) === key && r.status !== 'rejected')
      .sort((a, b) => a.order - b.order);
    const prefix = group.length ? codePrefix(group[0]) : '';
    group.forEach((r, i) => {
      r.code = `${prefix}-${String(i + 1).padStart(3, '0')}`;
    });
  },
  addCategory(kind, label) {
    const text = label.trim();
    if (!text) return false;
    if (kind === 'subject') {
      if (state.subjects.some((s) => s.label === text)) return false;
      state.subjects.push({ key: `s${Date.now()}`, label: text, code: 'QT' });
    } else if (kind === 'domain') {
      if (state.domains.some((d) => d.label === text)) return false;
      state.domains.push({ key: `d${Date.now()}`, label: text, code: 'QT', hint: '新增领域，待补充说明', planned: true });
    } else {
      if (state.promptCategories.includes(text)) return false;
      state.promptCategories.push(text);
    }
    return true;
  },
  renameCategory(kind, key, label) {
    const text = label.trim();
    if (!text) return;
    if (kind === 'subject') {
      const s = state.subjects.find((x) => x.key === key);
      if (s) s.label = text;
    } else if (kind === 'domain') {
      const d = state.domains.find((x) => x.key === key);
      if (d) d.label = text;
    } else {
      const i = state.promptCategories.indexOf(key);
      if (i > -1) {
        state.resources.forEach((r) => {
          if (r.category === key) r.category = text;
        });
        state.promptCategories.splice(i, 1, text);
      }
    }
  },
  setCategoryCode(kind, key, code) {
    const list = kind === 'subject' ? state.subjects : state.domains;
    const item = list.find((x) => x.key === key);
    if (item) item.code = code.trim().toUpperCase() || item.code;
  }
};

export default state;

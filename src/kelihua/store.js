// 科智汇平台状态：会话、资源库、审批流与分类字典
// 课例与资源来自学校原件；资源和目录设置保存在当前浏览器，审批流程仅供本地演示。
import Vue from 'vue';
import { getToken } from '@/utils/auth';
import { LOCAL_PREVIEW_ENABLED, MOCK_DATA_ENABLED } from '@/config/local-preview';
import { SUBJECTS, DOMAINS, SCENES, PROMPT_CATEGORIES, GRADES } from './data/taxonomy';
import { buildSeedResources, buildSeedSubmissions } from './data/resources';
import { UNITS } from './data/units';
import { LESSON_UNITS } from './data/lessons';
import { copyContent } from './utils/resources';

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
const CATALOG_STORAGE_KEY = 'kelihua-catalog-v1';
const DEMO_SESSION_KEY = 'kelihua-demo-session';
const CATALOG_FIELDS = ['code', 'order', 'name', 'desc', 'subject', 'scene', 'domain', 'category', 'unitId', 'unitTitle', 'type', 'prompt', 'persona', 'reply', 'status', 'matrix', 'author', 'dept', 'url', 'availability', 'sourceName'];

function loadResources() {
  const resources = buildSeedResources();
  try {
    const saved = JSON.parse(localStorage.getItem(CATALOG_STORAGE_KEY) || '{}');
    Object.entries(saved).forEach(([id, item]) => {
      if (/^r\d+$/.test(id) && item && ['agent', 'tool', 'prompt'].includes(item.type) && typeof item.name === 'string') {
        resources.push({ id, name: item.name, type: item.type, code: '', order: 1, matrix: 'subject', status: 'published', grades: [], steps: [], prompt: '', persona: '', reply: '', unitId: '', unitTitle: '' });
      }
    });
    resources.forEach((resource) => {
      const patch = saved[resource.id];
      if (!patch || typeof patch !== 'object') {
        return;
      }
      if (Array.isArray(patch.grades)) {
        resource.grades = patch.grades.filter((grade) => typeof grade === 'string');
      }
      CATALOG_FIELDS.forEach((key) => {
        if (key === 'order' && Number.isSafeInteger(patch[key]) && patch[key] > 0) {
          resource[key] = patch[key];
        } else if (key !== 'order' && typeof patch[key] === 'string') {
          resource[key] = patch[key];
        }
      });
    });
  } catch {
    // 浏览器存储不可用或旧数据损坏时仍展示原始资料。
  }
  return resources;
}

function loadCategories(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(CATALOG_STORAGE_KEY) || '{}');
    const list = saved.categories && saved.categories[key];
    const valid = Array.isArray(list) && list.every((item) => key === 'promptCategories'
      ? typeof item === 'string'
      : item && ['key', 'label', 'code'].every((field) => typeof item[field] === 'string'));
    if (valid) {
      return list;
    }
  } catch {
    // 目录损坏时恢复原始分类，不阻止页面加载。
  }
  return fallback.map((item) => typeof item === 'string' ? item : { ...item });
}

function persistCatalog() {
  const saved = Object.fromEntries(state.resources.map((resource) => [
    resource.id,
    { ...Object.fromEntries(CATALOG_FIELDS.filter((key) => key in resource).map((key) => [key, resource[key]])), grades: resource.grades || [] }
  ]));
  try {
    saved.categories = { subjects: state.subjects, domains: state.domains, promptCategories: state.promptCategories };
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(saved));
    state.catalogStorageError = '';
  } catch {
    state.catalogStorageError = '浏览器保存失败，修改仅在本次页面有效。';
  }
}

const state = Vue.observable({
  session: { loggedIn: false, role: 'teacher' },
  resources: loadResources(),
  catalogStorageError: '',
  submissions: buildSeedSubmissions(),
  units: UNITS,
  lessonUnits: LESSON_UNITS,
  subjects: loadCategories('subjects', SUBJECTS),
  domains: loadCategories('domains', DOMAINS),
  scenes: SCENES,
  grades: GRADES,
  promptCategories: loadCategories('promptCategories', PROMPT_CATEGORIES),
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
      .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code, 'zh-CN', { numeric: true }));
  },
  findById: (id) => state.resources.find((r) => r.id === id),
  findAgentByName: (name) => state.resources.find((r) => r.type === 'agent' && r.name === name),
  subjectLabel: (key) => (state.subjects.find((s) => s.key === key) || {}).label || '',
  domainLabel: (key) => (state.domains.find((d) => d.key === key) || {}).label || '',
  sceneLabel: (key) => (state.scenes.find((s) => s.key === key) || {}).label || '',
  /**
   * 按稳定的原件标识查找真实课例。
   */
  findLesson(id) {
    for (const u of state.lessonUnits) {
      const lesson = u.lessons.find((l) => l.id === id);
      if (lesson) return { lesson, unit: u, siblings: u.lessons, source: 'subject' };
    }
    return null;
  },
  /** 提示词库：独立提示词 + 智能体自带的提示词说明 */
  allPrompts() {
    return state.resources
      .filter((r) => r.status === 'published' && copyContent(r))
      .map((resource) => ({ ...resource, prompt: copyContent(resource) }))
      .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code, 'zh-CN', { numeric: true }));
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
    if (DEMO_MODE) {
      try {
        const role = sessionStorage.getItem(DEMO_SESSION_KEY);
        if (Object.prototype.hasOwnProperty.call(ROLES, role)) {
          state.session = { loggedIn: true, role };
        }
      } catch {
        state.session.loggedIn = false;
      }
    }
    if (!DEMO_MODE && getToken()) {
      state.session.loggedIn = true;
    }
  },
  demoLogin(role) {
    if (!Object.prototype.hasOwnProperty.call(ROLES, role)) {
      return;
    }
    try {
      sessionStorage.setItem(DEMO_SESSION_KEY, role);
    } catch {
      // 无存储权限时允许本次预览。
    }
    state.session.role = role;
    state.session.loggedIn = true;
  },
  switchRole(role) {
    if (DEMO_MODE) {
      actions.demoLogin(role);
    }
  },
  logout() {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
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
    published.availability = '本地共建条目 · 外部服务待验证';
    published.sourceName = '教师本机提交（未同步到服务器）';
    state.resources.push(published);
    persistCatalog();
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
    if (!getters.can('manage')) {
      return;
    }
    const r = state.resources.find((x) => x.id === id);
    if (!r) return;
    const group = getters.published((x) => groupKey(x) === groupKey(r));
    const idx = group.findIndex((x) => x.id === id);
    const target = group[idx + dir];
    if (!target) return;
    group.splice(idx, 1);
    group.splice(idx + dir, 0, r);
    group.forEach((item, index) => { item.order = index + 1; });
    persistCatalog();
  },
  setOrder(id, order) {
    if (!getters.can('manage') || !Number.isSafeInteger(order) || order < 1 || order > 999999) {
      return false;
    }
    const resource = getters.findById(id);
    if (!resource) {
      return false;
    }
    resource.order = order;
    persistCatalog();
    return true;
  },
  sortByCode(key) {
    if (!getters.can('manage')) {
      return;
    }
    state.resources.filter((resource) => groupKey(resource) === key)
      .sort((first, second) => first.code.localeCompare(second.code, 'zh-CN', { numeric: true }))
      .forEach((resource, index) => { resource.order = index + 1; });
    persistCatalog();
  },
  updateResource(id, patch) {
    if (!getters.can('manage')) {
      return;
    }
    const r = state.resources.find((x) => x.id === id);
    if (!r) return;
    const regroup = ['matrix', 'subject', 'domain', 'category'].some((k) => k in patch && patch[k] !== r[k]);
    Object.assign(r, patch);
    if (regroup && !patch.code) r.code = nextCode(r);
    persistCatalog();
  },
  setOffline(id, offline) {
    if (!getters.can('manage')) {
      return;
    }
    const r = state.resources.find((x) => x.id === id);
    if (r) r.status = offline ? 'offline' : 'published';
    persistCatalog();
  },
  renumberGroup(key) {
    if (!getters.can('manage')) {
      return;
    }
    const group = state.resources
      .filter((r) => groupKey(r) === key && r.status !== 'rejected')
      .sort((a, b) => a.order - b.order || a.code.localeCompare(b.code, 'zh-CN', { numeric: true }));
    const prefix = group.length ? codePrefix(group[0]) : '';
    group.forEach((r, i) => {
      r.code = `${prefix}-${String(i + 1).padStart(3, '0')}`;
    });
    persistCatalog();
  },
  addCategory(kind, label) {
    if (!getters.can('manage')) {
      return false;
    }
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
    persistCatalog();
    return true;
  },
  renameCategory(kind, key, label) {
    if (!getters.can('manage')) {
      return false;
    }
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
    persistCatalog();
  },
  setCategoryCode(kind, key, code) {
    if (!getters.can('manage')) {
      return false;
    }
    const list = kind === 'subject' ? state.subjects : state.domains;
    const item = list.find((x) => x.key === key);
    if (item) item.code = code.trim().toUpperCase() || item.code;
    persistCatalog();
  }
};

export default state;

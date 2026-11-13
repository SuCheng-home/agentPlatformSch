import snapshot from './snapshot.json';
import snapshotMeta from './snapshot-meta.json';

const STORAGE_KEY = 'agent-platform-sch-local-demo-v1';
const clone = (value) => JSON.parse(JSON.stringify(value));

/** 本地操作独立保存；初始私人收藏、最近使用与本人创建列表均为空，不冒充线上用户数据。 */
function createState() {
  return {
    snapshotVersion: snapshotMeta.capturedAt,
    agents: clone(snapshot.agents),
    banners: clone(snapshot.banners),
    favorites: [],
    recent: [],
    owned: [],
    // 来源学校未设置平台资料；复用页面已有默认名称和本地默认标识用于表单演示，不伪装成线上配置。
    platform: { platformName: 'AI智能体平台', platformLogo: snapshot.defaultLogo, platformOptDocs: '' }
  };
}

function readState() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (value && value.snapshotVersion === snapshotMeta.capturedAt && Array.isArray(value.agents) && Array.isArray(value.favorites)
      && Array.isArray(value.recent) && Array.isArray(value.owned) && Array.isArray(value.banners)) {
      return value;
    }
  } catch {
    // 本地存储不可用或历史数据损坏时从原始快照重新开始。
  }
  return createState();
}

let demoState;

function getState() {
  if (!demoState) {
    demoState = readState();
  }
  return demoState;
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
  } catch {
    // 存储被禁用时仍允许当前页面会话内演示，不向远端同步。
  }
}

function respond(data = null) {
  return { result: true, code: 200, msg: '本地模拟操作，未提交线上', data: clone(data) };
}

function containsValue(raw, value) {
  return String(raw || '').split(',').includes(String(value));
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function paginate(rows, params) {
  const pageNo = Math.max(1, Number(params.pageNo) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 20);
  return {
    dataList: rows.slice((pageNo - 1) * pageSize, pageNo * pageSize),
    pagination: { pageNo, pageSize, total: rows.length, hasNextPage: pageNo * pageSize < rows.length }
  };
}

function listAgents(path, params) {
  const state = getState();
  let rows = state.agents.map((row) => ({
    ...row,
    selfIsFavorite: state.favorites.includes(String(row.id)) ? 2 : 1
  }));
  if (path.endsWith('getMyCollectAgentPageList')) {
    rows = rows.filter((row) => state.favorites.includes(String(row.id)));
  } else if (path.endsWith('aiAgentUseRecord/pageList')) {
    rows = rows.filter((row) => state.recent.includes(String(row.id)));
  } else if (path.endsWith('structure/aiSystem/aiAgent/pageList')) {
    rows = rows.filter((row) => state.owned.includes(String(row.id)));
  }
  rows = rows.filter((row) => {
    if (params.name && !String(row.name || '').toLowerCase().includes(String(params.name).trim().toLowerCase())) {
      return false;
    }
    const fields = { agentType: 'agentType', publishStatus: 'publishStatus', schoolId: 'schoolId' };
    const exactMatch = Object.keys(fields).every((key) => !hasValue(params[key]) || String(row[fields[key]]) === String(params[key]));
    const codes = { subjectCode: 'subjectCodes', materialId: 'materialIds', chapterId: 'chapterIds', gradeCode: 'gradeCodes' };
    const codeMatch = Object.keys(codes).every((key) => !hasValue(params[key]) || containsValue(row[codes[key]], params[key]));
    const approvalMatch = !hasValue(params.approvalStatus)
      || (Number(params.approvalStatus) === 99 ? [1, 2].includes(Number(row.approvalStatus)) : Number(row.approvalStatus) === Number(params.approvalStatus));
    return exactMatch && codeMatch && approvalMatch;
  });
  const sortKey = params.orderBy === 'create_time' ? 'createTime' : params.orderBy || 'createTime';
  const direction = params.orderDirection === 'asc' ? 1 : -1;
  rows.sort((left, right) => {
    if (path.endsWith('aiAgentUseRecord/pageList')) {
      return state.recent.indexOf(String(left.id)) - state.recent.indexOf(String(right.id));
    }
    const leftValue = left[sortKey] ?? '';
    const rightValue = right[sortKey] ?? '';
    return (typeof leftValue === 'number' ? leftValue - rightValue : String(leftValue).localeCompare(String(rightValue))) * direction;
  });
  return respond(paginate(rows, params));
}

function findAgent(id) {
  const row = getState().agents.find((item) => String(item.id) === String(id));
  if (!row) {
    throw new Error('本地快照中没有该资源，未请求线上接口。');
  }
  return row;
}

function handleAgentWrite(path, params, data) {
  const state = getState();
  const id = String(data.id || params.id || '');
  if (path.endsWith('/aiAgent/add')) {
    const row = { ...data, id: `local-${Date.now()}`, createTime: new Date().toISOString(), authorName: '本地演示创建' };
    state.agents.unshift(row);
    state.owned.push(row.id);
    persistState();
    return respond(row);
  }
  const row = findAgent(id);
  if (path.endsWith('/delete')) {
    state.agents = state.agents.filter((item) => String(item.id) !== id);
    state.favorites = state.favorites.filter((item) => item !== id);
    state.recent = state.recent.filter((item) => item !== id);
    state.owned = state.owned.filter((item) => item !== id);
  } else if (path.endsWith('/approve')) {
    Object.assign(row, { approvalStatus: Number(data.approvalStatus), reviewComment: data.reviewComment || '' });
  } else if (path.endsWith('/onOrOffLaunch')) {
    const publishStatus = Number(data.publishStatus ?? data.status);
    if (![0, 1].includes(publishStatus)) {
      throw new Error('本地模拟上下架状态无效。');
    }
    row.publishStatus = publishStatus;
  } else {
    Object.assign(row, data);
  }
  persistState();
  return respond(row);
}

function validateLocalImages(data) {
  for (const field of ['platformLogo', 'bannerLogo']) {
    if (data[field] && !String(data[field]).startsWith('/mock-assets/')) {
      throw new Error('本地模拟仅支持已保存的本地图片，外部图片尚未接入。');
    }
  }
}

/** 只处理项目已知请求，未知路径直接报出未接入，绝不回退线上请求。 */
export function handleMockRequest(config) {
  const path = String(config.url || '').replace(/^\//, '');
  const params = config.params instanceof URLSearchParams ? Object.fromEntries(config.params) : config.params || {};
  const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  const state = getState();
  if (/aiAgent\/(admin\/list|pageList|getMyCollectAgentPageList)$|aiAgentUseRecord\/pageList$/.test(path)) {
    return listAgents(path, params);
  }
  if (/aiAgent\/get\/[^/]+$/.test(path)) {
    const row = findAgent(path.split('/').pop());
    return respond({ ...row, selfIsFavorite: state.favorites.includes(String(row.id)) ? 2 : 1 });
  }
  if (path.endsWith('aiAgent/myStats')) {
    return respond({ favoriteCount: state.favorites.length });
  }
  if (path.endsWith('aiFavorite/getUserFavoriteInfo')) {
    return respond(state.favorites.includes(String(params.objectId)) ? { objectId: params.objectId } : null);
  }
  if (/aiFavorite\/(add|delete)$/.test(path)) {
    const id = String(data.objectId);
    findAgent(id);
    const previous = state.favorites.includes(id);
    const favorite = path.endsWith('/add');
    state.favorites = state.favorites.filter((value) => value !== id);
    if (favorite) {
      state.favorites.push(id);
    }
    if (favorite !== previous) {
      const row = findAgent(id);
      row.favoriteCount = Math.max(0, Number(row.favoriteCount || 0) + (favorite ? 1 : -1));
    }
    persistState();
    return respond();
  }
  if (path.endsWith('aiAgentUseRecord/save') || path.endsWith('aiAgent/updateViewNum')) {
    const id = String(params.agentId || params.id);
    const row = findAgent(id);
    state.recent = [id, ...state.recent.filter((value) => value !== id)];
    row.lastUseTime = new Date().toISOString();
    row.useCount = Number(row.useCount || 0) + 1;
    persistState();
    return respond();
  }
  if (/aiAgent\/(add|update|delete|admin\/approve|admin\/onOrOffLaunch)$/.test(path)) {
    return handleAgentWrite(path, params, data);
  }
  if (path.endsWith('aiBanner/list')) {
    return respond(state.banners.filter((row) => !hasValue(params.schoolId) || String(row.schoolId) === String(params.schoolId)));
  }
  if (path.endsWith('aiBanner/pageList')) {
    return respond(paginate(state.banners.filter((row) => (!params.bannerTitle || row.bannerTitle.includes(params.bannerTitle))
      && (!hasValue(params.schoolId) || String(row.schoolId) === String(params.schoolId))), params));
  }
  if (/aiBanner\/(add|update)$/.test(path)) {
    validateLocalImages(data);
    const row = data.id ? state.banners.find((item) => String(item.id) === String(data.id)) : null;
    if (data.id && !row) {
      throw new Error('本地快照中没有该 Banner。');
    }
    if (row) {
      Object.assign(row, data);
    } else {
      state.banners.push({ ...data, id: `local-banner-${Date.now()}` });
    }
    persistState();
    return respond();
  }
  if (/aiBanner\/delete\/[^/]+$/.test(path)) {
    state.banners = state.banners.filter((row) => String(row.id) !== path.split('/').pop());
    persistState();
    return respond();
  }
  if (path.endsWith('aiSetInfo/save')) {
    validateLocalImages(data);
    state.platform = data;
    persistState();
    return respond(data);
  }
  if (path.endsWith('aiSetInfo/get') || /common\/aiPlatform\/[^/]+\/setInfo$/.test(path)) {
    return respond(state.platform);
  }
  if (path.endsWith('getSchoolAutonomicResourceAtlsList')) {
    return respond(snapshot.subjects);
  }
  if (path.endsWith('getGradeAtlasDetailListByAtlasId')) {
    return respond(snapshot.materials[params.atlasId] || []);
  }
  if (path.endsWith('findGradeAtlasDetailList')) {
    return respond(snapshot.chapters[params.pidAtlasId] || []);
  }
  throw new Error('此功能尚未接入本地模拟：上传和外部服务不会调用线上接口。');
}

import { getMyAgentStats } from '@/api/agent';
import { getToken } from '@/utils/auth';
import { getSubList } from '@/api/common';
import { getPlatformSetInfo, getPublicPlatformSetInfo } from '@/api/platformSet';
import { MOCK_DATA_ENABLED } from '@/config/local-preview';
import {
  getAdminAgentList,
  getAgentPageList,
  getMyCollectAgentPageList,
  getUseRecordPageList,
  getCommonAgentPageList,
} from '@/api/agent';
import { APPROVAL_STATUS_PENDING } from '@/constants/agentStatus';
import { store } from 'auth-layout-wxj';

// 默认筛选值：学科为「全部」，其余层级为「不限」
function createDefaultFilters() {
  return { subjectCode: '', gradeCode: '', materialId: '', chapterId: '', agentType: '' };
}

const DEFAULT_ORDER_BY = 'create_time';

const agent = {
  namespaced: true,

  state: {
    agents: [],
    favoriteCount: 0,
    // 待审批数量（侧边栏“智能体审批”菜单角标）
    pendingApprovalCount: 0,
    keyword: '',
    filters: createDefaultFilters(),
    // 排序类型：'' 默认（按创建时间）、favorite 按收藏次数、use 按使用次数
    sortType: '',
    page: 'home',
    uploadVisible: false,
    subjectList: [],
    initStatus: 0,
    currentPage: 1,
    pageSize: 20,
    total: 0,
    // 下拉加载进行中标志，防止重复触发分页请求
    loading: false,
    editAgent: null,
    // 管理员编辑标记：为 true 时编辑提交保持 approvalStatus=1（无需重新审批）
    adminEdit: false,
    // 体验模式：跳过扫码登录访问，列表等接口切换到非鉴权端点
    guestMode: false,
    schoolId: '',
    // 平台基础配置（Logo/名称/操作手册）：来源非鉴权公开接口，按学校维度、每校一条
    platformSetInfo: null,
  },

  getters: {
    // 结果数量
    resultCount: (state) => state.total,
    // 收藏数量（侧边栏角标）
    favoriteCount: (state) => state.favoriteCount,
    // 待审批数量（侧边栏“智能体审批”菜单角标）
    pendingApprovalCount: (state) => state.pendingApprovalCount,
    subjectList(state) {
      return state.subjectList;
    },
    schoolId: (state) => state.schoolId || store.getters.schoolId,
    // 平台基础配置派生值：未设置时为空串，消费方需自备默认 Logo/名称
    platformLogo: (state) => (state.platformSetInfo && state.platformSetInfo.platformLogo) || '',
    platformName: (state) => (state.platformSetInfo && state.platformSetInfo.platformName) || '',
    platformOptDocs: (state) => (state.platformSetInfo && state.platformSetInfo.platformOptDocs) || '',
  },

  mutations: {
    SET_AGENTS(state, list) {
      state.agents = list;
    },
    // 下拉加载：追加下一页数据到现有列表
    APPEND_AGENTS(state, list) {
      state.agents = state.agents.concat(list);
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    // 卡片收藏状态回写：整体替换列表项对象，保证卡片依 prop 变化重新渲染
    UPDATE_AGENT_FAVORITE(state, { id, selfIsFavorite }) {
      state.agents = state.agents.map((item) => (item.id === id ? { ...item, selfIsFavorite } : item));
    },
    SET_KEYWORD(state, keyword) {
      state.keyword = keyword;
    },
    SET_PAGE(state, page) {
      state.page = page;
    },
    // 层级联动：学科变化→重置年级/期次/章节；年级变化→重置期次/章节；期次变化→重置章节
    SET_FILTER(state, { type, value }) {
      state.filters[type] = value;
    },
    SET_SORT_TYPE(state, sortType) {
      state.sortType = sortType;
    },
    RESET_FILTERS(state) {
      state.filters = createDefaultFilters();
      state.sortType = '';
      state.keyword = '';
    },
    SET_UPLOAD_VISIBLE(state, visible) {
      state.uploadVisible = visible;
    },
    SET_SUBJECT_LIST(state, list) {
      state.subjectList = list;
    },
    SET_INIT_STATUS(state, status) {
      state.initStatus = status;
    },
    SET_PAGINATION(state, { currentPage, pageSize, total }) {
      if (currentPage !== undefined) state.currentPage = currentPage;
      if (pageSize !== undefined) state.pageSize = pageSize;
      if (total !== undefined) state.total = total;
    },
    RESET_PAGINATION(state) {
      state.currentPage = 1;
      state.pageSize = 20;
      state.total = 0;
    },
    SET_FAVORITE_COUNT(state, count) {
      state.favoriteCount = count;
    },
    SET_PENDING_APPROVAL_COUNT(state, count) {
      state.pendingApprovalCount = count;
    },
    SET_EDIT_AGENT(state, agent) {
      state.editAgent = agent;
    },
    SET_ADMIN_EDIT(state, adminEdit) {
      state.adminEdit = adminEdit;
    },
    SET_GUEST_MODE(state, guestMode) {
      state.guestMode = guestMode;
    },
    SET_SCHOOL_ID(state, schoolId) {
      state.schoolId = schoolId;
    },
    SET_PLATFORM_SET_INFO(state, info) {
      state.platformSetInfo = info || null;
    }
  },

  actions: {
    searchAgents({ commit, dispatch }) {
      commit('SET_PAGINATION', { currentPage: 1 })
      dispatch('loadAgents');
    },
    // 根据当前页面类型调用对应接口加载智能体列表；append 为 true 时追加数据（下拉加载）
    async loadAgents({ commit, state }, { append = false } = {}) {
      const page = state.page;
      let requestFn;
      const queryObj = {
        name: state.keyword,
        ...state.filters,
        publishStatus: 1,
        orderBy: state.sortType || DEFAULT_ORDER_BY,
        orderDirection: 'desc',
        pageNo: state.currentPage,
        pageSize: state.pageSize,
      }
      if (page === 'favorites') {
        requestFn = getMyCollectAgentPageList;
      } else if (page === 'created') {
        requestFn = getAgentPageList;
        Reflect.deleteProperty(queryObj, 'publishStatus');
      } else if (page === 'recent') {
        requestFn = getUseRecordPageList;
      } else if (page === 'agents') {
        requestFn = getAdminAgentList;
      } else if (state.guestMode) {
        // 桌面端首页：体验模式走非鉴权列表接口
        requestFn = getCommonAgentPageList;
        queryObj.schoolId = state.schoolId || store.getters.schoolId
      } else {
        requestFn = getAdminAgentList;
      }

      commit('SET_LOADING', true);
      try {
        const res = await requestFn(queryObj);
        const list = res.data.dataList || [];
        const total = res.data.pagination.total
        if (page === 'favorites') {
          // 设置收藏状态为2（已收藏）
          list.forEach((item) => {
            item.selfIsFavorite = 2;
          });
        }
        if (append) {
          commit('APPEND_AGENTS', list);
        } else {
          commit('SET_AGENTS', list);
        }
        commit('SET_PAGINATION', { total });
      } catch (error) {
        console.warn('[loadAgents] 获取智能体列表失败：', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    // 下拉加载下一页：加载中、首屏为空或已全部加载时不触发
    async loadMoreAgents({ commit, state, dispatch }) {
      if (state.loading) return;
      if (state.agents.length === 0) return;
      if (state.total > 0 && state.agents.length >= state.total) return;
      commit('SET_PAGINATION', { currentPage: state.currentPage + 1 });
      await dispatch('loadAgents', { append: true });
    },
    // 重载列表：回到第一页并替换数据（筛选、增删改后的刷新）
    reloadAgents({ commit, dispatch }) {
      commit('SET_PAGINATION', { currentPage: 1 });
      dispatch('loadAgents');
    },
    initBaseData({ dispatch, commit, state }) {
      if (state.initStatus === 1) return;
      commit('SET_INIT_STATUS', 1)
      dispatch('loadSubjectList');
      // 平台基础配置：非鉴权公开接口，登录态与体验模式均可加载
      dispatch('loadPlatformSetInfo');
      // 已登录
      if (getToken() || MOCK_DATA_ENABLED) {
        dispatch('loadAgentStats');
      }
    },
    // 获取平台基础配置（Logo/名称/操作手册）：按学校ID查询非鉴权公开接口
    loadPlatformSetInfo({ commit, getters }) {
      const schoolId = getters.schoolId;
      if (!schoolId && !MOCK_DATA_ENABLED) return;
      const request = MOCK_DATA_ENABLED ? getPlatformSetInfo() : getPublicPlatformSetInfo(schoolId);
      request
        .then((res) => {
          commit('SET_PLATFORM_SET_INFO', (res && res.data) || null);
        })
        .catch((error) => {
          console.warn('[loadPlatformSetInfo] 获取平台基础配置失败：', error);
        });
    },
    loadAgentStats({ commit }) {
      getMyAgentStats()
        .then((res) => {
          commit('SET_FAVORITE_COUNT', res.data.favoriteCount)
        })
        .catch((error) => {
          console.warn(error);
        });
    },
    // 拉取待审批总数：仅取分页 total，用于侧边栏“智能体审批”菜单角标
    loadPendingApprovalCount({ commit }) {
      getAdminAgentList({
        approvalStatus: APPROVAL_STATUS_PENDING,
        pageNo: 1,
        pageSize: 1
      })
        .then((res) => {
          const total = (res && res.data && res.data.pagination && res.data.pagination.total) || 0;
          commit('SET_PENDING_APPROVAL_COUNT', total);
        })
        .catch((error) => {
          console.warn('[loadPendingApprovalCount] 获取待审批总数失败：', error);
        });
    },
    setSchoolId({ commit }, schoolId) {
      commit('SET_SCHOOL_ID', schoolId);
    },
    // 获取学科列表：接口返回全量学科，展示时按学段过滤
    loadSubjectList({ commit, state }) {
      getSubList(state.schoolId || store.getters.schoolId)
        .then((res) => {
          commit('SET_SUBJECT_LIST', res.data || [])
        })
        .catch((error) => {
          console.warn('[UploadDialog] 获取学科列表失败，回退内置学科：', error);
        });
    }
  }
};

export default agent;

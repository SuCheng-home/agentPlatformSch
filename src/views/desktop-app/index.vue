<template>
  <div class="desktop-app">
    <!-- 登录页（品牌 + 扫码 + 进入） -->
    <div v-show="showLogin" class="login-view" :class="{ leaving: loginLeaving }">
      <div class="login-inner">
        <div class="login-brand">
          <div class="login-logo">
            <img :src="appLogoUrl" :alt="appName" class="logo-img" @error="onLoginLogoError">
          </div>
          <div class="login-name">{{ appName }}</div>
          <div class="login-sub">AI · 智能体 · 互动课件</div>
        </div>
        <div class="login-qr">
          <QrcodeLogin v-if="!isMockMode" :show="showLogin" @login-success="onLoginSuccess" />
        </div>
      </div>
      <div class="login-btns" v-if="showSkipLogin">
        <button class="lbtn primary" type="button" @click="enterDesk"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.checkCircle" /></svg>模拟扫码完成，进入课堂</button>
        <button class="lbtn ghost" type="button" @click="enterDesk">跳过登录，直接体验</button>
      </div>
    </div>

    <!-- 主界面 -->
    <div class="app" :class="{ on: !showLogin }">
      <header class="topbar">
        <button class="topbar-brand" type="button">
          <img class="topbar-logo-img" :src="appLogoUrl" :alt="appName">
          <span class="topbar-brand-name">{{ appName }}</span>
        </button>
        <div class="topbar-right">
          <div class="topbar-clock"><b>{{ clockTime }}</b><small>{{ clockDate }}</small></div>
          <div class="topbar-user">
            <span v-if="!guestMode" class="topbar-avatar">
              <img class="topbar-avatar-img" :src="avatarUrl" :alt="displayName" @error="onAvatarError">
            </span>
            <span class="topbar-user-copy">
              <span class="topbar-user-line">
                <b class="topbar-user-name">{{ displayName }}</b>
                <!-- <em v-if="identityLabel" class="topbar-user-identity">{{ identityLabel }}</em> -->
              </span>
              <!-- <small v-if="unitLabel" class="topbar-user-unit" :title="unitLabel">{{ unitLabel }}</small> -->
            </span>
            <!-- <svg class="topbar-user-arrow" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg> -->
          </div>
        </div>
      </header>

      <div class="main">
        <LocalPreviewNotice />
        <div class="apps-head">
          <h2>{{ appsTitle }}</h2>
          <span class="count">{{ total }} 项</span>
          <span v-if="viewTagText" class="view-tag">
            <span>{{ viewTagText }}</span>
            <button type="button" @click="resetView">返回全部</button>
          </span>
        </div>
        <div ref="gridEl" class="apps-grid" @scroll="onGridScroll">
          <div v-if="!agents.length" class="apps-empty">{{ emptyText }}</div>
          <div v-for="app in agents" :key="app.id" class="app-card" @click="openFull(app)">
            <div class="app-cover">
              <img v-if="coverImgSrc(app)" class="app-cover-img" loading="lazy" :src="coverImgSrc(app)" :alt="app.name">
              <div v-else class="app-cover-bg" :style="coverBgStyle(app)">
                <span class="cover-letter">{{ coverLetter(app) }}</span>
                <span class="cover-subject">{{ app.subjectNames }}</span>
              </div>
              <span class="cv-badge" :class="agentBadgeClass(app)">{{ agentBadgeText(app) }}</span>
              <span class="cv-uses">{{ formatUses(app.useCount) }} 次使用</span>
            </div>
            <div class="app-cbody">
              <h3>{{ app.name }}</h3>
              <div class="app-creator">
                <!-- <img class="app-creator-avatar" loading="lazy" :src="creatorAvatarSrc(app)" :alt="app.authorName" @error="onCreatorAvatarError"> -->
                <!-- <span class="app-creator-name">{{ app.authorName }}</span> -->
              </div>
              <!-- <span class="grade-chip">{{ agentGradeLabel(app) }}</span> -->
              <!-- 收藏胶囊：已登录（非体验模式）才展示，交互与 agent-card.vue 一致 -->
              <button
                v-if="!guestMode"
                class="app-fav-btn"
                :class="{ active: isFav(app), loading: favLoadingId === app.id }"
                type="button"
                :disabled="favLoadingId === app.id"
                :title="isFav(app) ? '取消收藏' : '收藏'"
                @click.stop="toggleAppFavorite(app)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" :fill="isFav(app) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path :d="icons.heart" />
                </svg>
                {{ isFav(app) ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>
          <div v-if="agents.length" class="apps-load-more">
            <span v-if="loading">加载中…</span>
            <span v-else-if="noMore">没有更多了</span>
          </div>
        </div>
      </div>

      <!-- 底部筛选栏（可折叠） -->
      <div class="dock" :class="{ collapsed: !dockOpen }">
        <div class="dock-head" @click="toggleDock">
          <span class="dh-tit"><span class="ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.filter" /></svg></span>筛选</span>
          <span class="dh-sum" v-html="filterSummary" />
          <span class="dh-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.chevronDown" /></svg></span>
        </div>
        <div class="dock-body">
          <div class="drow">
            <span class="dlab">学科</span>
            <div class="dtags">
              <span class="dtag" :class="{ active: !filters.subjectCode }" @click="setFilter('subjectCode', '')">全部</span>
              <span v-for="item in subjectOptions" :key="item.id" class="dtag" :class="{ active: filters.subjectCode === item.id }" @click="setFilter('subjectCode', item.id)">{{ item.atlasName }}</span>
            </div>
          </div>
          <div v-if="filters.subjectCode" class="drow">
            <span class="dlab">教材</span>
            <div class="dtags">
              <span class="dtag" :class="{ active: !filters.materialId }" @click="setFilter('materialId', '')">不限</span>
              <span v-for="item in materialList" :key="item.id" class="dtag" :class="{ active: filters.materialId === item.id }" @click="setFilter('materialId', item.id)">{{ item.name }}</span>
            </div>
          </div>
          <div v-if="filters.materialId" class="drow">
            <span class="dlab">章节</span>
            <div class="dtags">
              <span class="dtag" :class="{ active: !filters.chapterId }" @click="setFilter('chapterId', '')">不限</span>
              <span v-for="item in unitOptions" :key="item.id" class="dtag" :class="{ active: filters.chapterId === item.id }" @click="setFilter('chapterId', item.id)">{{ item.name }}</span>
            </div>
          </div>
          <div class="drow">
            <span class="dlab" />
            <div class="dtags">
              <span class="dtag reset" @click="resetFilters"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.refresh" /></svg>重置全部条件</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 返回顶部：页面开始滚动后展示 -->
      <transition name="backtop-fade">
        <div v-show="showBackTop" class="apps-backtop" title="返回顶部" @click="scrollToTop">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
        </div>
      </transition>
    </div>

    <!-- 全屏预览（组件自治显隐） -->
    <AppPreview ref="preview" floatingToolbar @close="handlePreviewClose" @favorite="handleFavorite" />

    <!-- 右下角工作台（可拖拽 · 点击展开操作按钮） -->
    <div v-show="showWorkbar" ref="wsWrap" class="ws-wrap" :style="wsWrapStyle">
      <div class="ws-actions" :class="{ show: wsOpen, rightside: wsRightSide }">
        <div class="ws-searchbar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a97b3" stroke-width="2.2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.4-3.4" />
          </svg>
          <input ref="searchInput" v-model="searchKeyword" placeholder="搜索智能体 / 工具 / 课件" autocomplete="off" @input="onSearchInput">
          <span class="sb-clr" title="清空关键词" @click="clearSearch"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.close" /></svg></span>
        </div>
        <!-- 我的收藏 / 最近使用依赖登录身份，未登录（体验模式）不展示 -->
        <button v-if="!guestMode" type="button" class="wsa" :class="{ on: page === 'favorites' }" @click="handleWsAction('fav')">
          <span class="ico"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.star" /></svg></span>我的收藏
        </button>
        <button v-if="!guestMode" type="button" class="wsa" :class="{ on: page === 'recent' }" @click="handleWsAction('recent')">
          <span class="ico"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.clock" /></svg></span>最近使用
        </button>
        <button type="button" class="wsa danger" @click="handleWsAction('logout')">
          <span class="ico"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.logout" /></svg></span>退出
        </button>
      </div>
      <div
        class="ws-fab"
        :class="{ open: wsOpen }"
        title="拖拽移动 · 点击展开工作台"
        @pointerdown="onFabPointerDown"
        @dblclick.prevent
      >
        <span class="pw">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="5" height="5" rx="1.6" />
            <rect x="9.5" y="3" width="5" height="5" rx="1.6" />
            <rect x="16" y="3" width="5" height="5" rx="1.6" />
            <rect x="3" y="9.5" width="5" height="5" rx="1.6" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1.6" />
            <rect x="16" y="9.5" width="5" height="5" rx="1.6" />
            <rect x="3" y="16" width="5" height="5" rx="1.6" />
            <rect x="9.5" y="16" width="5" height="5" rx="1.6" />
            <rect x="16" y="16" width="5" height="5" rx="1.6" />
          </svg>
        </span>
        <span class="pt">工作台</span>
      </div>
      <div class="logout-pop" :class="{ show: showLogoutPop }">
        <b><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e5484d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.logout" /></svg>退出当前账号？</b>
        <p>退出后将回到扫码登录页，已打开的应用与筛选条件会被重置。</p>
        <div class="lp-btns">
          <button class="lp-cancel" type="button" @click="showLogoutPop = false">取消</button>
          <button class="lp-ok" type="button" @click="doLogout">退出登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { store as authStore } from 'auth-layout-wxj';
import { getToken, logoutRmCookies, defaultAvatarUrl, defaultSchoolLogoUrl } from '@/utils/auth';
import { MOCK_DATA_ENABLED } from '@/config/local-preview';
import LocalPreviewNotice from '@/components/local-preview-notice.vue';
import AppPreview from '@/components/app-preview.vue';
import QrcodeLogin from './components/QrcodeLogin.vue';
import { formatUses } from '@/utils/format';
import { getLaunchParam as readLaunchParam } from '@/utils/launchParams';
import { mapState, mapGetters } from 'vuex';
import { pageByOrg, materialChapterTree } from '@/api/common';
import { addFavorite, deleteFavorite } from '@/api/favourite';
import { ICONS } from '@/constants/icons';

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/** 封面渐变调色板 */
const COVER_COLORS = [
  '#2b6cff', '#8b5cf6', '#e07b39', '#0e9f6e', '#ed8a20',
  '#ec6b58', '#1597c7', '#f3a62f', '#fb765b', '#3f9e6d'
];

/** 个人收藏状态：selfIsFavorite 1 未收藏 / 2 已收藏（与 agent-card.vue 一致） */
const FAVORITE_YES = 2;
const FAVORITE_NO = 1;

/** 应用图标：后端直接返回完整 URL，无值时使用兜底图 */
function resolveLogoUrl(appJson) {
  const squareIcon = appJson && appJson.roundLogoUrl;
  return squareIcon || defaultSchoolLogoUrl;
}

function padTwo(n) {
  return String(n).padStart(2, '0');
}

export default {
  name: 'DesktopApp',
  components: {
    AppPreview,
    QrcodeLogin,
    LocalPreviewNotice
  },
  data() {
    return {
      icons: ICONS,
      showLogin: !MOCK_DATA_ENABLED,
      loginLeaving: false,
      showWorkbar: false,
      showLogoutPop: false,
      wsOpen: false,
      wsRightSide: false,
      searchKeyword: '',
      searchTimer: null,
      dockOpen: false,
      clockTime: '--:--',
      clockDate: '',
      clockTimer: null,
      dragState: null,
      dragMoved: false,
      wsLeft: '',
      wsTop: '',
      wsRight: '24px',
      wsBottom: '24px',
      materialList: [],
      unitOptions: [],
      /* 收藏请求中的卡片 id：同一时刻仅允许一个收藏操作 */
      favLoadingId: null,
      // 应用网格滚动超过阈值后展示“返回顶部”按钮
      showBackTop: false,
      // 封面解析缓存：id → 首图 URL / 渐变色，避免每次重渲染重复 JSON.parse 与拼接
      coverImgCache: Object.create(null),
      coverBgCache: Object.create(null),
      // 返回顶部阈值交叉标记：仅在状态翻转时更新 data，避免滚动中触发网格重渲染
      backTopVisible: false,
      backTopRaf: null
    };
  },
  computed: {
    isMockMode() {
      return MOCK_DATA_ENABLED;
    },
    ...mapGetters('agent', ['subjectList', 'platformName', 'platformLogo']),
    ...mapState('agent', ['page', 'filters', 'agents', 'total', 'guestMode', 'loading']),
    /** 学科选项：教材图谱列表 */
    subjectOptions() {
      return this.subjectList || [];
    },
    /** 是否展示「跳过登录，直接体验」：由路由参数 ?skipLogin=1 控制，默认不展示 */
    showSkipLogin() {
      const flag = this.getLaunchParam('skipLogin');
      return flag === '1' || flag === 'true';
    },
    /** 应用名称：优先平台设置，未配置时默认「AI智能体平台」 */
    appName() {
      return this.platformName || 'AI智能体平台';
    },
    /** 应用 Logo URL：优先平台设置，未配置时回退学校 Logo */
    appLogoUrl() {
      return this.platformLogo || resolveLogoUrl(authStore.state.schoolInfo);
    },
    /** Logo 首字（加载前占位） */
    appFirstLetter() {
      return (this.appName || '?').charAt(0);
    },
    /** 当前用户姓名 */
    displayName() {
      return MOCK_DATA_ENABLED ? '本地模拟预览' : authStore.getters.name || '未登录用户';
    },
    /** 用户头像：后端直接返回完整 URL */
    avatarUrl() {
      return authStore.getters.avatar || defaultAvatarUrl;
    },
    /** 所属单位/学校 */
    unitLabel() {
      const schoolInfo = authStore.state.schoolInfo;
      return (schoolInfo && schoolInfo.schoolName) || '';
    },
    /** 登录身份标签 */
    identityLabel() {
      return (authStore.state.userInfo && authStore.state.userInfo.loginTypeName) || '';
    },
    /** 筛选摘要（底部 dock 横条） */
    filterSummary() {
      const labels = [];
      if (this.filters.subjectCode) {
        const s = this.subjectOptions.find((i) => i.id === this.filters.subjectCode);
        if (s) labels.push(s.atlasName);
      }
      if (this.filters.materialId) {
        const m = this.materialList.find((i) => i.id === this.filters.materialId);
        if (m) labels.push(m.name);
      }
      if (this.filters.chapterId) {
        const ch = this.unitOptions.find((i) => i.id === this.filters.chapterId);
        if (ch) labels.push(ch.name);
      }
      if (!labels.length) {
        return '全部资源 <span style="opacity:.55;font-size:13px">｜ 点此展开筛选</span>';
      }
      return `已选：<b>${labels.join(' · ')}</b>  <span style="opacity:.55;font-size:13px">｜ 点此展开/收起筛选</span>`;
    },
    /** 应用中心标题：随工作台视图切换 */
    appsTitle() {
      if (this.page === 'favorites') return '我的收藏';
      if (this.page === 'recent') return '最近使用';
      if (this.searchKeyword.trim()) return '搜索结果';
      return '应用中心';
    },
    /** 顶部视图标识：收藏/最近/搜索态下展示，附「返回全部」 */
    viewTagText() {
      if (this.page === 'favorites') return '我的收藏';
      if (this.page === 'recent') return '最近使用';
      const keyword = this.searchKeyword.trim();
      return keyword ? `搜索「${keyword}」` : '';
    },
    /** 当前列表为空时的提示文案 */
    emptyText() {
      if (this.page === 'favorites') return '还没有收藏的应用，在预览页点击“收藏”即可加入';
      if (this.page === 'recent') return '还没有使用记录';
      return '暂无匹配的应用，试试调整筛选条件';
    },
    wsWrapStyle() {
      const style = {};
      if (this.wsLeft !== '') {
        style.left = this.wsLeft;
        style.top = this.wsTop;
        style.right = 'auto';
        style.bottom = 'auto';
      }
      return style;
    },
    // 已加载全部数据（仅在有数据时判定）
    noMore() {
      return this.total > 0 && this.agents.length >= this.total;
    },
    // 登录页展示、加载中、首屏为空或已加载全部时禁用无限滚动
    disabled() {
      if (this.showLogin) return true;
      if (this.loading) return true;
      if (this.agents.length === 0) return true;
      return this.noMore;
    }
  },
  watch: {
    // 列表回到第一页（搜索/切换视图/重载）时重置网格滚动位置，避免沿用底部位置误触发加载
    '$store.state.agent.currentPage'(val) {
      if (val === 1 && this.$refs.gridEl) {
        this.$refs.gridEl.scrollTop = 0;
      }
      this.showBackTop = false;
      this.backTopVisible = false;
      // 列表数据变更后失效封面缓存，避免同名 id 复用旧值
      this.coverImgCache = Object.create(null);
      this.coverBgCache = Object.create(null);
    }
  },
  mounted() {
    this.startClock();
    this.$store.commit('agent/SET_PAGE', 'home');
    document.addEventListener('pointerdown', this.onDocPointerDown);
    document.addEventListener('keydown', this.onKeydown);
    // 已有有效 token 则跳过登录页并加载数据
    if (getToken() || MOCK_DATA_ENABLED) {
      // 回调重定向后 URL 参数已丢失：先从本地缓存恢复 schoolId，再初始化基础数据
      const savedSchoolId = this.getLaunchParam('schoolId');
      if (savedSchoolId) {
        this.$store.dispatch('agent/setSchoolId', savedSchoolId);
      }
      this.$store.dispatch('agent/initBaseData');
      this.$store.dispatch('agent/reloadAgents');
      this.showLogin = false;
      this.showWorkbar = true;
    }
  },
  beforeDestroy() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.backTopRaf) cancelAnimationFrame(this.backTopRaf);
    document.removeEventListener('pointerdown', this.onDocPointerDown);
    document.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    formatUses,
    /** 下拉加载下一页 */
    load() {
      if (this.disabled) return;
      this.$store.dispatch('agent/loadMoreAgents');
    },
    /** 网格滚动：rAF 节流统一处理“返回顶部”显隐与触底加载，避免每次 scroll 事件强制布局回流 */
    onGridScroll(e) {
      if (this.backTopRaf) return;
      const el = e.target;
      this.backTopRaf = requestAnimationFrame(() => {
        this.backTopRaf = null;
        const visible = el.scrollTop > 300;
        if (visible !== this.backTopVisible) {
          this.backTopVisible = visible;
          this.showBackTop = visible;
        }
        // 触底加载：距底部不足 200px 且未禁用无限滚动时拉取下一页
        if (!this.disabled && el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
          this.load();
        }
      });
    },
    /** 平滑滚动回列表顶部 */
    scrollToTop() {
      if (this.$refs.gridEl) {
        this.$refs.gridEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    /** 读取启动参数（schoolId / skipLogin）：扫码回调重定向后 URL 参数丢失时回退本地缓存 */
    getLaunchParam(key) {
      return readLaunchParam(key, this.$route.query[key]);
    },
    startClock() {
      const update = () => {
        const d = new Date();
        this.clockTime = padTwo(d.getHours()) + ':' + padTwo(d.getMinutes());
        this.clockDate = `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())} ${WEEK_DAYS[d.getDay()]}`;
      };
      update();
      this.clockTimer = setInterval(update, 1000);
    },
    enterDesk() {
      this.loginLeaving = true;
      // 无 token 进入（跳过扫码）则开启体验模式，列表/详情等接口切换到非鉴权端点
      this.$store.commit('agent/SET_GUEST_MODE', !getToken());
      this.$store.dispatch('agent/setSchoolId', this.getLaunchParam('schoolId'));
      this.$store.dispatch('agent/loadSubjectList');
      setTimeout(() => {
        this.showLogin = false;
        this.loginLeaving = false;
        this.showWorkbar = true;
        this.$store.dispatch('agent/initBaseData');
        this.$store.dispatch('agent/reloadAgents');
      }, 420);
    },
    /** 扫码登录成功回调 */
    onLoginSuccess() {
      this.enterDesk();
    },
    toggleDock() {
      this.dockOpen = !this.dockOpen;
    },
    /** 筛选条件变更：级联重置下级 + 加载教材/章节 + 重新搜索 */
    setFilter(type, value) {
      this.$store.commit('agent/SET_FILTER', { type, value });
      // 学科变化：重置教材/章节并重新加载教材列表
      if (type === 'subjectCode') {
        this.$store.commit('agent/SET_FILTER', { type: 'materialId', value: '' });
        this.$store.commit('agent/SET_FILTER', { type: 'chapterId', value: '' });
        this.loadMaterials();
      }
      // 教材变化：重置章节并重新加载章节树
      if (type === 'materialId') {
        this.$store.commit('agent/SET_FILTER', { type: 'chapterId', value: '' });
        this.loadUnitTree();
      }
      this.$store.dispatch('agent/searchAgents');
    },
    resetFilters() {
      this.$store.commit('agent/RESET_FILTERS');
      this.$store.dispatch('agent/searchAgents');
    },
    /** 加载教材列表：按所选学科（atlasId）拉取 */
    loadMaterials() {
      if (!this.filters.subjectCode) {
        this.materialList = [];
        return;
      }
      pageByOrg(this.filters.subjectCode).then((res) => {
        this.materialList = res.data || [];
      }).catch((err) => {
        console.warn('[DesktopApp] 获取教材列表失败：', err);
      });
    },
    /** 加载章节树：取所选教材的子节点 */
    loadUnitTree() {
      if (!this.filters.materialId) {
        this.unitOptions = [];
        return;
      }
      materialChapterTree(this.filters.materialId).then((res) => {
        const materialObj = res.data[0] || {};
        this.unitOptions = materialObj.childrenList || [];
      }).catch((err) => {
        console.warn('[DesktopApp] 获取章节树失败：', err);
      });
    },
    /** 头像加载失败回退默认头像（防止同一 URL 反复 404 触发无限循环） */
    onAvatarError(event) {
      const fallback = defaultAvatarUrl;
      if (event.target.src.indexOf(fallback) !== -1) {
        event.target.style.display = 'none';
        return;
      }
      event.target.src = fallback;
    },
    /** 登录页 Logo 加载失败回退兜底地址 */
    onLoginLogoError(event) {
      event.target.onerror = null;
      event.target.src = 'https://cdnfile-10043692.file.myqcloud.com/productVersion/projects/agentPlatform/djcjzx_logo.jpg';
    },
    openFull(app) {
      this.closeWs();
      this.$refs.preview.open(app);
    },
    /** 预览关闭后刷新列表（使用量可能已更新）；退出登录时 token 已清除，跳过鉴权列表请求 */
    handlePreviewClose() {
      if (this.showLogin || !getToken()) return;
      this.$store.dispatch('agent/reloadAgents');
    },
    /** 卡片当前是否已收藏（selfIsFavorite 2 已收藏） */
    isFav(app) {
      return Number(app.selfIsFavorite) === FAVORITE_YES;
    },
    /** 列表卡片收藏/取消收藏：接口调用与 agent-card.vue 一致，成功后回写 store 列表数据 */
    toggleAppFavorite(app) {
      if (this.favLoadingId || !app.id) {
        return;
      }
      this.favLoadingId = app.id;
      const isFavorited = this.isFav(app);
      const request = isFavorited
        ? deleteFavorite({ objectId: app.id, objectType: 1, type: 1 })
        : addFavorite({ objectId: app.id, objectType: 1, type: 1 });
      request.then(() => {
        this.handleFavorite({ agent: app, selfIsFavorite: isFavorited ? FAVORITE_NO : FAVORITE_YES });
      }).catch((err) => {
        console.warn('[DesktopApp] 收藏操作失败：', err);
      }).finally(() => {
        this.favLoadingId = null;
      });
    },
    /** 收藏状态变更（卡片/预览内）：回写列表项 selfIsFavorite，收藏页取消后重新拉取列表 */
    handleFavorite({ agent, selfIsFavorite }) {
      this.$store.commit('agent/UPDATE_AGENT_FAVORITE', { id: agent.id, selfIsFavorite });
      if (this.page === 'favorites' && selfIsFavorite === FAVORITE_NO) {
        this.$store.dispatch('agent/reloadAgents');
      }
    },
    /** 卡片封面取首字 */
    coverLetter(app) {
      return (app.name || '?').charAt(0);
    },
    /** 卡片封面截图（取第一张）：后端 attachmentKey 已为完整 URL；解析结果按 id 缓存 */
    coverImgSrc(app) {
      const cached = this.coverImgCache[app.id];
      if (cached !== undefined) return cached;
      let src = '';
      try {
        const list = JSON.parse(app.coverImg || '[]');
        if (list.length && list[0].attachmentKey) {
          src = list[0].attachmentKey;
        }
      } catch (e) { /* ignore */ }
      this.coverImgCache[app.id] = src;
      return src;
    },
    /** 创作者头像：后端 logoImg 已为完整 URL */
    creatorAvatarSrc(app) {
      return app.logoImg || defaultAvatarUrl;
    },
    /** 创作者头像加载失败回退 */
    onCreatorAvatarError(event) {
      event.target.onerror = null;
      event.target.src = defaultAvatarUrl;
    },
    /** 卡片封面渐变色：结果按 id 缓存，避免滚动重渲染时反复构建样式对象 */
    coverBgStyle(app) {
      const cached = this.coverBgCache[app.id];
      if (cached !== undefined) return cached;
      const idx = (app.id || 0) % COVER_COLORS.length;
      const color = COVER_COLORS[idx];
      const style = { background: `linear-gradient(135deg, ${color}, ${color}88)` };
      this.coverBgCache[app.id] = style;
      return style;
    },
    /** 智能体类型 → 徽章 class */
    agentBadgeClass(app) {
      if (app.agentType === 1) return 'ai';
      if (app.agentType === 2) return '';
      return '';
    },
    /** 智能体类型 → 徽章文本 */
    agentBadgeText(app) {
      if (app.agentType === 1) return '智能体';
      if (app.agentType === 2) return '工具';
      return '应用';
    },
    /** 年级编码 → 显示标签 */
    agentGradeLabel(app) {
      return app.gradeNames || '';
    },
    /* ===== 右下角工作台拖拽 ===== */
    onFabPointerDown(e) {
      if (e.button !== 0) return;
      const wrap = this.$refs.wsWrap;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      this.wsLeft = rect.left + 'px';
      this.wsTop = rect.top + 'px';
      this.wsRight = 'auto';
      this.wsBottom = 'auto';
      this.dragState = { sx: e.clientX, sy: e.clientY, ox: rect.left, oy: rect.top };
      this.dragMoved = false;
      window.addEventListener('pointermove', this.onFabPointerMove);
      window.addEventListener('pointerup', this.onFabPointerUp);
    },
    onFabPointerMove(e) {
      if (!this.dragState) return;
      const dx = e.clientX - this.dragState.sx;
      const dy = e.clientY - this.dragState.sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) this.dragMoved = true;
      if (this.dragMoved) {
        this.wsLeft = (this.dragState.ox + dx) + 'px';
        this.wsTop = (this.dragState.oy + dy) + 'px';
        if (this.wsOpen) this.placeWs();
      }
    },
    onFabPointerUp() {
      window.removeEventListener('pointermove', this.onFabPointerMove);
      window.removeEventListener('pointerup', this.onFabPointerUp);
      if (!this.dragMoved) {
        this.toggleWs();
      }
      this.dragState = null;
    },
    /** 操作按钮组展开方向：靠近屏幕左侧时改为向右展开 */
    placeWs() {
      const wrap = this.$refs.wsWrap;
      if (!wrap) return;
      this.wsRightSide = wrap.getBoundingClientRect().left < 470;
    },
    toggleWs() {
      if (this.wsOpen) {
        this.closeWs();
      } else {
        this.placeWs();
        this.wsOpen = true;
        this.focusSearch();
      }
    },
    closeWs() {
      this.wsOpen = false;
    },
    /** 展开工作台后聚焦搜索框，可直接输入 */
    focusSearch() {
      setTimeout(() => {
        if (this.$refs.searchInput) this.$refs.searchInput.focus();
      }, 220);
    },
    /** 工作台操作：我的收藏 / 最近使用 / 退出 */
    handleWsAction(kind) {
      if (kind === 'fav') {
        this.closeWs();
        this.switchPage(this.page === 'favorites' ? 'home' : 'favorites');
        return;
      }
      if (kind === 'recent') {
        this.closeWs();
        this.switchPage(this.page === 'recent' ? 'home' : 'recent');
        return;
      }
      // 退出：已登录需二次确认（确认后先登出再退出）；未登录（体验模式）直接退出
      this.closeWs();
      if (getToken()) {
        this.showLogoutPop = true;
      } else {
        this.doLogout();
      }
    },
    /** 切换列表视图：清空搜索关键词后重新拉取 */
    switchPage(page) {
      this.searchKeyword = '';
      this.$store.commit('agent/SET_KEYWORD', '');
      this.$store.commit('agent/SET_PAGE', page);
      this.$store.commit('agent/RESET_PAGINATION');
      this.$store.dispatch('agent/loadAgents');
    },
    /** 顶部「返回全部」：退出搜索与收藏/最近视图 */
    resetView() {
      this.switchPage('home');
    },
    /** 搜索框输入：300ms 防抖后按关键词重新拉取列表 */
    onSearchInput() {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.$store.commit('agent/SET_KEYWORD', this.searchKeyword.trim());
        this.$store.dispatch('agent/searchAgents');
      }, 300);
    },
    /** 清空关键词并重新拉取全部列表 */
    clearSearch() {
      this.searchKeyword = '';
      this.$store.commit('agent/SET_KEYWORD', '');
      this.$store.dispatch('agent/searchAgents');
    },
    onDocPointerDown(e) {
      const wrap = this.$refs.wsWrap;
      if (wrap && wrap.contains(e.target)) return;
      this.closeWs();
      this.showLogoutPop = false;
    },
    onKeydown(e) {
      if (e.key !== 'Escape') return;
      if (this.showLogoutPop) {
        this.showLogoutPop = false;
      } else {
        this.closeWs();
      }
    },
    /** 退出：已登录先调 auth-layout-wxj 登出清除会话，再回到扫码登录页 */
    doLogout() {
      if (MOCK_DATA_ENABLED) {
        this.showLogoutPop = false;
        this.$message.info('当前为本地模拟预览，无需登录或退出。');
        return;
      }
      this.showLogoutPop = false;
      const resetDesk = () => {
        this.$store.commit('agent/SET_PAGE', 'home');
        this.$store.commit('agent/SET_INIT_STATUS', 0);
        if (this.$refs.preview) {
          this.$refs.preview.close();
        }
        this.closeWs();
        this.searchKeyword = '';
        // 仅清空筛选条件，不触发 searchAgents（退出后无 token，避免再调鉴权列表接口）
        this.$store.commit('agent/RESET_FILTERS');
        this.showLogin = true;
        this.showWorkbar = false;
        this.wsLeft = '';
        this.wsTop = '';
        this.wsRight = '24px';
        this.wsBottom = '24px';
      };
      if (getToken()) {
        logoutRmCookies().finally(resetDesk);
      } else {
        resetDesk();
      }
    }
  }
};
</script>

<style scoped>
/* 基础重置 */
* { margin: 0; padding: 0; box-sizing: border-box; }

.desktop-app {
  --brand: #2b6cff;
  --brand2: #7c3aed;
  --ink: #13213d;
  --muted: #5f6f8e;
  --line: #e2e8f5;
  --card: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  color: var(--ink);
  font-size: 16px;
  position: fixed;
  inset: 0;
}

/* 登录页 */
.login-view {
  position: fixed; inset: 0; z-index: 500;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px;
  cursor: pointer;
  background: radial-gradient(1200px 700px at 20% -10%, #2b6cff 0%, transparent 55%),
    radial-gradient(1000px 600px at 110% 115%, #7c3aed55 0%, transparent 50%),
    linear-gradient(135deg, #0d1b4c 0%, #142a6e 48%, #0f2158 100%);
  transition: opacity 0.45s ease, visibility 0.45s;
}
.login-view.leaving { opacity: 0; visibility: hidden; }
.login-inner { display: flex; align-items: center; gap: 60px; }
.login-brand { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.login-logo {
  width: 104px; height: 104px; border-radius: 28px;
  display: grid; place-items: center; overflow: hidden;
  background: linear-gradient(145deg, #ffffff, #dbe6ff);
  box-shadow: 0 18px 44px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.25), inset 0 0 0 4px rgba(33,104,243,.06);
}
.login-logo .logo-img, .login-logo .fallback { width: 100%; height: 100%; object-fit: contain; }
.login-name { color: #fff; font-size: 36px; font-weight: 800; letter-spacing: .06em; text-shadow: 0 4px 18px rgba(0,0,0,.35); }
.login-sub { color: rgba(255,255,255,.6); font-size: 14px; letter-spacing: .3em; font-weight: 400; }
.login-qr {
  background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.2); border-radius: 26px;
  padding: 10px; display: flex; flex-direction: column; align-items: center;
  backdrop-filter: blur(8px); box-shadow: 0 20px 60px rgba(0,0,0,.3);
}
.login-qr :deep(.qrcode-login) { margin-left: 0; }
.login-btns { display: flex; gap: 16px; margin-top: 12px; }
.lbtn {
  height: 54px; padding: 0 34px; border-radius: 15px; font-size: 16px; font-weight: 800;
  letter-spacing: .08em; cursor: pointer; display: inline-flex; align-items: center; gap: 9px;
  transition: transform .15s;
}
.lbtn:hover { transform: translateY(-2px); }
.lbtn.primary { background: linear-gradient(120deg, #3d7bff, #7c3aed); color: #fff; border: 0; box-shadow: 0 12px 30px rgba(43,108,255,.5); }
.lbtn.ghost { background: rgba(255,255,255,.1); color: #eaf0ff; border: 1px solid rgba(255,255,255,.38); backdrop-filter: blur(6px); }
.lbtn.ghost:hover { background: rgba(255,255,255,.22); }

/* 主界面 */
.app {
  position: fixed; inset: 0; display: flex; flex-direction: column;
  opacity: 0; pointer-events: none; transition: opacity .5s ease;
  background: linear-gradient(150deg, #f2f5fc 0%, #e8eefb 100%);
}
.app.on { opacity: 1; pointer-events: auto; }

/* 顶部栏 */
.topbar {
  height: 58px; flex-shrink: 0; display: flex; align-items: center; gap: 14px; padding: 0 22px;
  color: #fff; background: linear-gradient(90deg, #12204f, #1d3a8f 60%, #16296a);
  box-shadow: 0 4px 18px rgba(13,27,76,.18); position: relative; z-index: 50;
}
.topbar-brand {
  display: flex; align-items: center; gap: 10px;
  background: none; border: 0; padding: 0; cursor: pointer; font: inherit; color: #fff;
}
.topbar-logo-img { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
.topbar-brand-name { font-size: 19px; font-weight: 800; letter-spacing: .04em; color: #fff; }
.topbar-clock { text-align: right; line-height: 1.25; margin-right: 16px; }
.topbar-clock b { font-size: 17px; font-weight: 700; display: block; }
.topbar-clock small { font-size: 12px; opacity: .65; }
.topbar-right { margin-left: auto; display: flex; align-items: center; }
.topbar-user {
  display: flex; align-items: center; gap: 9px; padding: 5px 12px 5px 5px;
  border-radius: 28px;
  /* background: rgba(255,255,255,.12); */
  /* border: 1px solid rgba(255,255,255,.18); */
  cursor: pointer; flex-shrink: 0;
}
/* .topbar-user:hover { background: rgba(255,255,255,.2); } */
.topbar-avatar {
  width: 30px; height: 30px; border-radius: 8px; overflow: hidden;
  display: grid; place-items: center; background: rgba(255,255,255,.18); flex-shrink: 0;
}
.topbar-avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.topbar-user-copy { display: flex; flex-direction: column; line-height: 1.25; }
.topbar-user-line { display: flex; align-items: center; gap: 6px; }
.topbar-user-name { font-size: 13px; color: #fff; font-weight: 700; }
.topbar-user-identity {
  font-style: normal; font-size: 11px; color: #ffd76a; background: rgba(255,215,106,.15);
  border-radius: 5px; padding: 1px 6px;
}
.topbar-user-unit { font-size: 11px; color: rgba(255,255,255,.6); }
.topbar-user-arrow { flex: none; color: rgba(255,255,255,.5); }

/* 中央资源区 */
.main { flex: 1; min-height: 0; overflow: hidden; position: relative; display: flex; flex-direction: column; }
.apps-head { display: flex; align-items: center; gap: 16px; padding: 20px 30px 4px; flex-shrink: 0; }
.apps-head h2 { font-size: 22px; font-weight: 800; }
.count { font-size: 15px; background: #e0e9ff; color: var(--brand); padding: 4px 14px; border-radius: 16px; font-weight: 700; }
.view-tag { display: inline-flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 800; color: var(--brand); background: #e7f0ff; padding: 6px 8px 6px 16px; border-radius: 999px; }
.view-tag button { border: 0; background: #fff; color: var(--brand); border-radius: 999px; padding: 6px 14px; font-size: 13.5px; font-weight: 800; cursor: pointer; font-family: inherit; }
.apps-grid { flex: 1; overflow-y: auto; padding: 16px 30px 36px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; align-content: start; }
.apps-empty { grid-column: 1 / -1; text-align: center; padding: 64px 20px; color: var(--muted); font-size: 17px; line-height: 1.8; background: #fff; border: 1px dashed var(--line); border-radius: 18px; }
.apps-load-more { grid-column: 1 / -1; text-align: center; padding: 14px 0 4px; color: var(--muted); font-size: 14px; }

/* 返回顶部：固定在右下角，位于工作台按钮上方避免遮挡 */
.apps-backtop {
  position: fixed; right: 45px; bottom: 116px; z-index: 5;
  width: 46px; height: 46px; border-radius: 50%;
  display: grid; place-items: center; cursor: pointer;
  color: var(--brand); background: #fff; border: 1px solid var(--line);
  box-shadow: 0 8px 24px rgba(0,0,0,.16); transition: all .2s;
}
.apps-backtop:hover { background: var(--brand); color: #fff; }
.backtop-fade-enter-active, .backtop-fade-leave-active { transition: opacity .25s, transform .25s; }
.backtop-fade-enter, .backtop-fade-leave-to { opacity: 0; transform: translateY(12px); }

/* 应用卡片 */
.app-card {
  background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 0; cursor: pointer;
  transition: all .2s cubic-bezier(.4,0,.2,1); display: flex; flex-direction: column;
  box-shadow: 0 6px 18px rgba(30,60,140,.06);
  /* 隔离卡片绘制与布局，滚动时视口外卡片不参与重排/重绘，缓解大量卡片时的滚动卡顿 */
  contain: layout style paint;
  /* 视口外卡片跳过样式计算/布局/绘制，占位高度用 auto 记忆真实尺寸，滚动时不再逐行绘制 */
  content-visibility: auto;
  contain-intrinsic-size: auto 260px;
  /* 静态投影移到伪元素，配合 will-change 将卡片提升为合成层：
     光栅化一次后由 GPU 纹理复用，滚动时不再每帧重绘模糊投影 */
  box-shadow: none;
  position: relative;
  will-change: transform;
  /* 仅过渡颜色类属性：避免 all 让 box-shadow/transform 在每帧重绘大范围模糊 */
  transition: border-color .2s, background-color .2s;
}
.app-card:hover { border-color: var(--brand); }
/* 投影由伪元素承载：与卡片主体同尺寸圆角，绘制在卡片下层 */
.app-card::after {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(30,60,140,.06);
}
.app-cover { position: relative; border-radius: 17px 17px 0 0; overflow: hidden; height: 180px; background: #eef3fb; }
.app-cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.app-cover-bg { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.cover-letter { font-size: 70px; font-weight: 800; color: rgba(255,255,255,.92); font-family: 'PingFang SC', sans-serif; line-height: 1; }
.cover-subject { font-size: 14px; color: rgba(255,255,255,.75); letter-spacing: 3px; font-family: 'PingFang SC', sans-serif; margin-top: 8px; }
.cv-badge { position: absolute; top: 10px; left: 10px; font-size: 13px; padding: 4px 12px; border-radius: 20px; background: rgba(255,255,255,.94); color: #42506b; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,.14); z-index: 1; }
.cv-badge.ai { background: rgba(139,92,246,.96); color: #fff; }
.cv-badge.cw { background: rgba(224,123,57,.96); color: #fff; }
.cv-uses { position: absolute; bottom: 8px; right: 10px; font-size: 11px; color: #fff; background: rgba(15,23,42,.55); padding: 2px 9px; border-radius: 12px; z-index: 1; }
.app-cbody { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px 16px; }
.app-cbody h3 { font-size: 17px; font-weight: 800; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
.app-creator { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.app-creator-avatar { width: 22px; height: 22px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.app-creator-name { font-size: 13px; color: var(--muted); white-space: nowrap; }
.grade-chip { flex-shrink: 0; font-size: 13px; font-weight: 700; color: var(--brand); background: #e7f0ff; padding: 3px 12px; border-radius: 18px; }

/* 卡片收藏胶囊：未收藏灰色描边，已收藏玫红实心心形（与 agent-card.vue 保持一致） */
.app-fav-btn { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; padding: 3px 10px; border: 1px solid var(--line); border-radius: 20px; background: var(--card); color: #68758b; font-size: 12px; cursor: pointer; transition: all .2s; }
.app-fav-btn:hover { border-color: #fbb6c2; background: rgba(244,63,94,.08); color: #f43f5e; }
.app-fav-btn.active { border-color: rgba(244,63,94,.35); background: rgba(244,63,94,.08); color: #f43f5e; }
.app-fav-btn.loading { opacity: .6; cursor: wait; }

/* 底部筛选栏 */
.dock { flex-shrink: 0; position: relative; z-index: 60; background: rgba(13,25,70,1); color: #fff; box-shadow: 0 -6px 26px rgba(13,27,76,.25); }
.dock-head { height: 54px; display: flex; align-items: center; gap: 14px; padding: 0 22px; cursor: pointer; user-select: none; }
.dh-tit { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 800; letter-spacing: .05em; color: #fff; }
.dh-tit .ic { width: 32px; height: 32px; border-radius: 9px; background: rgba(255,255,255,.16); display: grid; place-items: center; font-size: 15px; }
.dh-sum { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: rgba(255,255,255,.72); font-size: 15px; text-align: left; }
.dh-sum b { color: #ffd76a; font-weight: 700; }
.dh-arrow { color: #fff; font-size: 12px; transition: transform .3s; padding: 8px; }
.dock.collapsed .dh-arrow { transform: rotate(180deg); }
.dock-body { display: flex; flex-direction: column; gap: 8px; padding: 4px 22px 14px; max-height: 0; opacity: 0; overflow: hidden; transition: max-height .3s ease, opacity .25s ease; }
.dock:not(.collapsed) .dock-body { max-height: 420px; opacity: 1; }
.drow { display: flex; align-items: flex-start; gap: 12px; }
.drow .dlab { width: 56px; flex-shrink: 0; text-align: right; font-size: 14px; font-weight: 700; color: rgba(255,255,255,.55); line-height: 42px; letter-spacing: .1em; }
.dtags { flex: 1; display: flex; flex-wrap: wrap; gap: 9px; min-width: 0; }
.dtag { min-height: 42px; display: inline-flex; align-items: center; padding: 8px 18px; border-radius: 999px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.14); color: #eef2ff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all .15s; white-space: nowrap; }
.dtag:hover { background: rgba(255,255,255,.2); }
.dtag.active { background: linear-gradient(120deg, var(--brand), var(--brand2)); border-color: transparent; color: #fff; font-weight: 800; box-shadow: 0 6px 16px rgba(43,108,255,.4); }
.dtag.off { opacity: .3; cursor: default; }
.dtag.off:hover { background: rgba(255,255,255,.1); }
.dtag.reset { gap: 7px; background: transparent; border: 1px dashed rgba(255,255,255,.35); color: #9fb0e0; }
.dtag.reset:hover { color: #fff; border-color: #fff; }

/* 右下角工作台（可拖拽 · 展开操作按钮） */
.ws-wrap { position: fixed; right: 24px; bottom: 24px; z-index: 1; user-select: none; -webkit-user-select: none; touch-action: none; }
.ws-fab {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  width: 76px; height: 76px; border-radius: 50%; cursor: grab; color: #fff;
  background: linear-gradient(150deg, #3c4d74, #1c2b55 70%); border: 1px solid rgba(255,255,255,.28);
  box-shadow: 0 12px 30px rgba(10,22,60,.45);
  transition: background .3s ease, box-shadow .3s ease, transform .18s ease;
}
.ws-fab:active { cursor: grabbing; transform: scale(.96); }
.ws-fab .pw { display: grid; place-items: center; line-height: 1; font-weight: 800; transition: transform .38s cubic-bezier(.34,1.5,.5,1); }
.ws-fab .pt { font-size: 11.5px; letter-spacing: .14em; opacity: .92; font-weight: 700; }
.ws-fab.open { background: linear-gradient(150deg, var(--brand), var(--brand2)); box-shadow: 0 14px 36px rgba(43,108,255,.55); }
.ws-fab.open .pw { transform: rotate(45deg); }

/* 展开的操作按钮：默认从 FAB 向左错峰滑出 */
.ws-actions { position: absolute; right: 92px; bottom: 10px; display: flex; align-items: center; gap: 12px; pointer-events: none; }
.ws-actions.rightside { right: auto; left: 92px; }
.wsa {
  display: inline-flex; align-items: center; gap: 9px; height: 56px; padding: 0 22px;
  border-radius: 999px; border: 1px solid rgba(255,255,255,.2); background: rgba(17,29,64,.93);
  color: #fff; font-size: 16px; font-weight: 700; font-family: inherit; cursor: pointer; white-space: nowrap;
  background: rgba(17,29,64,1); box-shadow: 0 10px 26px rgba(10,22,60,.38);
  opacity: 0; transform: translateX(52px) scale(.8); pointer-events: none;
  transition: opacity .2s ease, transform .32s cubic-bezier(.3,1.5,.45,1), background .18s ease, box-shadow .2s ease;
}
.ws-actions.rightside .wsa { transform: translateX(-52px) scale(.8); }
.ws-actions.show .wsa { opacity: 1; transform: none; pointer-events: auto; }
.wsa:active { transform: scale(.95); }
.wsa .ico { font-size: 19px; line-height: 1; }
.wsa.on { background: linear-gradient(120deg, var(--brand), var(--brand2)); border-color: transparent; box-shadow: 0 12px 30px rgba(43,108,255,.5); }
.wsa.danger { background: linear-gradient(120deg, #e5484d, #c62f4b); border-color: transparent; box-shadow: 0 12px 28px rgba(198,47,75,.45); }
/* 错峰：离 FAB 越近越先出现（向左展开时第 4 个“退出”最先） */
.ws-actions.show .wsa:nth-child(4) { transition-delay: 0s; }
.ws-actions.show .wsa:nth-child(3) { transition-delay: .045s; }
.ws-actions.show .wsa:nth-child(2) { transition-delay: .09s; }
.ws-actions.show .wsa:nth-child(1) { transition-delay: .135s; }
/* 向右展开时错峰反转 */
.ws-actions.rightside.show .wsa:nth-child(1) { transition-delay: 0s; }
.ws-actions.rightside.show .wsa:nth-child(2) { transition-delay: .045s; }
.ws-actions.rightside.show .wsa:nth-child(3) { transition-delay: .09s; }
.ws-actions.rightside.show .wsa:nth-child(4) { transition-delay: .135s; }

/* 搜索框：作为工作台首个操作项，随按钮组一同展开 */
.ws-searchbar {
  display: flex; align-items: center; gap: 10px; width: 300px; height: 56px; padding: 0 12px 0 18px;
  border-radius: 999px; background: #fff; border: 1px solid rgba(255,255,255,.7);
  box-shadow: 0 10px 26px rgba(10,22,60,.38);
  opacity: 0; transform: translateX(52px) scale(.8); pointer-events: none;
  transition: opacity .2s ease, transform .32s cubic-bezier(.3,1.5,.45,1);
}
.ws-actions.rightside .ws-searchbar { transform: translateX(-52px) scale(.8); }
.ws-actions.show .ws-searchbar { opacity: 1; transform: none; pointer-events: auto; transition-delay: .135s; }
.ws-actions.rightside.show .ws-searchbar { transition-delay: 0s; }
.ws-searchbar svg { flex-shrink: 0; }
.ws-searchbar input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 17px; font-family: inherit; color: var(--ink); }
.ws-searchbar .sb-clr { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: #eef1f7; color: #5f6f8e; font-size: 15px; cursor: pointer; flex-shrink: 0; transition: background .15s; }
.ws-searchbar .sb-clr:hover { background: #e2e8f5; }

/* 退出确认弹框 */
.logout-pop { position: absolute; right: 0; bottom: 82px; width: 258px; background: #fff; border-radius: 18px; padding: 18px; box-shadow: 0 22px 54px rgba(4,12,44,.4); color: var(--ink); display: none; cursor: default; }
.logout-pop.show { display: block; }
.logout-pop b { font-size: 16px; display: flex; align-items: center; gap: 7px; }
.logout-pop p { font-size: 13px; color: var(--muted); line-height: 1.65; margin: 8px 0 14px; }
.lp-btns { display: flex; gap: 10px; justify-content: flex-end; }
.lp-btns button { border: 0; border-radius: 11px; padding: 9px 16px; font-size: 13.5px; font-weight: 700; cursor: pointer; }
.lp-cancel { background: #eef1f7; color: #4a5878; }
.lp-ok { background: #e5484d; color: #fff; }

/* 滚动条 */
.desktop-app ::-webkit-scrollbar { width: 10px; height: 10px; }
.desktop-app ::-webkit-scrollbar-thumb { background: #c0cbe4; border-radius: 5px; }
.desktop-app ::-webkit-scrollbar-track { background: transparent; }

/* 响应式 */
@media (max-width: 860px) {
  .login-inner { flex-direction: column; gap: 34px; }
}
@media (max-width: 900px) {
  .dtags { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; }
  .app-card { padding: 18px; }
}
</style>

<template>
  <div v-show="visible" class="full">
    <div v-show="!isFullscreen" class="full-bar">
      <div class="full-icon" :style="coverBgStyle">{{ coverLetter }}</div>
      <div class="full-tit">
        <b>{{ displayName }}</b>
        <small>{{ typeLabel }} · {{ fullLocation }}</small>
      </div>
    </div>
    <div class="full-body" v-if="visible">
      <!-- 扣子编程：Coze Web SDK 官方对接（iframe 由 SDK 挂载到容器内） -->
      <div
        v-if="previewMode === 'chat'"
        ref="cozeSdkBox"
        class="coze-sdk-box"
      />
      <div v-if="previewMode === 'chat' && !sdkReady" class="full-loading">
        <span class="loading-spinner" />
        <span>AI 对话加载中...</span>
      </div>
      <!-- iframe 预览（HTML单文件 / HTML文件包 / 其它文件 / 其它URL / 扣子智能体） -->
      <iframe
        v-if="previewMode === 'iframe' && previewSrc"
        :src="previewSrc"
        :title="displayName"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
        allow="clipboard-read; clipboard-write; microphone; camera"
        @load="iframeLoading = false"
      />
      <!-- 加载遮罩 -->
      <div v-if="previewMode === 'iframe' && iframeLoading" class="full-loading">
        <span class="loading-spinner" />
        <span>加载中...</span>
      </div>
      <!-- 占位提示（不支持 / 暂无资源） -->
      <div v-if="previewMode === 'unsupported' || previewMode === 'empty'" class="full-ph">
        <div class="fp-icon" :style="coverBgStyle">{{ coverLetter }}</div>
        <h3>{{ displayName }}</h3>
        <p v-if="detail.description">{{ detail.description }}</p>
        <div class="fp-note">{{ previewTip }}</div>
      </div>
    </div>
    <!-- 工作栏提取到头部栏之外，保证全屏下头部栏隐藏时仍可操作 -->
    <div
      ref="actions"
      class="full-actions"
      :class="{ 'full-actions--floating': useFloatingToolbar }"
      :style="useFloatingToolbar ? tbWrapStyle : null"
    >
      <div class="tb-actions" :class="{ show: tbOpen, rightside: tbRightSide }">
        <button
          v-if="showCopyLink"
          class="fav-btn full-tool-btn"
          type="button"
          title="复制资源直链"
          @click="copyResourceLink"
        >
          <svg class="ft-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <span>复制链接</span>
        </button>
        <button
          class="fav-btn full-tool-btn"
          type="button"
          :title="isFullscreen ? '退出全屏' : '全屏预览'"
          @click="toggleFullscreen"
        >
          <svg v-if="!isFullscreen" class="ft-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
          <svg v-else class="ft-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
          </svg>
          <span>{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
        </button>
        <button v-if="canFavorite" class="fav-btn" :class="{ active: isFavorited, loading: favLoading }" type="button" @click="toggleFavorite">
          <svg class="fav-heart" width="18" height="18" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
        </button>
        <button v-if="closable" class="full-close" type="button" @click="close">
          <span class="fc-ico">✕</span>
          <span v-if="useFloatingToolbar">返回</span>
        </button>
      </div>
      <!-- 浮动模式默认仅展示一个圆形按钮，点击展开操作项，支持拖拽移位 -->
      <div
        v-if="useFloatingToolbar"
        class="tb-fab"
        :class="{ open: tbOpen }"
        title="拖拽移动 · 点击展开工具栏"
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
        <span class="pt">工具栏</span>
      </div>
    </div>
  </div>
</template>

<script>
import { store as authStore } from 'auth-layout-wxj';
import { getAgentDetail, saveUseRecord, getCommonAgentDetail, updateViewNum } from '@/api/agent';
import { getUserFavoriteInfo, addFavorite, deleteFavorite } from '@/api/favourite';
import { getToken, getDownloadUrlByAttachmentKey } from '@/utils/auth';
import { CozeWebSDK } from '@coze/web-sdk/js';
import { MOCK_DATA_ENABLED } from '@/config/local-preview';

/** 封面渐变调色板 */
const COVER_COLORS = [
  '#2b6cff', '#8b5cf6', '#e07b39', '#0e9f6e', '#ed8a20',
  '#ec6b58', '#1597c7', '#f3a62f', '#fb765b', '#3f9e6d'
];

const AGENT_TYPE_MAP = { 1: '智能体', 2: '实用工具', 3: '教学资源' };

/** 个人收藏状态：selfIsFavorite 1 未收藏 / 2 已收藏（与 agent-card.vue 一致） */
const FAVORITE_YES = 2;
const FAVORITE_NO = 1;

export default {
  name: 'AppPreview',
  props: {
    /** 浮动展示工作栏：false 收藏/关闭按钮位于头部栏右侧（进入全屏后仍切换为浮动工作栏）；true 固定展示为浮动工作栏 */
    floatingToolbar: {
      type: Boolean,
      default: false
    },
    /** 是否允许关闭预览：分享预览等独立全屏页设为 false，隐藏关闭/返回按钮并禁用 Escape 关闭 */
    closable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false,
      app: null,
      detail: {},
      isFavorited: false,
      favLoading: false,
      iframeLoading: false,
      isFullscreen: false,
      /* 浮动工作栏：收起/展开 + 拖拽移位状态 */
      tbOpen: false,
      tbRightSide: false,
      tbDragState: null,
      tbDragMoved: false,
      tbLeft: '',
      tbTop: '',
      /* Coze Web SDK 实例及加载状态 */
      cozeSdk: null,
      sdkReady: false
    };
  },
  computed: {
    /** 合并后的展示数据（详情优先） */
    merged() {
      return { ...(this.app || {}), ...(this.detail || {}) };
    },
    /** 智能体名称 */
    displayName() {
      return this.merged.name || '?';
    },
    /** 封面首字 */
    coverLetter() {
      return this.displayName.charAt(0);
    },
    /** 封面渐变背景 */
    coverBgStyle() {
      const idx = (this.merged.id || 0) % COVER_COLORS.length;
      const color = COVER_COLORS[idx];
      return { background: `linear-gradient(135deg, ${color}, ${color}88)` };
    },
    /** 智能体类型文本 */
    typeLabel() {
      return AGENT_TYPE_MAP[this.merged.agentType] || '应用';
    },
    /** 全屏标题栏中的定位描述（学科） */
    fullLocation() {
      return this.merged.subjectNames || '不限（跨学科通用）'
    },
    /** 仅已发布（publishStatus 为 1）且非体验模式的智能体展示收藏按钮 */
    canFavorite() {
      return Number(this.merged.publishStatus) === 1 && !this.$store.state.agent.guestMode;
    },
    /** 预览模式：iframe / chat / unsupported / empty */
    previewMode() {
      return this.resolvePreview().mode;
    },
    /** 预览 URL */
    previewSrc() {
      return this.resolvePreview().src || '';
    },
    /** 占位提示文字 */
    previewTip() {
      return this.resolvePreview().tip || '暂无预览';
    },
    /** 预览模式为 chat 时的扣子编程对话配置（accessType 1007） */
    chatConfig() {
      return this.resolvePreview().config || {};
    },
    /**
     * 资源直链：用于「非智能体」类型应用向用户暴露可分享的地址
     * - 1001 HTML 单文件 / 1005 其它文件：首个附件的下载直链
     * - 1002 HTML 文件包：文件包本身的下载直链
     * - 1006 其它 URL：原始 URL
     * 其它类型（1003 扣子 / 1004 腾讯 ADP）无直链含义，返回空串
     */
    copyableLink() {
      const merged = this.merged;
      // 同 resolvePreview：接口编码可能为字符串，归一化为数值后匹配
      const accessType = Number(merged.accessType);
      const accessConfig = merged.accessConfig;
      if (!accessType || !accessConfig) return '';
      const config = this.safeParse(accessConfig);
      if (!config) return '';
      switch (accessType) {
        case 1001:
        case 1005:
          return this.getFirstFileUrl(config);
        case 1006:
          return config.url || '';
        default:
          return '';
      }
    },
    /** 非「智能体」类型（agentType !== 1）且存在可复制直链时，展示复制链接按钮 */
    showCopyLink() {
      return Number(this.merged.agentType) !== 1 && !!this.copyableLink;
    },
    /** 是否采用浮动工作栏：floatingToolbar 为 true，或非浮动模式下进入全屏 */
    useFloatingToolbar() {
      return this.floatingToolbar || this.isFullscreen;
    },
    /** 浮动工作栏拖拽后的定位样式（未拖拽时沿用 CSS 默认右下角） */
    tbWrapStyle() {
      if (this.tbLeft === '') return {};
      return { left: this.tbLeft, top: this.tbTop, right: 'auto', bottom: 'auto' };
    }
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown);
    document.addEventListener('pointerdown', this.onDocPointerDown);
    document.addEventListener('fullscreenchange', this.syncFullscreenState);
    document.addEventListener('webkitfullscreenchange', this.syncFullscreenState);
    document.addEventListener('mozfullscreenchange', this.syncFullscreenState);
    document.addEventListener('MSFullscreenChange', this.syncFullscreenState);
  },
  beforeDestroy() {
    this.destroyCozeSdk();
    document.removeEventListener('keydown', this.onKeydown);
    document.removeEventListener('pointerdown', this.onDocPointerDown);
    document.removeEventListener('fullscreenchange', this.syncFullscreenState);
    document.removeEventListener('webkitfullscreenchange', this.syncFullscreenState);
    document.removeEventListener('mozfullscreenchange', this.syncFullscreenState);
    document.removeEventListener('MSFullscreenChange', this.syncFullscreenState);
  },
  methods: {
    /* ===== 扣子编程：Coze Web SDK 对接 ===== */
    /** 在预览容器内初始化 Web SDK，加载智能体/工作流对话界面 */
    mountCozeSdk() {
      this.destroyCozeSdk();
      const cfg = this.chatConfig;
      if (!cfg.projectId || !cfg.token) return;
      const box = this.$refs.cozeSdkBox;
      if (!box) return;
      const sdk = new CozeWebSDK();
      sdk.init({
        container: box,
        projectId: cfg.projectId,
        token: cfg.token,
        theme: 'light',
        onIframeReady: () => {
          this.sdkReady = true;
        },
        onTokenExpired: () => {
          console.warn('[AppPreview] Coze Web SDK token 已过期');
        },
        onTokenInvalid: () => {
          console.warn('[AppPreview] Coze Web SDK token 校验失败');
        },
        onNetworkError: (payload) => {
          console.warn('[AppPreview] Coze Web SDK 网络异常：', payload);
        }
      });
      this.cozeSdk = sdk;
    },
    /** 销毁 SDK 实例并移除其挂载的 iframe */
    destroyCozeSdk() {
      if (!this.cozeSdk) return;
      this.cozeSdk.destroy();
      this.cozeSdk = null;
      this.sdkReady = false;
    },
    onKeydown(e) {
      if (e.key !== 'Escape' || !this.visible) return;
      // 不可关闭模式（如分享预览独立全屏页）下忽略 Escape
      if (!this.closable) return;
      // 全屏态下浏览器自身消费 Escape 用于退出全屏，避免误关闭预览
      if (this.isFullscreen) return;
      this.close();
    },
    /* ===== 浮动工作栏：拖拽移位 + 点击收起/展开 ===== */
    onFabPointerDown(e) {
      if (e.button !== 0) return;
      const wrap = this.$refs.actions;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      // 相对根节点定位：锚点需减去根节点偏移，保证普通态与全屏态坐标一致、位置不跳动
      const base = this.$el.getBoundingClientRect();
      this.tbLeft = (rect.left - base.left) + 'px';
      this.tbTop = (rect.top - base.top) + 'px';
      this.tbDragState = { sx: e.clientX, sy: e.clientY, ox: rect.left - base.left, oy: rect.top - base.top };
      this.tbDragMoved = false;
      window.addEventListener('pointermove', this.onFabPointerMove);
      window.addEventListener('pointerup', this.onFabPointerUp);
    },
    onFabPointerMove(e) {
      if (!this.tbDragState) return;
      const dx = e.clientX - this.tbDragState.sx;
      const dy = e.clientY - this.tbDragState.sy;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) this.tbDragMoved = true;
      if (this.tbDragMoved) {
        this.tbLeft = (this.tbDragState.ox + dx) + 'px';
        this.tbTop = (this.tbDragState.oy + dy) + 'px';
        if (this.tbOpen) this.placeTb();
      }
    },
    onFabPointerUp() {
      window.removeEventListener('pointermove', this.onFabPointerMove);
      window.removeEventListener('pointerup', this.onFabPointerUp);
      // 未发生拖拽则视为点击，切换展开/收起
      if (!this.tbDragMoved) this.toggleTb();
      this.tbDragState = null;
    },
    /** 展开方向：靠近屏幕左侧时改为向右展开 */
    placeTb() {
      const wrap = this.$refs.actions;
      if (!wrap) return;
      this.tbRightSide = wrap.getBoundingClientRect().left < 470;
    },
    toggleTb() {
      this.tbOpen = !this.tbOpen;
      if (this.tbOpen) this.placeTb();
    },
    /** 点击工作栏外部区域时收起展开的操作项（仅浮动模式） */
    onDocPointerDown(e) {
      if (!this.useFloatingToolbar || !this.visible || !this.tbOpen) return;
      const wrap = this.$refs.actions;
      if (wrap && wrap.contains(e.target)) return;
      this.tbOpen = false;
    },
    /** 切换浏览器全屏（作用于预览根节点，覆盖头部栏与内容区） */
    toggleFullscreen() {
      const doc = document;
      const active = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
      if (active) {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (exit) Promise.resolve(exit.call(doc)).catch(() => {});
        return;
      }
      const el = this.$el;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (!req) {
        this.$message.warning('当前浏览器不支持全屏预览');
        return;
      }
      Promise.resolve(req.call(el)).then(() => {
        // 进入全屏后工具栏默认收起并重置到右下角（清除拖拽位移）
        this.tbOpen = false;
        this.tbLeft = '';
        this.tbTop = '';
      }).catch(() => {
        this.$message.error('进入全屏失败，请检查浏览器权限');
      });
    },
    /** 同步浏览器全屏状态到组件（供 fullscreenchange 事件回调使用） */
    syncFullscreenState() {
      const doc = document;
      const prevFullscreen = this.isFullscreen;
      this.isFullscreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      // 全屏与窗口态根节点高度不同：状态切换后清除拖拽/点击捕获的绝对定位，
      // 让浮动工具栏回退到 CSS 默认右下角，避免退出全屏时残留全屏坐标导致工具栏移出可视区
      if (prevFullscreen !== this.isFullscreen) {
        this.tbLeft = '';
        this.tbTop = '';
        this.tbOpen = false;
      }
    },
    /** 复制资源直链到剪贴板：优先使用异步 Clipboard API，非安全上下文回退到 execCommand */
    copyResourceLink() {
      const url = this.copyableLink;
      if (!url) return;
      const fallbackCopy = () => {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', 'readonly');
        textarea.style.position = 'fixed';
        textarea.style.top = '-1000px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => {
          this.$message({ type: 'success', message: '链接已复制' });
        }).catch(() => {
          if (fallbackCopy()) this.$message({ type: 'success', message: '链接已复制' });
          else this.$message.error('复制失败，请手动复制链接');
        });
        return;
      }
      if (fallbackCopy()) this.$message({ type: 'success', message: '链接已复制' });
      else this.$message.error('复制失败，请手动复制链接');
    },
    /** 安全解析 JSON */
    safeParse(str) {
      if (!str) return null;
      try {
        return JSON.parse(str);
      } catch (e) {
        return null;
      }
    },
    /** 从文件数组中取第一个 attachmentKey 的下载地址 */
    getFirstFileUrl(fileList) {
      if (!fileList || !Array.isArray(fileList) || !fileList.length) return '';
      const key = fileList[0] && fileList[0].attachmentKey;
      if (!key) return '';
      return getDownloadUrlByAttachmentKey(key);
    },
    /** 根据 accessType 解析预览信息（参考 agent-preview.tsx resolvePreview） */
    resolvePreview() {
      if (MOCK_DATA_ENABLED) {
        return { mode: 'unsupported', tip: '本地模拟详情：资源说明来自线上公开快照。在线应用与 AI 对话未接入，当前不会请求第三方服务。' };
      }
      const merged = this.merged;
      // 接口可能返回字符串编码（如 "1007"），归一化为数值后再匹配，避免 switch 严格相等落到 unsupported 分支
      const accessType = Number(merged.accessType);
      const accessConfig = merged.accessConfig;

      if (!accessType || !accessConfig) {
        return { mode: 'empty', tip: '暂无预览资源' };
      }

      const config = this.safeParse(accessConfig);
      if (!config) return { mode: 'empty', tip: '预览配置解析失败' };
      switch (accessType) {
        /* HTML 单文件 */
        case 1001: {
          const url = this.getFirstFileUrl(config);
          return url ? { mode: 'iframe', src: url } : { mode: 'empty', tip: '暂无预览资源' };
        }
        /* 扣子平台 */
        case 1003: {
          const agentIndexobj = {
            bot_id: config.botId,
            token: getToken(),
            newtoken: config.token,
            icon: merged.logoImg,
            name: merged.name,
            userInfo: {
              id: (authStore.state.userInfo || {}).id,
              avatar: authStore.getters.avatar,
              name: authStore.getters.name
            }
          };
          localStorage.setItem('agentIndexobj', JSON.stringify(agentIndexobj));
          return { mode: 'iframe', src: '/agentPlatformSch/AIDemo/index.html' };
        }
        /* 扣子编程：Coze Web SDK 对接，仅需项目 ID 与访问令牌 */
        case 1007: {
          const projectId = config.projectId ? String(config.projectId) : '';
          if (!projectId || !config.token) {
            return { mode: 'empty', tip: '扣子编程接入配置不完整' };
          }
          return {
            mode: 'chat',
            config: {
              projectId,
              token: config.token
            }
          };
        }
        /* 其它文件 */
        case 1005: {
          const url = this.getFirstFileUrl(config);
          return url ? { mode: 'iframe', src: `${url}?ci-process=doc-preview&dstType=html&page=1` } : { mode: 'empty', tip: '暂无预览资源' };
        }
        /* 其它 URL */
        case 1006: {
          const url = config.url;
          return url ? { mode: 'iframe', src: url } : { mode: 'empty', tip: '暂无预览资源' };
        }
        default:
          return { mode: 'unsupported', tip: '暂不支持该类型预览' };
      }
    },
    /** 打开预览：加载详情 + 记录使用 + 查询收藏状态 */
    open(agent) {
      this.app = agent;
      this.detail = {};
      this.isFavorited = false;
      this.iframeLoading = true;
      this.tbOpen = false;
      this.tbRightSide = false;
      this.tbLeft = '';
      this.tbTop = '';
      this.sdkReady = false;
      this.visible = true;

      const id = agent.id;
      if (!id) return;

      // 体验模式（跳过扫码登录）：详情/浏览数走非鉴权接口，不查收藏状态
      if (this.$store.state.agent.guestMode) {
        getCommonAgentDetail(id).then((res) => {
          this.detail = res.data || {};
          this.$nextTick(() => this.mountCozeSdk());
        }).catch((err) => {
          console.warn('[AppPreview] 获取智能体详情失败：', err);
        });
        updateViewNum(id).catch((err) => {
          console.warn('[AppPreview] 更新浏览数失败：', err);
        });
        return;
      }

      // 获取智能体详情
      getAgentDetail(id).then((res) => {
        this.detail = res.data || {};
        this.$nextTick(() => this.mountCozeSdk());
      }).catch((err) => {
        console.warn('[AppPreview] 获取智能体详情失败：', err);
      });

      // 保存使用记录
      saveUseRecord(id).catch((err) => {
        console.warn('[AppPreview] 保存使用记录失败：', err);
      });

      // 查询当前用户收藏状态
      getUserFavoriteInfo(id, 1).then((res) => {
        this.isFavorited = !!res.data;
      }).catch((err) => {
        console.warn('[AppPreview] 查询收藏状态失败：', err);
      });
    },
    /** 关闭预览：若处于全屏则同步退出，避免残留全屏态影响宿主页面 */
    close() {
      if (this.isFullscreen) {
        const doc = document;
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (exit) Promise.resolve(exit.call(doc)).catch(() => {});
      }
      this.visible = false;
      this.destroyCozeSdk();
      this.$emit('close');
    },
    /** 切换收藏状态 */
    toggleFavorite() {
      if (!this.canFavorite || this.favLoading) return;
      const id = this.app && this.app.id;
      if (!id) return;

      this.favLoading = true;
      const request = this.isFavorited
        ? deleteFavorite({ objectId: id, objectType: 1, type: 1 })
        : addFavorite({ objectId: id, objectType: 1, type: 1 });

      request.then(() => {
        this.isFavorited = !this.isFavorited;
        // 更新 store 中的收藏统计
        this.$store.dispatch('agent/loadAgentStats');
        // 收藏状态变更：通知父组件回写列表数据（selfIsFavorite），同步卡片收藏展示
        this.$emit('favorite', { agent: this.app, selfIsFavorite: this.isFavorited ? FAVORITE_YES : FAVORITE_NO });
      }).catch((err) => {
        console.warn('[AppPreview] 收藏操作失败：', err);
      }).finally(() => {
        this.favLoading = false;
      });
    }
  }
};
</script>

<style scoped>
.full {
  position: fixed; inset: 0; z-index: 300;
  display: flex; flex-direction: column; background: #fff;
  animation: fullIn .22s ease;
}
@keyframes fullIn {
  from { opacity: 0; transform: scale(.985); }
  to { opacity: 1; transform: scale(1); }
}
.full-bar {
  height: 52px; flex-shrink: 0; display: flex; align-items: center; gap: 12px;
  padding: 0 16px 0 18px; color: #fff;
  background: linear-gradient(90deg, #12204f, #1d3a8f 60%, #16296a);
}
.full-icon {
  width: 32px; height: 32px; border-radius: 9px; color: #fff;
  display: grid; place-items: center; font-size: 15px; font-weight: 800; flex-shrink: 0;
}
.full-tit { flex: 1; min-width: 0; }
.full-tit b {
  font-size: 17px; font-weight: 700; display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.full-tit small { font-size: 12px; opacity: .6; }
.full-actions {
  position: absolute; top: 10px; right: 16px; z-index: 20;
  display: flex; align-items: center; gap: 10px;
}
/* 非浮动模式：按钮组不改变头部栏布局 */
.tb-actions { display: contents; }
/* 浮动工作栏：右下角圆形 FAB，可拖拽移位、点击展开操作项 */
.full-actions--floating {
  top: auto;
  position: absolute; right: 24px; bottom: 96px; z-index: 310;
  display: block;
  user-select: none; -webkit-user-select: none; touch-action: none;
}
/* 圆形主按钮：默认仅展示这一个 */
.full-actions--floating .tb-fab {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  width: 76px; height: 76px; border-radius: 50%; cursor: grab; color: #fff;
  background: linear-gradient(150deg, #3c4d74, #1c2b55 70%); border: 1px solid rgba(255,255,255,.28);
  box-shadow: 0 12px 30px rgba(10,22,60,.45);
  transition: background .3s ease, box-shadow .3s ease, transform .18s ease;
}
.full-actions--floating .tb-fab:active { cursor: grabbing; transform: scale(.96); }
.full-actions--floating .tb-fab .pw { display: grid; place-items: center; line-height: 1; transition: transform .38s cubic-bezier(.34,1.5,.5,1); }
.full-actions--floating .tb-fab .pt { font-size: 11.5px; letter-spacing: .14em; opacity: .92; font-weight: 700; }
.full-actions--floating .tb-fab.open { background: linear-gradient(150deg, #2b6cff, #7c3aed); box-shadow: 0 14px 36px rgba(43,108,255,.55); }
.full-actions--floating .tb-fab.open .pw { transform: rotate(45deg); }
/* 展开的操作项组：默认从 FAB 向左错峰滑出 */
.full-actions--floating .tb-actions {
  position: absolute; right: 92px; bottom: 10px;
  display: flex; align-items: center; gap: 12px; pointer-events: none;
}
.full-actions--floating .tb-actions.rightside { right: auto; left: 92px; }
/* 操作胶囊：与桌面端右下角工作台保持一致；默认隐藏，展开后滑入 */
.full-actions--floating .fav-btn,
.full-actions--floating .full-close {
  display: inline-flex; align-items: center; gap: 9px; height: 56px; padding: 0 22px;
  border-radius: 999px; border: 1px solid rgba(255,255,255,.2);
  background: rgba(17,29,64,.93); color: #fff;
  font-size: 16px; font-weight: 700; font-family: inherit; white-space: nowrap;
  backdrop-filter: blur(8px); box-shadow: 0 10px 26px rgba(10,22,60,.38);
  opacity: 0; transform: translateX(52px) scale(.8); pointer-events: none;
  transition: opacity .2s ease, transform .32s cubic-bezier(.3,1.5,.45,1), background .18s ease, box-shadow .2s ease;
}
.full-actions--floating .tb-actions.rightside .fav-btn,
.full-actions--floating .tb-actions.rightside .full-close { transform: translateX(-52px) scale(.8); }
.full-actions--floating .tb-actions.show .fav-btn,
.full-actions--floating .tb-actions.show .full-close { opacity: 1; transform: none; pointer-events: auto; }
.full-actions--floating .fav-btn:hover { background: rgba(30,46,94,.95); }
.full-actions--floating .fav-btn.active {
  background: linear-gradient(120deg, #2b6cff, #7c3aed); border-color: transparent;
  box-shadow: 0 12px 30px rgba(43,108,255,.5);
}
.full-actions--floating .fav-heart { width: 19px; height: 19px; }
.full-actions--floating .ft-ico { width: 19px; height: 19px; }
.full-actions--floating .fc-ico { font-size: 19px; line-height: 1; }
/* 关闭按钮：对应工作台的 danger 操作项 */
.full-actions--floating .full-close {
  width: auto; background: linear-gradient(120deg, #e5484d, #c62f4b); border-color: transparent;
  box-shadow: 0 12px 28px rgba(198,47,75,.45);
}
.full-actions--floating .full-close:hover { background: linear-gradient(120deg, #f25b62, #d23a52); }
/* 错峰：离 FAB 越近越先出现（向左展开时右侧最后一个最先） */
.full-actions--floating .tb-actions.show > :last-child { transition-delay: 0s; }
.full-actions--floating .tb-actions.show > :nth-last-child(2) { transition-delay: .045s; }
.full-actions--floating .tb-actions.show > :nth-last-child(3) { transition-delay: .09s; }
.full-actions--floating .tb-actions.show > :nth-last-child(4) { transition-delay: .135s; }
.full-close {
  width: 32px; height: 32px; border-radius: 8px; border: 0;
  background: rgba(255,255,255,.15); color: #fff; font-size: 15px;
  cursor: pointer; display: grid; place-items: center; flex-shrink: 0;
  transition: background .15s;
}
.full-close:hover { background: rgba(255,255,255,.3); }
.fav-btn {
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px;
  border-radius: 20px; border: 1px solid rgba(255,255,255,.3);
  background: rgba(255,255,255,.1); color: rgba(255,255,255,.85);
  font-size: 13px; font-weight: 600; cursor: pointer; flex-shrink: 0;
  transition: all .2s;
}
.fav-btn:hover { background: rgba(255,255,255,.2); }
.fav-btn.active { color: #ff6b8a; border-color: rgba(255,107,138,.4); background: rgba(255,107,138,.15); }
.fav-btn.loading { opacity: .6; cursor: wait; }
.fav-heart { width: 16px; height: 16px; flex-shrink: 0; }
.ft-ico { width: 16px; height: 16px; flex-shrink: 0; }
/* 预览根节点进入全屏时保持白底，避免默认黑色 backdrop 透射 */
.full:fullscreen { background: #fff; }
.full-body { flex: 1; min-height: 0; background: #fff; position: relative; overflow: hidden; }
.full-body iframe { width: 100%; height: 100%; border: 0; display: block; background: #fff; }
/* Coze Web SDK 容器：占满预览区，SDK 在其内部挂载 100% 宽高的 iframe */
.coze-sdk-box { width: 100%; height: 100%; padding: 20px 0; background: #fff; }
.full-loading {
  position: absolute; inset: 0; z-index: 10;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: #f8fafc; font-size: 14px; color: #64748b;
}
.loading-spinner {
  width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.full-ph {
  height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 18px; padding: 40px; text-align: center;
  background: linear-gradient(160deg, #f7f9fe, #eef3ff);
}
.fp-icon {
  width: 110px; height: 110px; border-radius: 28px;
  display: grid; place-items: center; color: #fff; font-size: 48px; font-weight: 800;
  box-shadow: 0 18px 40px rgba(33,104,243,.22);
}
.full-ph h3 { font-size: 30px; color: #13213d; }
.full-ph p { font-size: 18px; color: #5f6f8e; max-width: 640px; line-height: 1.9; }
.fp-note {
  margin-top: 10px; font-size: 15px; color: #7f8fb0; background: #fff;
  border: 1px dashed #e2e8f5; padding: 12px 22px; border-radius: 12px;
}
</style>

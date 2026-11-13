<template>
  <aside class="sidebar">
    <!-- 顶部：应用名称 -->
    <button class="brand" type="button" @click="goHome">
      <img class="brand-logo" :src="appLogoUrl" :alt="appName">
      <span class="brand-name" :title="appName">{{ appName }}</span>
    </button>

    <!-- 中部：菜单列表 -->
    <div class="sidebar-body">
      <nav class="nav">
        <template v-for="item in visibleNavPages">
          <!-- 含子菜单的分组：点击展开/收起，子项单独导航 -->
          <div v-if="item.children" :key="'group-' + item.key" class="nav-group">
            <button
              type="button"
              class="nav-item nav-group-head"
              :class="{ 'group-active': isGroupActive(item) }"
              @click="toggleGroup(item.key)"
            >
              <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[item.icon]" />
              </svg>
              <span class="nav-text">{{ item.title }}</span>
              <svg class="icon nav-arrow" :class="{ open: isExpanded(item.key) }" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.chevronRight" />
              </svg>
            </button>
            <div v-show="isExpanded(item.key)" class="nav-sublist">
              <button
                v-for="child in item.children"
                :key="child.key"
                type="button"
                class="nav-item nav-subitem"
                :class="{ active: isActive(child.key) }"
                @click="goPage(child.key)"
              >
                <svg class="icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[child.icon]" />
                </svg>
                <span class="nav-text">{{ child.title }}</span>
                <em v-if="child.badge === 'pendingApproval' && pendingApprovalCount" class="nav-badge">{{ pendingApprovalCount }}</em>
              </button>
            </div>
          </div>
          <!-- 普通叶子项 -->
          <button
            v-else
            :key="'leaf-' + item.key"
            type="button"
            class="nav-item"
            :class="{ active: isActive(item.key) }"
            @click="goPage(item.key)"
          >
            <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[item.icon]" />
            </svg>
            <span class="nav-text">{{ item.title }}</span>
            <em v-if="item.badge === 'favorite'" class="nav-badge">{{ favoriteCount }}</em>
          </button>
        </template>
      </nav>

    </div>

    <!-- 底部固定：上传智能体/工具 -->
    <button class="upload-button" type="button" @click="openUpload">
      <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.plus" />
      </svg>
      上传智能体/工具
    </button>

    <!-- 底部固定：平台使用手册 -->
    <button
      type="button"
      class="nav-item manual-item"
      :class="{ active: isActive('manual') }"
      @click="handleManualClick"
    >
      <span class="manual-icon">
        <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.book" />
        </svg>
      </span>
      <span class="manual-copy">
        <span class="manual-title">平台使用手册</span>
        <small class="manual-desc">功能说明与操作指引</small>
      </span>
      <svg class="icon manual-arrow" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.chevronRight" />
      </svg>
    </button>

    <!-- 底部：用户信息 -->
    <el-dropdown class="user-dropdown" trigger="click" placement="top-end" @command="handleUserCommand">
      <div class="user-trigger">
        <span class="user-avatar">
          <img class="user-avatar-img" :src="avatarUrl" :alt="displayName" @error="onAvatarError">
        </span>
        <span class="user-copy">
          <b class="user-name">{{ displayName }}</b>
        </span>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item class="user-menu-item" command="logout">
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </aside>
</template>

<script>
import { mapGetters } from 'vuex';
import { store as authStore, isShowByPermission } from 'auth-layout-wxj';
import { gotoLoginPage, logoutRmCookies, defaultAvatarUrl, defaultSchoolLogoUrl } from '@/utils/auth';
import { NAV_PAGES } from '@/config/nav';
import { ICONS } from '@/constants/icons';
import { LOCAL_PREVIEW_ENABLED, MOCK_DATA_ENABLED } from '@/config/local-preview';

// 平台默认标识：未获取到应用注册信息（如本地演示模式）时兜底展示
const FALLBACK_LOGO_URL = defaultSchoolLogoUrl;

// 应用图标：后端直接返回完整 URL，无值时使用兜底图
function resolveLogoUrl(appJson) {
  const squareIcon = appJson && appJson.roundLogoUrl;
  return squareIcon || FALLBACK_LOGO_URL;
}

export default {
  name: 'SideNav',
  data() {
    return {
      icons: ICONS,
      // 分组展开状态：key 为分组项 key，value 为是否展开
      expanded: {}
    };
  },
  computed: {
    ...mapGetters('agent', ['favoriteCount', 'pendingApprovalCount', 'platformName', 'platformLogo', 'platformOptDocs']),
    appName() {
      // 优先展示平台设置的名称，未配置时默认「AI智能体平台」
      return this.platformName || 'AI智能体平台';
    },
    appLogoUrl() {
      // 优先展示平台设置的 Logo，未配置时回退学校 Logo
      return this.platformLogo || resolveLogoUrl(authStore.state.schoolInfo);
    },
    displayName() {
      return MOCK_DATA_ENABLED ? '本地模拟预览' : authStore.getters.name || '未登录用户';
    },
    avatarUrl() {
      return authStore.getters.avatar || defaultAvatarUrl;
    },
    // 依据 authStore.state.permissions 过滤侧栏菜单：
    // - 顶层叶子/分组项：未配 permission 视为公开；已配置则要求命中
    // - 分组子项同样支持 permission，全部被过滤时隐藏整个分组
    // - 权限数据未下发（如本地演示模式）时降级放行，避免菜单全空
    visibleNavPages() {
      return NAV_PAGES
        .filter((item) => this.hasPermission(item))
        .map((item) => {
          if (!item.children || !item.children.length) {
            return item;
          }
          return {
            ...item,
            children: item.children.filter((child) => this.hasPermission(child))
          };
        })
        .filter((item) => !item.children || item.children.length > 0);
    }
  },
  watch: {
    // 路由变化时自动展开当前子菜单所属分组
    $route() {
      this.expandActiveGroup();
    }
  },
  created() {
    this.expandDefaultGroups();
    this.expandActiveGroup();
  },
  mounted() {
    // 仅当当前用户可见“智能体审批”菜单时拉取待审批数，避免无权限用户多余请求
    const hasApproveMenu = this.visibleNavPages.some((item) =>
      (item.children || []).some((child) => child.badge === 'pendingApproval')
    );
    if (hasApproveMenu) {
      this.$store.dispatch('agent/loadPendingApprovalCount');
    }
  },
  methods: {
    handleManualClick() {
      if (MOCK_DATA_ENABLED) {
        this.$message.info('平台使用手册尚未保存本地快照，模拟模式不会访问在线文档。');
        return;
      }
      // 已上传平台操作手册：用 COS 文档预览转 HTML 打开；未上传时回退内置文档链接
      const previewUrl = this.resolveManualPreviewUrl();
      window.open(previewUrl || 'https://docs.qq.com/doc/DV0RTRmZXdGpQSnZG', '_blank', 'noopener');
    },
    /** 解析平台操作手册存储字段，拼接 COS 文档预览参数：取首个文档 URL */
    resolveManualPreviewUrl() {
      const raw = this.platformOptDocs;
      if (!raw) return '';
      let url = '';
      try {
        const parsed = JSON.parse(raw);
        const first = Array.isArray(parsed) && parsed.find((item) => item && item.attachmentKey);
        url = first ? first.attachmentKey : '';
      } catch (error) {
        // 非 JSON：兼容存单个 URL 字符串
        url = String(raw);
      }
      if (!url) return '';
      const sep = url.indexOf('?') === -1 ? '?' : '&';
      return `${url}${sep}ci-process=doc-preview&dstType=html&page=1`;
    },
    // 单项权限判断：未配置 permission 直接放行；权限列表为空视为无数据下发，降级放行
    hasPermission(item) {
      // 临时本地预览仅展示菜单入口；接口权限仍由后端校验，关闭开关后恢复菜单过滤。
      if (LOCAL_PREVIEW_ENABLED || MOCK_DATA_ENABLED) {
        return true;
      }
      if (!item || !item.permission) {
        return true;
      }
      return isShowByPermission(item.permission);
    },
    isActive(key) {
      return this.$route.name === key;
    },
    isExpanded(key) {
      return !!this.expanded[key];
    },
    toggleGroup(key) {
      this.$set(this.expanded, key, !this.expanded[key]);
    },
    // 含子菜单的分组默认展开
    expandDefaultGroups() {
      this.visibleNavPages.forEach((item) => {
        if (item.children && item.children.length) {
          this.$set(this.expanded, item.key, true);
        }
      });
    },
    isGroupActive(item) {
      return (item.children || []).some((child) => this.isActive(child.key));
    },
    expandActiveGroup() {
      const activeKey = this.$route.name;
      this.visibleNavPages.forEach((item) => {
        if (item.children && item.children.some((child) => child.key === activeKey)) {
          this.$set(this.expanded, item.key, true);
        }
      });
    },
    goPage(key) {
      if (key === 'competition') {
        this.$message.info('敬请期待')
        return
      }
      if (this.$route.name !== key) {
        this.$router.push({ name: key });
      }
    },
    goHome() {
      if (this.$route.name !== 'home') {
        this.$router.push({ name: 'home' });
      }
    },
    openUpload() {
      this.$store.commit('agent/SET_UPLOAD_VISIBLE', true);
    },
    // 头像加载失败时回退默认头像，避免展示裂图
    onAvatarError(event) {
      event.target.onerror = null;
      event.target.src = defaultAvatarUrl;
    },
    handleUserCommand(command) {
      if (command !== 'logout') {
        return;
      }
      this.$confirm('退出后需重新登录才能继续使用平台，确认退出吗？', '退出登录', {
        type: 'warning',
        confirmButtonText: '确认退出',
        cancelButtonText: '取消'
      }).then(() => {
        this.logOut();
      }).catch(() => {});
    },
    logOut() {
      logoutRmCookies().finally(() => {
        gotoLoginPage();
      });
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--surface);
  border-right: 1px solid var(--line);
  z-index: 25;
  padding: 18px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 顶部品牌区 */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: 0;
  padding: 4px 4px 12px;
  cursor: pointer;
  font: inherit;
  border-bottom: 1px solid var(--line);
  width: 100%;
  text-align: left;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  flex: none;
}

.brand-name {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: .04em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 中部菜单区，占据剩余空间并可滚动 */
.sidebar-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-item {
  border: 0;
  background: transparent;
  border-radius: 10px;
  height: 44px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  cursor: pointer;
  color: #53617a;
  font: inherit;
}

.nav-item:hover {
  background: var(--canvas);
}

.nav-item.active {
  background: var(--soft);
  color: var(--primary);
  font-weight: 600;
}

/* 分组子菜单 */
.nav-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-group-head.group-active {
  color: var(--primary);
}

.nav-arrow {
  margin-left: auto;
  color: #93a0b6;
  transition: transform .2s;
}

.nav-arrow.open {
  transform: rotate(90deg);
}

.nav-sublist {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 14px;
}

.nav-subitem {
  height: 40px;
  font-size: 13px;
}

.nav-badge {
  font-style: normal;
  margin-left: auto;
  background: #dce8ff;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 11px;
}

.upload-button {
  height: 43px;
  border: 0;
  border-radius: 9px;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  cursor: pointer;
  font: inherit;
  flex: none;
}

.upload-button:hover {
  background: var(--primary-dark);
}

/* 底部固定的“平台使用手册”：卡片式入口，与上方可滚动菜单区拉开层次 */
.manual-item {
  flex: none;
  height: auto;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--canvas);
  text-align: left;
  transition: border-color .2s, background-color .2s, color .2s;
}

.manual-item:hover {
  border-color: #cddffb;
  background: var(--soft);
  color: var(--primary);
}

.manual-item.active {
  border-color: var(--primary);
  background: var(--soft);
  color: var(--primary);
}

.manual-icon {
  flex: none;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: var(--surface);
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(19, 33, 61, .08);
}

.manual-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.manual-title {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.manual-desc {
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.manual-item:hover .manual-desc {
  color: var(--primary);
}

.manual-arrow {
  flex: none;
  color: #93a0b6;
  transition: transform .2s;
}

.manual-item:hover .manual-arrow {
  color: var(--primary);
  transform: translateX(2px);
}

@media (prefers-reduced-motion: reduce) {
  .manual-item,
  .manual-arrow {
    transition: none;
  }

  .manual-item:hover .manual-arrow {
    transform: none;
  }
}

/* 底部用户信息：与手册卡片已有色块分隔，不再重复画分隔线 */
.user-dropdown {
  flex: none;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: background .15s ease;
}

.user-trigger:hover {
  background: var(--canvas);
}

.user-avatar {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: var(--soft);
  overflow: hidden;
}

.user-avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 7px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
}
</style>

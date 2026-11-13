<template>
  <header class="topbar">
    <button class="brand" type="button" @click="goHome">
      <img class="brand-logo" :src="appLogoUrl" :alt="appName">
      <span class="brand-name">{{ appName }}</span>
    </button>

    <el-dropdown class="user-dropdown" trigger="click" placement="bottom-end" @command="handleUserCommand">
      <div class="user-trigger">
        <span class="user-avatar">
          <img class="user-avatar-img" :src="avatarUrl" :alt="displayName" @error="onAvatarError">
        </span>
        <span class="user-copy">
          <span class="user-line">
            <b class="user-name">{{ displayName }}</b>
            <em v-if="identityLabel" class="user-identity">{{ identityLabel }}</em>
          </span>
          <small v-if="unitLabel" class="user-unit" :title="unitLabel">{{ unitLabel }}</small>
        </span>
        <svg class="user-arrow" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.chevronDown" />
        </svg>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item class="user-menu-item" command="logout">
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </header>
</template>

<script>
import { store as authStore } from 'auth-layout-wxj';
import { mapGetters } from 'vuex';
import { gotoLoginPage, logoutRmCookies, defaultAvatarUrl } from '@/utils/auth';
import { ICONS } from '@/constants/icons';

// 平台默认标识：未获取到应用注册信息（如本地演示模式）时兜底展示
const FALLBACK_LOGO_URL = 'https://cdnfile-10043692.file.myqcloud.com/productVersion/projects/agentPlatform/djcjzx_logo.jpg';

// 应用图标：后端直接返回完整 URL，无值时使用兜底图
function resolveLogoUrl(appJson) {
  const squareIcon = appJson && appJson.roundLogoUrl;
  return squareIcon || FALLBACK_LOGO_URL;
}

export default {
  name: 'TopBar',
  data() {
    return {
      icons: ICONS
    };
  },
  computed: {
    // 组件挂载发生在 initApp 之后，auth-layout-wxj 内部 store 已就绪，直接读取即可
    ...mapGetters('agent', ['platformName', 'platformLogo']),
    appName() {
      // 优先展示平台设置的名称，未配置时默认「AI智能体平台」
      return this.platformName || 'AI智能体平台';
    },
    appLogoUrl() {
      // 优先展示平台设置的 Logo，未配置时回退学校 Logo
      return this.platformLogo || resolveLogoUrl(authStore.state.schoolInfo);
    },
    displayName() {
      return authStore.getters.name || '未登录用户';
    },
    unitLabel() {
      const schoolInfo = authStore.state.schoolInfo;
      return (schoolInfo && schoolInfo.schoolName) || '';
    },
    identityLabel() {
      return (authStore.state.userInfo && authStore.state.userInfo.loginTypeName) || '';
    },
    // 头像：后端直接返回完整 URL，无值时用默认头像
    avatarUrl() {
      return authStore.getters.avatar || defaultAvatarUrl;
    }
  },
  methods: {
    goHome() {
      if (this.$route.name !== 'home') {
        this.$router.push({ name: 'home' });
      }
    },
    // 头像加载失败时回退默认头像，避免展示裂图
    onAvatarError(event) {
      event.target.onerror = null;
      event.target.src = defaultAvatarUrl;
    },
    // 下拉菜单当前仅提供退出登录命令
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
    // 清除服务端会话与本地 Cookie 后跳转 IDS 登录页
    logOut() {
      logoutRmCookies().finally(() => {
        gotoLoginPage();
      });
    }
  }
};
</script>

<style scoped>
.topbar {
  height: 72px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 26px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: .08em;
}

.user-dropdown {
  margin-left: auto;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 196px;
  height: 48px;
  padding: 6px 10px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  cursor: pointer;
}

.user-trigger:hover {
  border-color: var(--primary);
}

.user-avatar {
  flex: none;
  width: 32px;
  height: 32px;
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
  line-height: 1.25;
}

.user-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-identity {
  flex: none;
  font-style: normal;
  font-size: 11px;
  color: var(--primary);
  background: var(--soft);
  border-radius: 6px;
  padding: 1px 6px;
}

.user-unit {
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  flex: none;
  color: var(--muted);
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 7px;
}
</style>

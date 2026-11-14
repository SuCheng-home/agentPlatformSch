<template>
  <div class="klh klh-shell">
    <header class="klh-top">
      <div class="klh-top__inner">
        <router-link to="/kelihua/subject" class="klh-top__brand" aria-label="科智汇 AI 矩阵平台首页">
          <img :src="logo" alt="" width="36" height="36" />
          <span class="klh-brush brand-zh">科智汇</span>
          <span class="brand-sub">AI 矩阵平台</span>
        </router-link>

        <nav class="klh-top__nav" aria-label="主导航">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            active-class="is-active"
          >
            {{ item.label }}
            <span v-if="item.badge" class="nav-badge" :aria-label="`${item.badge} 条待审核`">{{ item.badge }}</span>
          </router-link>
        </nav>

        <div class="klh-top__user">
          <el-dropdown v-if="demoMode" trigger="click" @command="onRole">
            <button type="button" class="user-btn">
              <span class="user-avatar" aria-hidden="true">{{ roleInfo.name.slice(0, 1) }}</span>
              <span class="user-text">
                <strong>{{ roleInfo.name }}</strong>
                <small>{{ roleInfo.label }}</small>
              </span>
              <klh-icon name="chevronDown" :size="14" />
            </button>
            <el-dropdown-menu slot="dropdown" class="klh-popper">
              <el-dropdown-item disabled>切换体验身份</el-dropdown-item>
              <el-dropdown-item v-for="(r, key) in roles" :key="key" :command="key">
                {{ r.label }} · {{ r.name }}
              </el-dropdown-item>
              <el-dropdown-item divided command="__logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <button v-else type="button" class="klh-btn klh-btn--ghost klh-btn--sm" @click="onRole('__logout')">
            <klh-icon name="logout" :size="16" />
            退出
          </button>
        </div>
      </div>
    </header>

    <router-view />
    <resource-drawer />
  </div>
</template>

<script>
import logo from '../assets/logo.png';
import KlhIcon from '../components/KlhIcon.vue';
import ResourceDrawer from '../components/ResourceDrawer.vue';
import state, { actions, getters, ROLES, DEMO_MODE } from '../store';
import { logoutRmCookies } from '@/utils/auth';

export default {
  name: 'KlhLayout',
  components: { KlhIcon, ResourceDrawer },
  data() {
    return { logo, roles: ROLES, demoMode: DEMO_MODE, state };
  },
  computed: {
    roleInfo() {
      return getters.roleInfo();
    },
    navItems() {
      const items = [
        { to: '/kelihua/subject', label: '学科 AI 矩阵' },
        { to: '/kelihua/education', label: '育人管理矩阵' },
        { to: '/kelihua/course', label: '学程案例矩阵' },
        { to: '/kelihua/prompts', label: '提示词库' },
        { to: '/kelihua/build', label: '共建中心' }
      ];
      if (getters.can('review')) {
        items.push({ to: '/kelihua/review', label: '审核发布', badge: getters.pendingForMe().length });
      }
      if (getters.can('manage')) items.push({ to: '/kelihua/catalog', label: '目录管理' });
      return items;
    }
  },
  watch: {
    'state.session.role'() {
      const meta = this.$route.meta || {};
      if (meta.klhPermission && !getters.can(meta.klhPermission)) {
        this.$router.replace('/kelihua/subject');
      }
    }
  },
  methods: {
    async onRole(cmd) {
      if (cmd === '__logout') {
        actions.logout();
        if (!DEMO_MODE) await logoutRmCookies();
        this.$router.replace('/kelihua/login');
        return;
      }
      actions.switchRole(cmd);
      this.$message({ message: `已切换为「${ROLES[cmd].label}」身份`, type: 'success', customClass: 'klh-popper' });
    }
  }
};
</script>

<style lang="scss" scoped>
.klh-shell {
  min-height: 100vh;
}

.klh-top {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--klh-line);
}

.klh-top__inner {
  display: flex;
  align-items: center;
  gap: 28px;
  max-width: 1320px;
  height: 64px;
  margin: 0 auto;
  padding: 0 32px;
}

.klh-top__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  img { width: 36px; height: 36px; border-radius: 50%; }
  .brand-zh { font-size: 28px; line-height: 1; color: var(--klh-blue); }
  .brand-sub {
    padding-left: 10px;
    border-left: 1px solid var(--klh-line-strong);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--klh-ink);
  }
}

.klh-top__nav {
  display: flex;
  align-items: stretch;
  gap: 4px;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  font-size: 15px;
  color: var(--klh-muted);
  white-space: nowrap;
  transition: color 0.2s;

  &:hover { color: var(--klh-ink); }

  /* 当前栏目：一笔橙色笔触 */
  &::after {
    content: '';
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 10px;
    height: 4px;
    border-radius: 4px 1px 4px 1px;
    background: var(--klh-orange);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.6, 0.05, 0.4, 1);
  }

  &.is-active {
    color: var(--klh-ink);
    font-weight: 700;
    &::after { transform: scaleX(1); }
  }
}

.nav-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--klh-orange);
  color: var(--klh-white);
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.klh-top__user {
  flex-shrink: 0;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  cursor: pointer;
  font: inherit;
  color: var(--klh-ink);

  &:hover { border-color: var(--klh-line-strong); }
}

.user-avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--klh-blue);
  color: var(--klh-white);
  font-weight: 700;
  font-size: 14px;
}

.user-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  text-align: left;
  strong { font-size: 13px; }
  small { font-size: 11px; color: var(--klh-muted); }
}

@media (max-width: 900px) {
  .klh-top__inner { padding: 0 16px; gap: 12px; }
  .brand-sub, .user-text { display: none; }
}
</style>

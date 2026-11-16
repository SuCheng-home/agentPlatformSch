<template>
  <el-dropdown v-if="demoMode" trigger="click" :placement="compact ? 'right-end' : 'bottom-end'" @command="onRole">
    <button type="button" :class="['user-btn', { 'is-compact': compact }]" :aria-label="`当前身份：${roleInfo.label} ${roleInfo.name}，点击切换`">
      <span class="user-avatar" aria-hidden="true">{{ roleInfo.name.slice(0, 1) }}</span>
      <span v-if="!compact" class="user-text">
        <strong>{{ roleInfo.name }}</strong>
        <small>{{ roleInfo.label }}</small>
      </span>
      <klh-icon v-if="!compact" name="chevronDown" :size="14" />
    </button>
    <el-dropdown-menu slot="dropdown" class="klh-popper">
      <el-dropdown-item disabled>切换体验身份</el-dropdown-item>
      <el-dropdown-item v-for="(r, key) in roles" :key="key" :command="key">
        {{ r.label }} · {{ r.name }}
      </el-dropdown-item>
      <el-dropdown-item divided command="__logout">退出登录</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
  <button v-else type="button" :class="['user-btn', { 'is-compact': compact }]" aria-label="退出登录" @click="onRole('__logout')">
    <klh-icon name="logout" :size="18" />
    <span v-if="!compact">退出</span>
  </button>
</template>

<script>
import KlhIcon from './KlhIcon.vue';
import { actions, getters, ROLES, DEMO_MODE } from '../store';
import { logoutRmCookies } from '@/utils/auth';

export default {
  name: 'KlhUserMenu',
  components: { KlhIcon },
  props: {
    compact: { type: Boolean, default: false }
  },
  data() {
    return { roles: ROLES, demoMode: DEMO_MODE };
  },
  computed: {
    roleInfo() { return getters.roleInfo(); }
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
.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  cursor: pointer;
  font: inherit;
  color: var(--klh-ink);
  transition: border-color 0.2s;

  &:hover { border-color: var(--klh-line-strong); }

  &.is-compact {
    padding: 3px;
    border-color: transparent;
    background: transparent;
    &:hover { border-color: var(--klh-line-strong); }
  }
}

.user-avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--klh-blue);
  color: var(--klh-white);
  font-weight: 700;
  font-size: 15px;
}

.user-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  text-align: left;
  strong { font-size: 14px; }
  small { font-size: 12px; color: var(--klh-muted); }
}
</style>

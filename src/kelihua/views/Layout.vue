<template>
  <div :class="['klh klh-shell', { 'is-bare': bare }]">
    <!-- 首页不显示导航，保持整屏开阔；其余页面用左侧常驻导航，一键切换任一栏目 -->
    <aside v-if="!bare" class="klh-rail">
      <router-link to="/kelihua/home" class="rail-brand" aria-label="科智汇 AI 矩阵平台首页">
        <img :src="logo" alt="" width="44" height="44" />
        <span class="klh-brush">科智汇</span>
      </router-link>

      <nav class="rail-nav" aria-label="主导航">
        <router-link
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :class="['rail-link', { 'is-active': isActive(item), 'is-matrix': item.matrix }]"
          :aria-current="isActive(item) ? 'page' : null"
        >
          <span class="rail-link__icon">
            <klh-icon :name="item.icon" :size="22" :stroke="1.8" />
            <span v-if="item.badge" class="rail-badge" :aria-label="`${item.badge} 条待审核`">{{ item.badge }}</span>
          </span>
          <span class="rail-link__label">{{ item.label }}</span>
        </router-link>
      </nav>

      <user-menu class="rail-user" compact />
    </aside>

    <div class="klh-main">
      <p v-if="isWorkflow" class="workflow-notice">功能状态：本地流程演示，提交与审核接口未提供；待审核记录仅本次页面有效，发布后的资源保存到当前浏览器。</p>
      <router-view />
    </div>
    <resource-drawer />
  </div>
</template>

<script>
import logo from '../assets/logo.png';
import KlhIcon from '../components/KlhIcon.vue';
import UserMenu from '../components/user-menu.vue';
import ResourceDrawer from '../components/resource-drawer.vue';
import state, { getters } from '../store';
import { navItems, isNavActive } from '../nav';

export default {
  name: 'KlhLayout',
  components: { KlhIcon, UserMenu, ResourceDrawer },
  data() {
    return { logo, state };
  },
  computed: {
    bare() { return this.$route.path === '/kelihua/home'; },
    isWorkflow() { return ['/kelihua/build', '/kelihua/review'].includes(this.$route.path); },
    items() { return navItems(); }
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
    isActive(item) { return isNavActive(item, this.$route.path); }
  }
};
</script>

<style lang="scss" scoped>
$rail: 96px;

.klh-shell { min-height: 100vh; }

.workflow-notice { margin: 20px auto 0; padding: 12px 20px; max-width: 1340px; color: #8f551f; background: var(--klh-orange-tint); font-size: 13px; }

.klh-rail {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: $rail;
  padding: 18px 0 16px;
  background: var(--klh-white);
  border-right: 1px solid var(--klh-line);
}

.rail-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--klh-line);
  width: 64px;

  img { width: 44px; height: 44px; border-radius: 50%; }
  .klh-brush { font-size: 20px; line-height: 1; color: var(--klh-blue); }
}

.rail-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.rail-link {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 80px;
  padding: 10px 0 8px;
  border-radius: 14px;
  color: var(--klh-muted);
  transition: background 0.18s, color 0.18s;

  &:hover { background: var(--klh-ink-tint); color: var(--klh-ink); }

  /* 三大矩阵与其他栏目之间留出分隔 */
  &.is-matrix + .rail-link:not(.is-matrix) { margin-top: 10px; }
  &.is-matrix + .rail-link:not(.is-matrix)::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 24px;
    right: 24px;
    height: 1px;
    background: var(--klh-line);
  }

  &.is-active {
    background: var(--klh-blue-tint);
    color: var(--klh-blue);
    .rail-link__label { font-weight: 700; }
  }
}

.rail-link__icon {
  position: relative;
  display: grid;
  place-items: center;
}

.rail-link__label {
  font-size: 13px;
  line-height: 1.2;
  white-space: nowrap;
}

.rail-badge {
  position: absolute;
  top: -6px;
  right: -12px;
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

.klh-main { min-width: 0; }
.klh-shell:not(.is-bare) .klh-main { margin-left: $rail; }

@media (max-width: 900px) {
  .klh-rail {
    top: auto;
    right: 0;
    flex-direction: row;
    gap: 4px;
    width: auto;
    height: 68px;
    padding: 0 8px;
    border-right: 0;
    border-top: 1px solid var(--klh-line);
  }
  .rail-brand { display: none; }
  .rail-nav { flex-direction: row; height: 100%; overflow-x: auto; overflow-y: hidden; }
  .rail-link {
    flex-shrink: 0;
    width: 68px;
    padding: 8px 0 6px;
    &.is-matrix + .rail-link:not(.is-matrix) { margin-top: 0; }
    &.is-matrix + .rail-link:not(.is-matrix)::before { display: none; }
  }
  .rail-link__label { font-size: 12px; }
  .klh-shell:not(.is-bare) .klh-main { margin-left: 0; padding-bottom: 68px; }
}
</style>

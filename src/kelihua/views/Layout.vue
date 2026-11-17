<template>
  <div :class="['klh klh-shell', { 'is-bare': bare }]">
    <!-- 首页不显示导航；其余页面只在顶部保留三大矩阵切换 -->
    <header v-if="!bare" class="klh-top">
      <router-link to="/kelihua/home" class="top-brand" aria-label="返回科智汇首页">
        <img :src="logo" alt="" width="40" height="36" />
        <span class="klh-brush">科智汇</span>
      </router-link>

      <nav ref="tabs" class="top-tabs" aria-label="三大矩阵">
        <span class="top-tabs__pill" :style="pillStyle" aria-hidden="true" />
        <router-link
          v-for="(m, i) in matrices"
          :key="m.to"
          ref="tab"
          :to="m.to"
          :class="['top-tab', { 'is-active': activeIndex === i }]"
          :aria-current="activeIndex === i ? 'page' : null"
        >{{ m.label }}</router-link>
      </nav>

      <user-menu class="top-user" />
    </header>

    <div class="klh-main">
      <p v-if="isWorkflow" class="workflow-notice">功能状态：本地流程演示，提交与审核接口未提供；待审核记录仅本次页面有效，发布后的资源保存到当前浏览器。</p>
      <transition :name="transitionName" mode="out-in">
        <router-view :key="viewKey" />
      </transition>
    </div>
    <resource-drawer />
  </div>
</template>

<script>
import logo from '../assets/logo-klh.png';
import UserMenu from '../components/user-menu.vue';
import ResourceDrawer from '../components/resource-drawer.vue';
import state, { getters } from '../store';

const MATRICES = [
  { to: '/kelihua/subject', label: '学科应用矩阵' },
  { to: '/kelihua/education', label: '育人管理矩阵' },
  { to: '/kelihua/course', label: 'AI 赋能学程案例矩阵', also: ['/kelihua/lesson'] }
];

function matrixIndex(path) {
  return MATRICES.findIndex((m) => [m.to, ...(m.also || [])].some((p) => path === p || path.startsWith(`${p}/`)));
}

export default {
  name: 'KlhLayout',
  components: { UserMenu, ResourceDrawer },
  data() {
    return { logo, state, matrices: MATRICES, transitionName: 'klh-fade', pillStyle: { opacity: 0 } };
  },
  computed: {
    bare() { return this.$route.path === '/kelihua/home'; },
    isWorkflow() { return ['/kelihua/build', '/kelihua/review'].includes(this.$route.path); },
    activeIndex() { return matrixIndex(this.$route.path); },
    viewKey() { return this.$route.path; }
  },
  watch: {
    $route(to, from) {
      const a = matrixIndex(from.path);
      const b = matrixIndex(to.path);
      const crossMatrix = a > -1 && b > -1 && a !== b && !to.path.startsWith('/kelihua/lesson');
      this.transitionName = crossMatrix ? (b > a ? 'klh-slide-left' : 'klh-slide-right') : 'klh-fade';
      this.$nextTick(this.movePill);
    },
    'state.session.role'() {
      const meta = this.$route.meta || {};
      if (meta.klhPermission && !getters.can(meta.klhPermission)) {
        this.$router.replace('/kelihua/subject');
      }
    }
  },
  mounted() {
    this.$nextTick(this.movePill);
    window.addEventListener('resize', this.movePill);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.movePill);
  },
  methods: {
    movePill() {
      const tabs = this.$refs.tab;
      const el = tabs && tabs[this.activeIndex] && tabs[this.activeIndex].$el;
      if (!el) {
        this.pillStyle = { opacity: 0 };
        return;
      }
      this.pillStyle = { opacity: 1, width: `${el.offsetWidth}px`, transform: `translateX(${el.offsetLeft}px)` };
      if (el.scrollIntoView && this.$refs.tabs.scrollWidth > this.$refs.tabs.clientWidth) {
        el.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.klh-shell { min-height: 100vh; }

/* 二级页面用更柔和的配色：品牌色降低饱和度，文字与描边减轻 */
.klh-shell:not(.is-bare) {
  --klh-blue: #3557c2;
  --klh-blue-deep: #24408f;
  --klh-orange: #df7a2a;
  --klh-ink: #283149;
  --klh-paper: #f5f4f1;
  --klh-blue-tint: rgba(53, 87, 194, 0.08);
  --klh-blue-tint-2: rgba(53, 87, 194, 0.14);
  --klh-orange-tint: rgba(223, 122, 42, 0.1);
  --klh-ink-tint: rgba(40, 49, 73, 0.05);
  --klh-muted: rgba(40, 49, 73, 0.66);
  --klh-faint: rgba(40, 49, 73, 0.48);
  --klh-line: rgba(40, 49, 73, 0.09);
  --klh-line-strong: rgba(40, 49, 73, 0.16);
  --klh-shadow: 0 1px 2px rgba(40, 49, 73, 0.04), 0 8px 24px -14px rgba(40, 49, 73, 0.16);
  background: var(--klh-paper);
}

.workflow-notice { margin: 20px auto 0; padding: 12px 20px; max-width: 1340px; color: #8f551f; background: var(--klh-orange-tint); font-size: 13px; }

.klh-top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: 68px;
  padding: 0 clamp(16px, 3vw, 32px);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(1.4) blur(12px);
  border-bottom: 1px solid var(--klh-line);
}

.top-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  img { width: 40px; height: 36px; object-fit: contain; }
  .klh-brush { font-size: 24px; line-height: 1; color: var(--klh-blue-deep); }
}

.top-tabs {
  position: relative;
  display: flex;
  gap: 4px;
  min-width: 0;
  padding: 4px;
  border-radius: 999px;
  background: var(--klh-ink-tint);
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

/* 滑块跟随当前矩阵移动 */
.top-tabs__pill {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  border-radius: 999px;
  background: var(--klh-white);
  box-shadow: 0 1px 2px rgba(40, 49, 73, 0.08), 0 4px 12px -4px rgba(53, 87, 194, 0.25);
  transition: transform 0.38s cubic-bezier(0.3, 0.9, 0.3, 1), width 0.38s cubic-bezier(0.3, 0.9, 0.3, 1), opacity 0.2s;
}

.top-tab {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  height: 40px;
  padding: 0 22px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: 0.04em;
  color: var(--klh-muted);
  white-space: nowrap;
  transition: color 0.25s;

  &:hover { color: var(--klh-ink); }
  &.is-active { color: var(--klh-blue); }
}

.top-user { flex-shrink: 0; }

.klh-main { min-width: 0; overflow-x: clip; }

/* 页面切换：跨矩阵按方向滑入，其余淡入 */
.klh-fade-enter-active,
.klh-fade-leave-active,
.klh-slide-left-enter-active,
.klh-slide-left-leave-active,
.klh-slide-right-enter-active,
.klh-slide-right-leave-active {
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.3, 0.8, 0.3, 1);
}
.klh-fade-enter,
.klh-fade-leave-to { opacity: 0; transform: translateY(6px); }
.klh-slide-left-enter,
.klh-slide-right-leave-to { opacity: 0; transform: translateX(40px); }
.klh-slide-left-leave-to,
.klh-slide-right-enter { opacity: 0; transform: translateX(-40px); }

@media (max-width: 760px) {
  .klh-top { gap: 10px; height: auto; padding-top: 10px; padding-bottom: 10px; flex-wrap: wrap; }
  .top-brand .klh-brush { display: none; }
  .top-tabs { order: 3; flex-basis: 100%; }
  .top-tab { padding: 0 14px; font-size: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .top-tabs__pill { transition: none; }
  .klh-fade-enter-active, .klh-fade-leave-active,
  .klh-slide-left-enter-active, .klh-slide-left-leave-active,
  .klh-slide-right-enter-active, .klh-slide-right-leave-active { transition: opacity 0.01s; }
}
</style>

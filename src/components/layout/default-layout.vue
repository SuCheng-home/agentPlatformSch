<template>
  <div class="app-shell">
    <SideNav />
    <main ref="mainEl" class="app-main" v-infinite-scroll="load"
      infinite-scroll-disabled="disabled" @scroll="handleScroll">
      <LocalPreviewNotice />
      <router-view />
    </main>
    <transition name="backtop-fade">
      <div v-show="showBackTop" class="back-top" title="返回顶部" @click="scrollToTop">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
      </div>
    </transition>
    <UploadDialog />
  </div>
</template>

<script>
import SideNav from './side-nav.vue';
import UploadDialog from '@/components/upload-dialog.vue';
import LocalPreviewNotice from '@/components/local-preview-notice.vue';

// 使用「智能体广场」视图（下拉加载列表）的页面 key，其余页面（审批/管理/Banner/手册）不启用无限滚动
const AGENT_LIST_PAGES = ['home', 'agents', 'favorites', 'created', 'recent', 'competition'];

export default {
  name: 'DefaultLayout',
  components: {
    SideNav,
    UploadDialog,
    LocalPreviewNotice
  },
  data() {
    return {
      // 主内容区滚动超过阈值后展示“返回顶部”按钮
      showBackTop: false
    };
  },
  computed: {
    isAgentListPage() {
      const page = this.$route.meta && this.$route.meta.page;
      return AGENT_LIST_PAGES.indexOf(page) !== -1;
    },
    // 非列表页、加载中、首屏为空或已加载全部时禁用无限滚动
    disabled() {
      if (!this.isAgentListPage) return true;
      const agent = this.$store.state.agent;
      if (agent.loading) return true;
      if (agent.agents.length === 0) return true;
      return agent.total > 0 && agent.agents.length >= agent.total;
    }
  },
  watch: {
    // 切换路由时重置滚动位置，避免沿用上一页的底部位置误触发加载
    $route() {
      if (this.$refs.mainEl) {
        this.$refs.mainEl.scrollTop = 0;
      }
      this.showBackTop = false;
    }
  },
  methods: {
    load() {
      if (this.disabled) return;
      this.$store.dispatch('agent/loadMoreAgents');
    },
    /** 主内容区滚动：超过阈值显示返回顶部按钮 */
    handleScroll(e) {
      this.showBackTop = e.target.scrollTop > 300;
    },
    /** 平滑滚动回顶部 */
    scrollToTop() {
      if (this.$refs.mainEl) {
        this.$refs.mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
};
</script>

<style scoped>
.app-main {
  margin-left: 240px;
  padding: 28px;
  /* max-width: 1540px; */
  /* min-height: 100vh; */
  height: 100vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 0;
    padding: 16px;
  }
}

.back-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--surface, #fff);
  color: var(--primary, #2168f3);
  border: 1px solid var(--line, #e2e8f5);
  box-shadow: 0 6px 20px rgba(44, 76, 139, .16);
  cursor: pointer;
  z-index: 10;
  transition: all .2s;
}

.back-top:hover {
  background: var(--primary, #2168f3);
  color: #fff;
}

.backtop-fade-enter-active,
.backtop-fade-leave-active {
  transition: opacity .25s, transform .25s;
}

.backtop-fade-enter,
.backtop-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>

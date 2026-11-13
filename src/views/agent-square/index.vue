<template>
  <div class="agent-square">
    <section v-if="isHome && banners.length" class="banner-hero">
      <el-carousel height="240px" arrow="hover" :interval="5000">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div
            class="banner-item"
            :class="{ 'is-link': item.bannerLink }"
            @click="handleBannerClick(item)"
          >
            <img class="banner-img" :src="item.bannerLogo" :alt="item.bannerTitle">
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <section class="toolbar">
      <div class="toolbar-title">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="type-tabs">
          <button
            v-for="tab in agentTypeTabs"
            :key="tab.value"
            type="button"
            class="type-tab"
            :class="{ active: filters.agentType === tab.value }"
            @click="handleAgentTypeChange(tab.value)"
          >{{ tab.label }}</button>
        </div>
      </div>
      <label class="search">
        <svg class="icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.search" />
        </svg>
        <input @blur="handleSearch" @keyup.enter="handleSearch"
          v-model="keyword"
          class="search-input"
          type="text"
          placeholder="搜索智能体或工具，如：作文批改、凸透镜成像"
        >
      </label>
    </section>

    <AgentFilter />

    <div class="card-grid">
      <AgentCard
        v-for="agent in agents"
        :key="agent.id"
        :agent="agent"
        :is-created="page === 'created'"
        @open="handleOpen"
        @edit="handleEdit"
        @delete="handleDelete"
        @favorite="handleFavorite"
      />
      <div v-if="!agents.length" class="empty">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">暂时没有匹配内容</h3>
        <p class="empty-desc">换个关键词或重置筛选条件试试看。</p>
        <button class="empty-button" type="button" @click="resetFilters">重置筛选</button>
      </div>
    </div>

    <div v-if="agents.length" class="load-more">
      <span v-if="loading" class="load-more-text">加载中…</span>
      <span v-else-if="noMore" class="load-more-text">没有更多了</span>
    </div>

    <AppPreview ref="preview" @close="handlePreviewClose" @favorite="handleFavorite" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import AgentFilter from '@/components/agent-filter.vue';
import AgentCard from '@/components/agent-card.vue';
import AppPreview from '@/components/app-preview.vue';
import { PAGE_TITLE_MAP } from '@/config/nav';
import { ICONS } from '@/constants/icons';
import { deleteAgent } from '@/api/agent';
import { getBannerList } from '@/api/banner';
import { store as authStore } from 'auth-layout-wxj';

export default {
  name: 'AgentSquare',
  components: {
    AgentFilter,
    AgentCard,
    AppPreview
  },
  data() {
    return {
      icons: ICONS,
      banners: [],
      agentTypeTabs: [
        { label: '全部', value: '' },
        { label: '智能体', value: 1 },
        { label: '实用工具', value: 2 },
        { label: '教学资源', value: 3 }
      ]
    };
  },
  computed: {
    ...mapState('agent', ['page', 'agents', 'filters', 'loading']),
    keyword: {
      get() {
        return this.$store.state.agent.keyword;
      },
      set(value) {
        this.$store.commit('agent/SET_KEYWORD', value);
      }
    },
    pageTitle() {
      return PAGE_TITLE_MAP[this.page] || '首页';
    },
    isHome() {
      return this.page === 'home';
    },
    // 已加载全部数据（仅在有数据时判定）
    noMore() {
      const { total, agents } = this.$store.state.agent;
      return total > 0 && agents.length >= total;
    }
  },
  watch: {
    $route() {
      if (this.$refs.preview) {
        this.$refs.preview.visible = false;
      }
      this.syncPage();
    }
  },
  mounted() {
    this.syncPage();
    this.loadBanners();
  },
  methods: {
    handleSearch() {
      this.$store.dispatch('agent/searchAgents');
    },
    // 将当前路由对应的页面模式同步到 store，重置筛选与分页后加载数据
    syncPage() {
      const meta = this.$route.meta || {};
      const page = meta.page || this.$route.name || 'home';
      this.$store.commit('agent/SET_PAGE', page);
      this.$store.commit('agent/RESET_FILTERS');
      this.$store.commit('agent/RESET_PAGINATION');
      this.$store.dispatch('agent/loadAgents');
    },
    /** 加载首页 Banner 轮播：仅取启用中的、当前学校的 Banner，按 sortNo 升序 */
    async loadBanners() {
      try {
        const schoolId = authStore.getters.schoolId
          || (authStore.state.schoolInfo && authStore.state.schoolInfo.id)
          || '';
        const params = { isDelete: 1 };
        if (schoolId) {
          params.schoolId = schoolId;
        }
        const res = await getBannerList(params);
        const list = res.data || [];
        this.banners = [...list].sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0));
      } catch (error) {
        console.warn('[AgentSquare] 获取 Banner 列表失败：', error);
        this.banners = [];
      }
    },
    /** 点击 Banner：配置了跳转地址则新开标签页 */
    handleBannerClick(banner) {
      if (banner.bannerLink) {
        window.open(banner.bannerLink, '_blank', 'noopener');
      }
    },
    handleAgentTypeChange(value) {
      this.$store.commit('agent/SET_FILTER', { type: 'agentType', value });
      // 切换类型时重置其余筛选条件
      this.$store.commit('agent/SET_FILTER', { type: 'subjectCode', value: '' });
      this.$store.commit('agent/SET_FILTER', { type: 'materialId', value: '' });
      this.$store.commit('agent/SET_FILTER', { type: 'chapterId', value: '' });
      this.$store.dispatch('agent/searchAgents');
    },
    resetFilters() {
      this.$store.commit('agent/RESET_FILTERS');
      this.$store.dispatch('agent/reloadAgents');
    },
    /** 打开智能体详情预览 */
    handleOpen(agent) {
      this.$refs.preview.open(agent);
    },
    /** 预览关闭后刷新列表（使用量可能已更新） */
    handlePreviewClose() {
      this.$store.dispatch('agent/reloadAgents');
    },
    /** 编辑智能体：将数据写入 store，打开上传弹窗 */
    handleEdit(agent) {
      this.$store.commit('agent/SET_EDIT_AGENT', agent);
      this.$store.commit('agent/SET_UPLOAD_VISIBLE', true);
    },
    /** 删除智能体：二次确认后调用接口 */
    handleDelete(agent) {
      this.$confirm(`确定要删除「${agent.name}」吗？删除后不可恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteAgent(agent.id);
          this.$message({ type: 'success', message: '删除成功' });
          this.$store.dispatch('agent/reloadAgents');
        } catch (err) {
          console.warn('[AgentSquare] 删除智能体失败：', err);
        }
      }).catch(() => {});
    },
    /** 卡片/预览内收藏：回写列表项收藏状态并刷新侧栏收藏角标 */
    handleFavorite({ agent, selfIsFavorite }) {
      this.$store.commit('agent/UPDATE_AGENT_FAVORITE', { id: agent.id, selfIsFavorite });
      this.$store.dispatch('agent/loadAgentStats');
      // 收藏页取消收藏后该条已不属于当前列表，重新拉取以刷新总数
      if (this.page === 'favorites' && selfIsFavorite === 1) {
        this.$store.dispatch('agent/reloadAgents');
      }
    }
  }
};
</script>

<style scoped>
.banner-hero {
  margin-bottom: 24px;
}

.banner-item {
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: var(--canvas);
  box-shadow: 0 12px 34px rgba(37, 100, 220, .15);
}

.banner-item.is-link {
  cursor: pointer;
}

.banner-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 20px;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  min-width: 5em;
}

.type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-tab {
  padding: 6px 16px;
  border-radius: 20px;
  background: var(--canvas);
  color: var(--muted);
  font-size: 13px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all .2s;
  font-family: inherit;
}

.type-tab:hover {
  background: var(--soft);
  border-color: var(--line);
}

.type-tab.active {
  background: var(--soft);
  color: var(--primary);
  border-color: var(--primary);
  font-weight: 600;
}

.search {
  margin-left: auto;
  width: min(510px, 44vw);
  height: 44px;
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  color: #93a0b6;
  box-shadow: 0 5px 18px rgba(44, 76, 139, .04);
}

.search-input {
  border: 0;
  outline: 0;
  background: transparent;
  flex: 1;
  color: var(--ink);
  font-size: 13px;
  font: inherit;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.empty {
  text-align: center;
  background: var(--surface);
  border: 1px dashed #ced8ea;
  border-radius: 14px;
  padding: 65px 20px;
  grid-column: 1 / -1;
}

.empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  background: var(--soft);
  color: var(--primary);
  display: grid;
  place-items: center;
  margin: 0 auto;
  font-size: 24px;
}

.empty-title {
  margin: 15px 0 6px;
  font-size: 16px;
}

.empty-desc {
  font-size: 13px;
  color: var(--muted);
  margin: 0 0 18px;
}

.empty-button {
  border: 0;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  background: var(--primary);
  color: #fff;
  transition: all .2s;
}

.empty-button:hover {
  background: var(--primary-dark);
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-bottom: 16px;
}

.load-more-text {
  font-size: 13px;
  color: var(--muted);
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>

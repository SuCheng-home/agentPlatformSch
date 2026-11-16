<template>
  <div class="klh-page">
    <page-head
      glyph="育"
      eyebrow="育人管理矩阵"
      title="围绕育人与学校管理的智能助手"
      desc="面向班主任、德育、心理、教务与行政岗位，按业务领域组织管理类智能体与工具。标注「规划中」的方向将在后续逐步细化建设。"
    >
      <label class="klh-search">
        <klh-icon name="search" :size="16" />
        <span class="sr-only">搜索育人应用</span>
        <input v-model.trim="keyword" type="search" placeholder="搜索育人管理应用" />
      </label>
    </page-head>

    <div class="edu">
      <nav class="edu__domains" aria-label="育人领域">
        <button
          type="button"
          :class="['domain', { 'is-active': !domain }]"
          :aria-current="!domain ? 'true' : null"
          @click="domain = null"
        >
          <span class="domain__name">全部领域</span>
          <span class="domain__count">{{ allCount }}</span>
        </button>
        <button
          v-for="d in state.domains"
          :key="d.key"
          type="button"
          :class="['domain', { 'is-active': domain === d.key }]"
          :aria-current="domain === d.key ? 'true' : null"
          @click="domain = d.key"
        >
          <span class="domain__name">{{ d.label }}</span>
          <span v-if="countOf(d.key)" class="domain__count">{{ countOf(d.key) }}</span>
          <span v-else class="domain__plan">规划中</span>
        </button>
      </nav>

      <section class="edu__main" aria-live="polite">
        <div class="edu__banner">
          <div>
            <h2>{{ current ? current.label : '全部育人管理应用' }}</h2>
            <p>{{ current ? current.hint : '班主任工作、德育活动、心理健康、家校沟通、综合评价、教务与行政' }}</p>
          </div>
          <div class="edu__split" role="group" aria-label="类型筛选">
            <button
              v-for="t in typeOptions"
              :key="t.key"
              type="button"
              :class="['klh-chip', { 'is-active': type === t.key }]"
              :aria-pressed="String(type === t.key)"
              @click="type = t.key"
            >{{ t.label }} {{ typeCount(t.key) }}</button>
          </div>
        </div>

        <template v-if="list.length">
          <div v-for="g in grouped" :key="g.key" class="edu__group">
            <h3 v-if="!domain" class="edu__group-title">{{ g.label }}</h3>
            <div class="klh-card-grid">
              <resource-card v-for="r in g.items" :key="r.id" :item="r" />
            </div>
          </div>
        </template>
        <div v-else class="klh-empty">
          <klh-icon name="heart" :size="28" />
          <p>「{{ current ? current.label : '该筛选' }}」方向正在规划中，欢迎有经验的老师提交智能体或工具。</p>
          <router-link to="/kelihua/build" class="klh-btn klh-btn--sm">参与共建</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import PageHead from '../components/PageHead.vue';
import ResourceCard from '../components/resource-card.vue';
import KlhIcon from '../components/KlhIcon.vue';
import state, { getters } from '../store';

export default {
  name: 'KlhEducationMatrix',
  components: { PageHead, ResourceCard, KlhIcon },
  data() {
    return {
      state,
      domain: null,
      type: 'all',
      keyword: '',
      typeOptions: [
        { key: 'all', label: '全部' },
        { key: 'agent', label: '智能体' },
        { key: 'tool', label: '工具' }
      ]
    };
  },
  created() {
    const { domain } = this.$route.query;
    if (domain && state.domains.some((d) => d.key === domain)) this.domain = domain;
  },
  computed: {
    all() {
      return getters.published((r) => r.matrix === 'education'
        && (!this.keyword || `${r.name}${r.desc}`.includes(this.keyword)));
    },
    allCount() {
      return this.all.length;
    },
    current() {
      return state.domains.find((d) => d.key === this.domain) || null;
    },
    inDomain() {
      return this.all.filter((r) => !this.domain || r.domain === this.domain);
    },
    list() {
      return this.inDomain.filter((r) => this.type === 'all' || r.type === this.type);
    },
    grouped() {
      if (this.domain) return [{ key: this.domain, label: '', items: this.list }];
      return state.domains
        .map((d) => ({ key: d.key, label: d.label, items: this.list.filter((r) => r.domain === d.key) }))
        .filter((g) => g.items.length);
    }
  },
  methods: {
    countOf(key) {
      return this.all.filter((r) => r.domain === key).length;
    },
    typeCount(key) {
      return key === 'all' ? this.inDomain.length : this.inDomain.filter((r) => r.type === key).length;
    }
  }
};
</script>

<style lang="scss" scoped>
.edu {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.edu__domains {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border-radius: 18px;
  background: var(--klh-white);
  border: 1px solid var(--klh-line);
}

.domain {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font: inherit;
  text-align: left;
  color: var(--klh-ink);
  cursor: pointer;
  transition: background 0.18s;

  &:hover { background: var(--klh-ink-tint); }
  &.is-active {
    background: var(--klh-blue);
    color: var(--klh-white);
    .domain__count { background: rgba(255, 255, 255, 0.2); color: var(--klh-white); }
    .domain__plan { color: rgba(255, 255, 255, 0.8); border-color: rgba(255, 255, 255, 0.4); }
  }
}

.domain__name {
  font-size: 15px;
  font-weight: 600;
}

.domain__count {
  min-width: 24px;
  height: 22px;
  padding: 0 7px;
  border-radius: 11px;
  background: var(--klh-ink-tint);
  font-size: 12px;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.domain__plan {
  padding: 0 6px;
  border-radius: 5px;
  border: 1px dashed var(--klh-line-strong);
  font-size: 11px;
  line-height: 18px;
  color: var(--klh-faint);
}

.edu__banner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 22px 24px;
  border-radius: 18px;
  background: var(--klh-ink);
  color: var(--klh-white);

  h2 { font-size: 22px; font-weight: 800; }
  p { margin-top: 4px; font-size: 14px; color: rgba(255, 255, 255, 0.7); }
}

.edu__split {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);

  .klh-chip {
    color: rgba(255, 255, 255, 0.75);
    &:hover { background: rgba(255, 255, 255, 0.1); color: var(--klh-white); }
    &.is-active { background: var(--klh-white); color: var(--klh-ink); }
  }
}

.edu__group + .edu__group {
  margin-top: 28px;
}

.edu__group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 800;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--klh-line);
  }
}

@media (max-width: 900px) {
  .edu { grid-template-columns: 1fr; }
  .edu__domains {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    .domain { flex-shrink: 0; }
  }
}
</style>

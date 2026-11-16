<template>
  <div class="klh-page">
    <header class="matrix-head">
      <div>
        <h1 class="matrix-title">学科 AI 矩阵</h1>
        <p class="matrix-note">按大单元汇集智能体与工具，让教学资源随学程展开。</p>
      </div>
      <label class="klh-search">
        <KlhIcon name="search" :size="16" />
        <span class="sr-only">搜索资源、教师或单元</span>
        <input v-model.trim="keyword" type="search" placeholder="搜索资源、教师或单元" />
      </label>
    </header>
    <section class="matrix-filter klh-panel" aria-label="资源筛选">
      <div class="filter-row">
        <strong class="filter-label">学科</strong>
        <div class="filter-options">
          <button type="button" :class="['klh-chip', { 'is-active': subject === 'all' }]" @click="setSubject('all')">全部</button>
          <button
            v-for="item in state.subjects"
            :key="item.key"
            type="button"
            :class="['klh-chip', { 'is-active': subject === item.key }]"
            :disabled="!hasSubject(item.key)"
            :title="hasSubject(item.key) ? item.label : '资源待提供'"
            @click="setSubject(item.key)"
          >{{ item.label }}</button>
        </div>
      </div>
      <div class="filter-row">
        <strong class="filter-label">类型</strong>
        <div class="filter-options">
          <button v-for="item in typeOptions" :key="item.key" type="button" :class="['klh-chip', { 'is-active': type === item.key }]" @click="type = item.key">{{ item.label }}</button>
        </div>
      </div>
    </section>
    <div class="matrix-body">
      <nav class="unit-nav klh-panel" aria-label="大单元目录">
        <h2 class="unit-nav-title">大单元目录</h2>
        <button type="button" :class="['unit-option', { 'is-active': !unitId }]" @click="unitId = ''">全部单元 <small>{{ matching.length }}</small></button>
        <button v-for="unit in units" :key="unit.id" type="button" :class="['unit-option', { 'is-active': unitId === unit.id }]" @click="unitId = unit.id">
          <span>{{ unit.title }}</span><small>{{ countUnit(unit.id) }}</small>
        </button>
      </nav>
      <section class="matrix-results" aria-live="polite">
        <div class="matrix-summary">
          <span>共 <strong>{{ total }}</strong> 项资源</span>
          <span class="legend legend-agent">蓝色 · AI 智能体</span>
          <span class="legend legend-tool">橙色 · 工具</span>
        </div>
        <p class="matrix-note">真实资料已收录；按知识主题归档，正式大单元名称待教研组确认。缺少的链接和复制内容在卡片中标明。</p>
        <section v-for="group in groups" :key="group.unit.id" class="resource-group">
          <h2 class="group-title">{{ group.unit.title }} <small>{{ subjectLabel(group.unit.subject) }} · {{ group.items.length }} 项</small></h2>
          <div class="resource-grid">
            <ResourceCard v-for="item in group.items" :key="item.id" :item="item" />
          </div>
        </section>
        <div v-if="!total" class="klh-empty">暂无符合条件的智能体或工具，试试其他筛选条件。</div>
      </section>
    </div>
  </div>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import ResourceCard from '../components/resource-card.vue';
import state, { getters } from '../store';

export default {
  name: 'KlhSubjectMatrix',
  components: { KlhIcon, ResourceCard },
  data() {
    return {
      state,
      subject: 'all',
      type: 'all',
      unitId: '',
      keyword: '',
      typeOptions: [{ key: 'all', label: '全部' }, { key: 'agent', label: 'AI 智能体' }, { key: 'tool', label: '工具' }]
    };
  },
  computed: {
    published() {
      return getters.published((resource) => resource.matrix === 'subject' && ['agent', 'tool'].includes(resource.type));
    },
    matching() {
      const keyword = this.keyword.toLocaleLowerCase();
      return this.published.filter((resource) => {
        return (this.subject === 'all' || resource.subject === this.subject)
          && (this.type === 'all' || resource.type === this.type)
          && `${resource.name} ${resource.author} ${resource.unitTitle}`.toLocaleLowerCase().includes(keyword);
      });
    },
    units() {
      const ids = [...new Set(this.matching.map((resource) => resource.unitId))];
      return ids.map((id) => state.units.find((unit) => unit.id === id) || { id: id || 'unassigned', title: '单元待归档', subject: this.subject });
    },
    groups() {
      return this.units.filter((unit) => !this.unitId || unit.id === this.unitId)
        .map((unit) => ({ unit, items: this.matching.filter((resource) => (resource.unitId || 'unassigned') === unit.id) }));
    },
    total() {
      return this.groups.reduce((total, group) => total + group.items.length, 0);
    }
  },
  watch: {
    type() { this.unitId = ''; },
    keyword() { this.unitId = ''; },
    '$route.query': { handler: 'readQuery', immediate: true }
  },
  methods: {
    subjectLabel: getters.subjectLabel,
    readQuery() {
      const query = this.$route.query;
      this.type = query.cat === 'ai' || query.type === 'agent' ? 'agent' : query.type === 'tool' ? 'tool' : 'all';
      this.subject = this.hasSubject(query.subject) ? query.subject : 'all';
      this.unitId = '';
    },
    hasSubject(subject) {
      return this.published.some((resource) => resource.subject === subject);
    },
    setSubject(subject) {
      this.subject = subject;
      this.unitId = '';
    },
    countUnit(id) {
      return this.matching.filter((resource) => (resource.unitId || 'unassigned') === id).length;
    }
  }
};
</script>

<style lang="scss" scoped>
.matrix-head { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 22px; }
.matrix-title { font-size: 25px; font-weight: 800; }
.matrix-note { margin-top: 8px; font-size: 13px; line-height: 1.7; color: var(--klh-muted); }
.matrix-filter { padding: 20px 24px; }
.filter-row { display: flex; gap: 20px; align-items: baseline; }
.filter-row + .filter-row { margin-top: 16px; }
.filter-label { flex-shrink: 0; font-size: 14px; }
.filter-options { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-options .klh-chip:disabled { opacity: 0.4; cursor: not-allowed; }
.matrix-body { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 24px; margin-top: 24px; align-items: start; }
.unit-nav { padding: 18px 12px; }
.unit-nav-title { font-size: 15px; padding: 0 10px 12px; }
.unit-option { display: flex; justify-content: space-between; gap: 8px; width: 100%; padding: 12px 10px; border: 0; border-radius: 8px; background: transparent; color: var(--klh-ink); font: inherit; font-size: 14px; text-align: left; cursor: pointer; }
.unit-option.is-active { background: var(--klh-blue-tint); color: var(--klh-blue); font-weight: 700; }
.matrix-summary { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; font-size: 14px; }
.legend { padding-left: 10px; border-left: 3px solid; font-size: 12px; }
.legend-agent { color: var(--klh-blue); }
.legend-tool { color: #b65a08; }
.resource-group { margin-top: 24px; }
.group-title { font-size: 18px; margin-bottom: 12px; }
.group-title small { margin-left: 8px; color: var(--klh-muted); font-size: 12px; font-weight: 400; }
.resource-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
@media (max-width: 1000px) { .resource-grid { grid-template-columns: 1fr; } }
@media (max-width: 700px) {
  .matrix-head { align-items: flex-start; flex-direction: column; }
  .matrix-body { grid-template-columns: 1fr; }
  .unit-nav { max-height: 240px; overflow: auto; }
}
</style>

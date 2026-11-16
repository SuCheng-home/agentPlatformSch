<template>
  <div class="klh-page sm">
    <header class="sm-head">
      <h1 class="sm-title">学科应用矩阵</h1>
      <label class="klh-search sm-search">
        <KlhIcon name="search" :size="16" />
        <span class="sr-only">搜索资源或教师</span>
        <input v-model.trim="keyword" type="search" placeholder="搜索资源或教师" />
      </label>
    </header>

    <nav class="sm-subjects" aria-label="学科">
      <button
        v-for="item in subjectTabs"
        :key="item.key"
        type="button"
        :class="['sm-subject', { 'is-active': subject === item.key }]"
        :aria-current="subject === item.key ? 'page' : null"
        :disabled="!item.enabled"
        :title="item.enabled ? item.label : `${item.label} · 建设中`"
        @click="setSubject(item.key)"
      >{{ item.label }}</button>
    </nav>

    <nav class="sm-modules" :aria-label="`${subjectLabel(subject)}模块`">
      <a
        v-for="(block, index) in blocks"
        :key="block.key"
        :href="`#mod-${block.key}`"
        :class="['sm-module', `tone-${tone(index)}`]"
        @click.prevent="jump(block.key)"
      >
        <span class="sm-module__label">{{ block.label }}</span>
        <span class="sm-module__count">{{ block.items.length }}</span>
      </a>
    </nav>

    <section
      v-for="block in visibleBlocks"
      :id="`mod-${block.key}`"
      :key="block.key"
      :class="['sm-block', `tone-${tone(blocks.findIndex((item) => item.key === block.key))}`]"
      :aria-labelledby="`mod-title-${block.key}`"
    >
      <header class="sm-block__slab">
        <h2 :id="`mod-title-${block.key}`" class="sm-block__title">{{ block.label }}</h2>
        <span class="sm-block__count">{{ block.items.length }} 项</span>
      </header>
      <div v-if="block.items.length" class="sm-grid">
        <MatrixCard v-for="item in block.items" :key="item.id" :item="item" />
      </div>
      <div v-else class="sm-placeholder">
        <KlhIcon name="layers" :size="22" />
        <span>{{ ready ? '本模块资源整理中' : '真实资源整理中，即将上线' }}</span>
      </div>
    </section>

    <div v-if="keyword && !visibleBlocks.length" class="klh-empty">没有找到「{{ keyword }}」相关的资源。</div>
  </div>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import MatrixCard from '../components/matrix-card.vue';
import { SUBJECT_MODULES } from '../data/subject-modules';
import state, { getters } from '../store';

const TONES = ['blue', 'orange', 'ink', 'teal', 'deep'];
const DEFAULT_SUBJECT = 'wl';

export default {
  name: 'KlhSubjectMatrix',
  components: { KlhIcon, MatrixCard },
  data() {
    return { subject: DEFAULT_SUBJECT, keyword: '' };
  },
  computed: {
    subjectTabs() {
      const enabled = state.subjects.filter((item) => SUBJECT_MODULES[item.key]);
      const others = state.subjects.filter((item) => !SUBJECT_MODULES[item.key]);
      return [...enabled.map((item) => ({ ...item, enabled: true })), ...others.map((item) => ({ ...item, enabled: false }))];
    },
    config() {
      return SUBJECT_MODULES[this.subject] || { ready: false, modules: [] };
    },
    ready() {
      return this.config.ready;
    },
    resources() {
      const keyword = this.keyword.toLocaleLowerCase();
      return getters.published((resource) => resource.matrix === 'subject'
        && resource.subject === this.subject
        && ['agent', 'tool'].includes(resource.type)
        && `${resource.name} ${resource.author}`.toLocaleLowerCase().includes(keyword));
    },
    blocks() {
      return this.config.modules.map((module) => this.withItems(module));
    },
    commonBlock() {
      return this.config.common ? this.withItems(this.config.common) : null;
    },
    visibleBlocks() {
      const all = [...this.blocks, ...(this.commonBlock && this.commonBlock.items.length ? [this.commonBlock] : [])];
      return this.keyword ? all.filter((block) => block.items.length) : all;
    }
  },
  watch: {
    '$route.query.subject': { handler: 'readQuery', immediate: true }
  },
  methods: {
    subjectLabel: getters.subjectLabel,
    tone(index) {
      return index < 0 ? 'plain' : TONES[index % TONES.length];
    },
    withItems(module) {
      return { ...module, items: this.resources.filter((resource) => (resource.modules || []).includes(module.key)) };
    },
    readQuery(subject) {
      this.subject = SUBJECT_MODULES[subject] ? subject : DEFAULT_SUBJECT;
    },
    setSubject(subject) {
      if (subject === this.subject) return;
      this.subject = subject;
      this.keyword = '';
      this.$router.replace({ query: { ...this.$route.query, subject } }).catch(() => {});
    },
    jump(key) {
      const el = document.getElementById(`mod-${key}`);
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
};
</script>

<style lang="scss" scoped>
.sm {
  --tone: var(--klh-blue);
  --tone-ink: var(--klh-white);
}

.tone-blue { --tone: var(--klh-blue); --tone-ink: var(--klh-white); }
.tone-orange { --tone: var(--klh-orange); --tone-ink: var(--klh-ink); }
.tone-ink { --tone: var(--klh-ink); --tone-ink: var(--klh-white); }
.tone-teal { --tone: var(--klh-teal); --tone-ink: var(--klh-white); }
.tone-deep { --tone: var(--klh-blue-deep); --tone-ink: var(--klh-white); }
.tone-plain { --tone: var(--klh-white); --tone-ink: var(--klh-ink); }
.tone-plain .sm-block__slab { box-shadow: inset 0 0 0 3px var(--klh-ink); }
.tone-plain .sm-block__title { font-size: 22px; }

.sm-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 20px;
}

.sm-title {
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.1;
  color: var(--klh-ink);
}

.sm-search { border-radius: 2px; border-width: 2px; border-color: var(--klh-ink); }

.sm-subjects {
  display: flex;
  gap: 0;
  overflow-x: auto;
  border-top: 3px solid var(--klh-ink);
  border-bottom: 1px solid var(--klh-line-strong);
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.sm-subject {
  flex-shrink: 0;
  padding: 14px 20px;
  border: 0;
  background: transparent;
  color: var(--klh-ink);
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;

  &:hover:not(:disabled):not(.is-active) { background: var(--klh-ink-tint); }
  &.is-active { background: var(--klh-ink); color: var(--klh-white); }
  &:disabled { color: var(--klh-faint); font-weight: 400; cursor: not-allowed; }
}

.sm-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 24px;
}

.sm-module {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  min-height: 108px;
  padding: 16px 18px;
  background: var(--tone);
  color: var(--tone-ink);
  transition: transform 0.2s;

  &:hover { transform: translateY(-3px); }
}

.sm-module__label {
  font-size: 28px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.04em;
  text-wrap: balance;
}

.sm-module__count {
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.sm-block {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 24px;
  margin-top: 40px;
  scroll-margin-top: 80px;
}

.sm-block__slab {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-self: start;
  min-height: 160px;
  padding: 18px;
  background: var(--tone);
  color: var(--tone-ink);
}

.sm-block__title {
  font-size: 44px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-wrap: balance;
}

.sm-block__count {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.sm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.sm-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 160px;
  border: 2px dashed var(--klh-line-strong);
  color: var(--klh-muted);
  font-size: 15px;
}

@media (max-width: 760px) {
  .sm-head { align-items: stretch; flex-direction: column; }
  .sm-search { width: 100%; }
  .sm-module { min-height: 84px; }
  .sm-module__label, .sm-module__count { font-size: 22px; }
  .sm-block { grid-template-columns: 1fr; gap: 14px; margin-top: 32px; }
  .sm-block__slab { position: static; flex-direction: row; align-items: center; min-height: 0; padding: 12px 16px; }
  .sm-block__title { font-size: 28px; }
}

@media (prefers-reduced-motion: reduce) {
  .sm-module { transition: none; }
}
</style>

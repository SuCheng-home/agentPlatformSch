<template>
  <div class="klh-page sm">
    <header class="sm-head">
      <div class="sm-head__text">
        <h1 class="sm-title">学科应用矩阵</h1>
        <p class="sm-legend">
          <span class="legend legend--tool">工具</span>
          <span class="legend legend--agent">智能体</span>
        </p>
      </div>
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
      >
        {{ item.label }}
        <small v-if="!item.enabled">建设中</small>
      </button>
    </nav>

    <nav :class="['sm-modules', { 'is-few': blocks.length <= 3 }]" :aria-label="`${subjectLabel(subject)}模块`">
      <a
        v-for="block in blocks"
        :key="block.key"
        :href="`#mod-${block.key}`"
        :class="['sm-module', `tone-${block.tone}`]"
        @click.prevent="jump(block.key)"
      >
        <img v-if="art(block.key)" class="sm-module__art" :src="art(block.key)" alt="" width="480" height="262" />
        <span class="sm-module__label">{{ block.label }}</span>
        <span class="sm-module__count">{{ block.items.length }} 项资源</span>
      </a>
    </nav>

    <section
      v-for="block in visibleBlocks"
      :id="`mod-${block.key}`"
      :key="block.key"
      :class="['sm-block', `tone-${block.tone}`]"
      :aria-labelledby="`mod-title-${block.key}`"
    >
      <header class="sm-block__band">
        <div class="sm-block__text">
          <h2 :id="`mod-title-${block.key}`" class="sm-block__title">{{ block.label }}</h2>
          <p class="sm-block__meta">
            <span>{{ block.items.length }} 项资源</span>
            <span v-if="block.items.length">工具 {{ countOf(block, 'tool') }} · 智能体 {{ countOf(block, 'agent') }}</span>
          </p>
        </div>
        <img v-if="art(block.key)" class="sm-block__art" :src="art(block.key)" alt="" width="480" height="262" loading="lazy" />
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

const MODULE_ART = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/modules/*.webp', { eager: true, import: 'default' }))
    .map(([path, url]) => [path.split('/').pop().replace('.webp', ''), url])
);
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
    art(key) {
      return MODULE_ART[key];
    },
    countOf(block, type) {
      return block.items.filter((item) => item.type === type).length;
    },
    withItems(module) {
      return { tone: 'stone', ...module, items: this.resources.filter((resource) => (resource.modules || []).includes(module.key)) };
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
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
};
</script>

<style lang="scss" scoped>
/* 模块色：刻意避开橙（工具）与蓝（智能体），资源类型的颜色只出现在卡片上 */
/* 高对比版：模块色块改为实色渐变 + 白字 */
.tone-teal { --tone: #0a6d67; --tone-deep: #064843; }
.tone-forest { --tone: #2f6a33; --tone-deep: #1b4420; }
.tone-brick { --tone: #9a2e2e; --tone-deep: #641a1a; }
.tone-plum { --tone: #6e2f5d; --tone-deep: #45193a; }
.tone-slate { --tone: #2f3b58; --tone-deep: #1a2238; }
.tone-stone { --tone: #4f4943; --tone-deep: #2f2b27; }

.sm-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 20px;
}

.sm-head__text {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.sm-title {
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.1;
  color: var(--klh-ink);
}

.sm-legend {
  display: flex;
  gap: 14px;
  font-size: 14px;
  color: var(--klh-muted);
}

.legend {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: var(--c);
  }
  &--tool { --c: var(--klh-orange); }
  &--agent { --c: var(--klh-blue); }
}

.sm-search { border-radius: 999px; }

.sm-subjects {
  display: flex;
  gap: 6px;
  padding: 6px;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
  border-radius: 999px;
  background: var(--klh-white);
  box-shadow: inset 0 0 0 1.5px var(--klh-line-strong), var(--klh-shadow);
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.sm-subject {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  height: 40px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--klh-ink);
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;

  small { font-size: 11px; font-weight: 400; letter-spacing: 0; }

  &:hover:not(:disabled):not(.is-active) { background: var(--klh-ink-tint); }
  &.is-active { background: var(--klh-ink); color: var(--klh-white); }
  &:disabled { color: var(--klh-faint); font-weight: 400; cursor: not-allowed; }
}

.sm-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-top: 24px;

  &.is-few { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
}

.sm-module {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  min-height: 168px;
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(140deg, var(--tone) 0%, var(--tone-deep) 100%);
  color: var(--klh-white);
  box-shadow: 0 14px 28px -20px var(--tone-deep);
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 34px -18px var(--tone-deep);
  }
  &:hover .sm-module__art { transform: scale(1.06); }
}

/* 配图为白底 3D 插画，放进白色圆牌，在深色块上保持清晰 */
.sm-module__art {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: var(--klh-white);
  object-fit: cover;
  box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.5);
  transition: transform 0.35s;
}

.sm-module__label {
  font-size: 30px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.04em;
  text-wrap: balance;
}

.sm-module__count {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  opacity: 0.9;
}

.sm-block {
  margin-top: 44px;
  scroll-margin-top: 24px;
}

.sm-block__band {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 112px;
  margin-bottom: 20px;
  padding: 0 14px 0 28px;
  border-radius: 18px;
  background: linear-gradient(100deg, var(--tone) 0%, var(--tone-deep) 100%);
  color: var(--klh-white);
  overflow: hidden;
}

.sm-block__text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 0;
}

.sm-block__title {
  font-size: 34px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.04em;
  text-wrap: balance;
}

.sm-block__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--klh-white);
  opacity: 0.9;
}

.sm-block__art {
  flex-shrink: 0;
  width: 156px;
  height: 84px;
  border-radius: 14px;
  background: var(--klh-white);
  object-fit: cover;
  box-shadow: 0 10px 20px -12px rgba(0, 0, 0, 0.5);
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
  min-height: 140px;
  border-radius: 18px;
  border: 2px dashed var(--klh-line-strong);
  color: var(--klh-muted);
  font-size: 15px;
}

@media (max-width: 760px) {
  .sm-head { align-items: stretch; flex-direction: column; }
  .sm-search { width: 100%; }
  .sm-modules, .sm-modules.is-few { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .sm-module { min-height: 128px; padding: 14px; }
  .sm-module__label { font-size: 22px; }
  .sm-block { margin-top: 32px; }
  .sm-block__title { font-size: 26px; }
  .sm-block__art { width: 112px; height: 64px; }
  .sm-module__art { width: 64px; height: 64px; top: 10px; right: 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .sm-module, .sm-module__art { transition: none; }
}
</style>

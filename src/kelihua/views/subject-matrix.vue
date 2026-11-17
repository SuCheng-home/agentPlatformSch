<template>
  <div class="klh-page sm">
    <h1 class="sr-only">学科应用矩阵</h1>

    <div class="sm-filter klh-panel" role="group" aria-label="资源筛选">
      <div class="sm-filter__row">
        <span class="sm-filter__label">学科</span>
        <button
          v-for="item in subjectTabs"
          :key="item.key"
          type="button"
          :class="['klh-chip', { 'is-active': subject === item.key }]"
          :aria-pressed="String(subject === item.key)"
          @click="setSubject(item.key)"
        >{{ item.label }}</button>
      </div>
      <div class="sm-filter__row">
        <span class="sm-filter__label">类型</span>
        <button
          v-for="t in TYPES"
          :key="t.key"
          type="button"
          :class="['sm-type', `sm-type--${t.key}`, { 'is-active': types.includes(t.key) }]"
          :aria-pressed="String(types.includes(t.key))"
          @click="toggleType(t.key)"
        >{{ t.label }}</button>
      </div>
    </div>

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
      </a>
    </nav>

    <section
      v-for="block in visibleBlocks"
      :id="`mod-${block.key}`"
      :key="block.key"
      :class="['sm-block', `tone-${block.tone}`]"
      :aria-labelledby="`mod-title-${block.key}`"
    >
      <header class="sm-block__head">
        <span v-if="art(block.key)" class="sm-block__badge" aria-hidden="true">
          <img :src="art(block.key)" alt="" width="480" height="262" loading="lazy" />
        </span>
        <h2 :id="`mod-title-${block.key}`" class="sm-block__title">{{ block.label }}</h2>
      </header>
      <div v-if="block.items.length" class="sm-grid">
        <MatrixCard v-for="item in block.items" :key="item.id" :item="item" />
      </div>
      <div v-else class="sm-blank" />
    </section>

    <div v-if="!visibleBlocks.length" class="sm-blank sm-blank--subject" />
  </div>
</template>

<script>
import MatrixCard from '../components/matrix-card.vue';
import { SUBJECT_MODULES } from '../data/subject-modules';
import state, { getters } from '../store';

const MODULE_ART = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/modules/*.webp', { eager: true, import: 'default' }))
    .map(([path, url]) => [path.split('/').pop().replace('.webp', ''), url])
);
const DEFAULT_SUBJECT = 'wl';
const TYPES = [
  { key: 'tool', label: '工具' },
  { key: 'agent', label: '智能体' }
];

export default {
  name: 'KlhSubjectMatrix',
  components: { MatrixCard },
  data() {
    return { TYPES, subject: DEFAULT_SUBJECT, types: TYPES.map((t) => t.key) };
  },
  computed: {
    subjectTabs() {
      const configured = state.subjects.filter((item) => SUBJECT_MODULES[item.key]);
      const others = state.subjects.filter((item) => !SUBJECT_MODULES[item.key]);
      return [...configured, ...others];
    },
    config() {
      return SUBJECT_MODULES[this.subject] || { ready: false, modules: [] };
    },
    resources() {
      return getters.published((resource) => resource.matrix === 'subject'
        && resource.subject === this.subject
        && this.types.includes(resource.type));
    },
    blocks() {
      return this.config.modules.map((module) => this.withItems(module));
    },
    commonBlock() {
      return this.config.common ? this.withItems(this.config.common) : null;
    },
    visibleBlocks() {
      return [...this.blocks, ...(this.commonBlock && this.commonBlock.items.length ? [this.commonBlock] : [])];
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
    withItems(module) {
      return { tone: 'stone', ...module, items: this.resources.filter((resource) => (resource.modules || []).includes(module.key)) };
    },
    readQuery(subject) {
      this.subject = state.subjects.some((item) => item.key === subject) ? subject : DEFAULT_SUBJECT;
    },
    setSubject(subject) {
      if (subject === this.subject) return;
      this.subject = subject;
      this.$router.replace({ query: { ...this.$route.query, subject } }).catch(() => {});
    },
    toggleType(type) {
      if (!this.types.includes(type)) {
        this.types = [...this.types, type];
      } else if (this.types.length > 1) {
        this.types = this.types.filter((t) => t !== type);
      }
    },
    jump(key) {
      const el = document.getElementById(`mod-${key}`);
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 92, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
};
</script>

<style lang="scss" scoped>
/* 模块色：刻意避开橙（工具）与蓝（智能体），资源类型的颜色只出现在卡片上 */
.tone-teal { --tone: #0e7c76; --tint: #e4f3f1; }
.tone-forest { --tone: #3b7a3f; --tint: #e9f2e6; }
.tone-brick { --tone: #a83a3a; --tint: #f8e9e7; }
.tone-plum { --tone: #7d3c6b; --tint: #f4e9f1; }
.tone-slate { --tone: #3d4a66; --tint: #eaedf3; }
.tone-stone { --tone: #5c564f; --tint: #efece7; }

.sm-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
}

.sm-filter__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.sm-filter__label {
  width: 48px;
  font-size: 13px;
  font-weight: 700;
  color: var(--klh-ink);
}

/* 类型筛选沿用全平台约定：橙 = 工具，蓝 = 智能体；可多选，至少保留一项 */
.sm-type {
  --c: var(--klh-orange);
  --c-tint: var(--klh-orange-tint);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--klh-line-strong);
  border-radius: 999px;
  background: transparent;
  color: var(--klh-muted);
  font: inherit;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border-color 0.18s;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c);
    opacity: 0.45;
  }
  &--agent { --c: var(--klh-blue); --c-tint: var(--klh-blue-tint); }
  & + & { margin-left: 4px; }

  &:hover { color: var(--klh-ink); }
  &.is-active {
    border-color: transparent;
    background: var(--c-tint);
    color: var(--c);
    font-weight: 600;
    &::before { opacity: 1; }
  }
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
  background: var(--tint);
  color: var(--tone);
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 28px -20px var(--tone);
  }
  &:hover .sm-module__art { transform: scale(1.06) translateY(-2px); }
}

/* 配图为白底 3D 插画，正片叠底后融进模块色块 */
.sm-module__art {
  position: absolute;
  top: -6px;
  right: -28px;
  z-index: -1;
  width: 78%;
  height: auto;
  mix-blend-mode: multiply;
  filter: brightness(1.07);
  -webkit-mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%);
  mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%);
  transition: transform 0.35s;
}

.sm-module__label {
  font-size: 30px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.04em;
  text-wrap: balance;
}

.sm-block {
  margin-top: 56px;
  scroll-margin-top: 24px;
}

/* 单元标题：插画徽标 + 标题 + 数量，右侧细线延伸到内容边缘 */
.sm-block__head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  color: var(--tone);

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    margin-left: 8px;
    background: var(--klh-line-strong);
  }
}

.sm-block__badge {
  display: block;
  flex-shrink: 0;
  width: 88px;
  height: 52px;
  border-radius: 14px;
  background: var(--tint);
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: multiply;
    filter: brightness(1.07);
  }
}

.sm-block__title {
  font-size: 28px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.06em;
  text-wrap: balance;
}

.sm-blank { min-height: 160px; }
.sm-blank--subject { min-height: 320px; }

.sm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

@media (max-width: 760px) {
  .sm-filter { padding: 14px; }
  .sm-modules, .sm-modules.is-few { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .sm-module { min-height: 128px; padding: 14px; }
  .sm-module__label { font-size: 22px; }
  .sm-block { margin-top: 32px; }
  .sm-block__title { font-size: 24px; }
  .sm-block__badge { width: 68px; height: 40px; border-radius: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .sm-module, .sm-module__art { transition: none; }
}
</style>

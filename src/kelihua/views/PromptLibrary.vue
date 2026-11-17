<template>
  <div class="klh-page">
    <page-head
      glyph="词"
      eyebrow="提示词库"
      title="看得见、拿得走的提示词"
      desc="汇集老师们沉淀的独立提示词，以及智能体的人设、回复设定与工具提示词。可以直接复制使用，也可以借鉴改写成自己的版本。"
    >
      <label class="klh-search">
        <klh-icon name="search" :size="16" />
        <span class="sr-only">搜索提示词</span>
        <input v-model.trim="keyword" type="search" placeholder="搜索提示词内容" />
      </label>
    </page-head>

    <div class="pfilter">
      <div class="pfilter__source" role="group" aria-label="来源">
        <button
          v-for="s in sources"
          :key="s.key"
          type="button"
          :class="['src', { 'is-active': source === s.key }]"
          :aria-pressed="String(source === s.key)"
          @click="source = s.key; category = '全部'"
        >
          <type-badge v-if="s.type" :type="s.type" />
          <span>{{ s.label }}</span>
          <em>{{ sourceCount(s.key) }}</em>
        </button>
      </div>
      <div v-if="categories.length > 1" class="pfilter__cats" role="group" aria-label="分类">
        <button
          v-for="c in categories"
          :key="c"
          type="button"
          :class="['klh-chip', { 'is-active': category === c }]"
          :aria-pressed="String(category === c)"
          @click="category = c"
        >{{ c }}</button>
      </div>
    </div>

    <div v-if="list.length" class="plist">
      <article v-for="p in list" :key="p.id" class="pcard">
        <header class="pcard__head">
          <div>
            <h3>{{ p.name }}</h3>
            <p>
              <span class="pcard__code">{{ p.code }}</span>
              {{ catOf(p) }} · {{ p.author }}
            </p>
          </div>
          <type-badge :type="p.type" />
        </header>
        <prompt-block :text="p.prompt" :title="p.type === 'agent' ? '智能体提示词' : '提示词'" clamp />
        <footer class="pcard__foot">
          <button type="button" class="klh-btn klh-btn--ghost klh-btn--sm" @click="open(p)">
            <klh-icon name="eye" :size="15" />
            {{ p.type === 'agent' ? '查看智能体' : '查看详情' }}
          </button>
        </footer>
      </article>
    </div>
    <div v-else class="klh-empty">
      <klh-icon name="prompt" :size="28" />
      <p>暂无可复制内容。学校资料未附完整人设、回复设定或提示词，待作者补充。</p>
    </div>
  </div>
</template>

<script>
import PageHead from '../components/PageHead.vue';
import PromptBlock from '../components/prompt-block.vue';
import TypeBadge from '../components/TypeBadge.vue';
import KlhIcon from '../components/KlhIcon.vue';
import state, { getters } from '../store';

export default {
  name: 'KlhPromptLibrary',
  components: { PageHead, PromptBlock, TypeBadge, KlhIcon },
  data() {
    return {
      state,
      source: 'all',
      category: '全部',
      keyword: '',
      sources: [
        { key: 'all', label: '全部提示词' },
        { key: 'prompt', label: '独立提示词', type: 'prompt' },
        { key: 'agent', label: '智能体人设与回复', type: 'agent' },
        { key: 'tool', label: '工具提示词', type: 'tool' }
      ]
    };
  },
  computed: {
    all() {
      return getters.allPrompts().filter((p) => !this.keyword || `${p.name}${p.prompt}`.includes(this.keyword));
    },
    categories() {
      if (this.source === 'prompt') return ['全部', ...state.promptCategories];
      if (this.source === 'agent') return ['全部', '学科应用矩阵', '育人管理矩阵'];
      return [];
    },
    list() {
      return this.all.filter((p) => {
        if (this.source !== 'all' && p.type !== this.source) return false;
        if (this.category === '全部') return true;
        return this.catOf(p) === this.category || (this.source === 'agent' && this.matrixLabel(p) === this.category);
      });
    }
  },
  methods: {
    sourceCount(key) {
      return key === 'all' ? this.all.length : this.all.filter((p) => p.type === key).length;
    },
    matrixLabel(p) {
      return p.matrix === 'subject' ? '学科应用矩阵' : '育人管理矩阵';
    },
    catOf(p) {
      if (p.type === 'prompt') return p.category;
      if (p.matrix === 'subject') return `${getters.subjectLabel(p.subject)} · ${getters.sceneLabel(p.scene)}`;
      return getters.domainLabel(p.domain);
    },
    open(p) {
      this.$router.push(`/kelihua/resource/${p.id}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.pfilter {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 22px;
}

.pfilter__source {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.src {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--klh-ink);
  cursor: pointer;

  em { font-style: normal; font-size: 13px; color: var(--klh-faint); font-variant-numeric: tabular-nums; }
  &:hover { border-color: var(--klh-line-strong); }
  &.is-active { border-color: var(--klh-ink); box-shadow: 0 0 0 3px var(--klh-ink-tint); }
}

.pfilter__cats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.plist {
  columns: 3 340px;
  column-gap: 16px;
}

.pcard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: var(--klh-radius);
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  break-inside: avoid;
}

.pcard__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  h3 { font-size: 16px; font-weight: 700; }
  p { margin-top: 2px; font-size: 12px; color: var(--klh-muted); }
}

.pcard__code {
  margin-right: 6px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  color: var(--klh-faint);
}

.pcard__foot {
  display: flex;
  justify-content: flex-end;
  margin-top: -4px;
}
</style>

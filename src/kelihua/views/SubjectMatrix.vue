<template>
  <div class="klh-page">
    <page-head
      glyph="学"
      eyebrow="学科 AI 矩阵"
      title="学科 × 场景，一格一应用"
      desc="覆盖初中各学科，按备课、课堂教学、学习辅导、评价反馈四类场景组织智能体与工具。点击矩阵中的任一格子查看对应应用。"
    >
      <label class="klh-search">
        <klh-icon name="search" :size="16" />
        <span class="sr-only">搜索应用</span>
        <input v-model.trim="keyword" type="search" placeholder="搜索应用名称或用途" />
      </label>
    </page-head>

    <div class="filters" role="group" aria-label="筛选">
      <div class="filters__row">
        <span class="filters__label">年级</span>
        <button
          v-for="g in ['全部', ...state.grades]"
          :key="g"
          type="button"
          :class="['klh-chip', { 'is-active': grade === g }]"
          :aria-pressed="String(grade === g)"
          @click="grade = g"
        >{{ g }}</button>
      </div>
      <div class="filters__row">
        <span class="filters__label">类型</span>
        <button
          v-for="t in typeOptions"
          :key="t.key"
          type="button"
          :class="['klh-chip', { 'is-active': type === t.key }]"
          :aria-pressed="String(type === t.key)"
          @click="type = t.key"
        >
          <i v-if="t.dot" :class="['legend-dot', `legend-dot--${t.key}`]" aria-hidden="true" />
          {{ t.label }}
        </button>
      </div>
    </div>

    <section class="matrix" aria-label="学科与场景矩阵">
      <div class="matrix__scroll">
        <table class="matrix__table">
          <thead>
            <tr>
              <th scope="col" class="matrix__corner">
                <button type="button" :class="{ 'is-on': !subject && !scene }" @click="reset">全部</button>
              </th>
              <th v-for="sc in state.scenes" :key="sc.key" scope="col">
                <button type="button" :class="{ 'is-on': scene === sc.key && !subject }" @click="pick(null, sc.key)">
                  <strong>{{ sc.label }}</strong>
                  <small>{{ sc.hint }}</small>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sb in state.subjects" :key="sb.key">
              <th scope="row">
                <button type="button" :class="{ 'is-on': subject === sb.key && !scene }" @click="pick(sb.key, null)">
                  {{ sb.label }}
                </button>
              </th>
              <td v-for="sc in state.scenes" :key="sc.key">
                <button
                  type="button"
                  :class="['cell', {
                    'is-on': subject === sb.key && scene === sc.key,
                    'is-dim': isDim(sb.key, sc.key),
                    'is-empty': !count(sb.key, sc.key).total
                  }]"
                  :aria-label="`${sb.label} · ${sc.label}：智能体 ${count(sb.key, sc.key).agent} 个，工具 ${count(sb.key, sc.key).tool} 个`"
                  @click="pick(sb.key, sc.key)"
                >
                  <template v-if="count(sb.key, sc.key).total">
                    <span v-if="count(sb.key, sc.key).agent" class="pill pill--agent">{{ count(sb.key, sc.key).agent }}</span>
                    <span v-if="count(sb.key, sc.key).tool" class="pill pill--tool">{{ count(sb.key, sc.key).tool }}</span>
                  </template>
                  <span v-else class="cell__empty">待建设</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="matrix__legend">
        <span><i class="legend-dot legend-dot--agent" />智能体数量</span>
        <span><i class="legend-dot legend-dot--tool" />工具数量</span>
      </p>
    </section>

    <section class="results" aria-live="polite">
      <header class="results__head">
        <h2>{{ resultTitle }}</h2>
        <span class="results__count">共 {{ list.length }} 项</span>
        <button v-if="subject || scene || keyword" type="button" class="klh-btn klh-btn--ghost klh-btn--sm" @click="reset">
          清除筛选
        </button>
      </header>
      <div v-if="list.length" class="klh-card-grid">
        <resource-card v-for="r in list" :key="r.id" :item="r" />
      </div>
      <div v-else class="klh-empty">
        <klh-icon name="inbox" :size="28" />
        <p>这个格子还没有应用，欢迎老师们到「共建中心」提交建设。</p>
        <router-link to="/kelihua/build" class="klh-btn klh-btn--sm">去提交</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import PageHead from '../components/PageHead.vue';
import ResourceCard from '../components/ResourceCard.vue';
import KlhIcon from '../components/KlhIcon.vue';
import state, { getters } from '../store';

export default {
  name: 'KlhSubjectMatrix',
  components: { PageHead, ResourceCard, KlhIcon },
  data() {
    return {
      state,
      grade: '全部',
      type: 'all',
      subject: null,
      scene: null,
      keyword: '',
      typeOptions: [
        { key: 'all', label: '全部' },
        { key: 'agent', label: '智能体', dot: true },
        { key: 'tool', label: '工具', dot: true }
      ]
    };
  },
  computed: {
    base() {
      return getters.published((r) => r.matrix === 'subject'
        && (this.grade === '全部' || (r.grades || []).includes(this.grade))
        && (this.type === 'all' || r.type === this.type)
        && (!this.keyword || `${r.name}${r.desc}`.includes(this.keyword)));
    },
    counts() {
      const map = {};
      this.base.forEach((r) => {
        const k = `${r.subject}|${r.scene}`;
        map[k] = map[k] || { agent: 0, tool: 0, total: 0 };
        map[k][r.type] += 1;
        map[k].total += 1;
      });
      return map;
    },
    list() {
      return this.base.filter((r) => (!this.subject || r.subject === this.subject) && (!this.scene || r.scene === this.scene));
    },
    resultTitle() {
      const parts = [];
      if (this.subject) parts.push(getters.subjectLabel(this.subject));
      if (this.scene) parts.push(getters.sceneLabel(this.scene));
      return parts.length ? parts.join(' · ') : '全部学科应用';
    }
  },
  created() {
    const { subject, scene } = this.$route.query;
    if (subject) this.subject = subject;
    if (scene) this.scene = scene;
  },
  methods: {
    count(sb, sc) {
      return this.counts[`${sb}|${sc}`] || { agent: 0, tool: 0, total: 0 };
    },
    pick(sb, sc) {
      if (this.subject === sb && this.scene === sc) {
        this.reset();
        return;
      }
      this.subject = sb;
      this.scene = sc;
    },
    reset() {
      this.subject = null;
      this.scene = null;
      this.keyword = '';
    },
    isDim(sb, sc) {
      if (!this.subject && !this.scene) return false;
      if (this.subject && this.subject !== sb) return true;
      if (this.scene && this.scene !== sc) return true;
      return false;
    }
  }
};
</script>

<style lang="scss" scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 36px;
  margin-bottom: 18px;
}

.filters__row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.filters__label {
  margin-right: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--klh-ink);
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 2px;
  vertical-align: 1px;
  &--agent { background: var(--klh-blue); }
  &--tool { background: var(--klh-orange); }
}

.klh-chip.is-active .legend-dot { box-shadow: 0 0 0 2px var(--klh-white); }

/* —— 矩阵：本页的标志性元素 —— */
.matrix {
  padding: 8px;
  border-radius: 18px;
  background: var(--klh-white);
  border: 1px solid var(--klh-line);
  box-shadow: var(--klh-shadow);
}

.matrix__scroll {
  overflow-x: auto;
}

.matrix__table {
  width: 100%;
  min-width: 760px;
  border-collapse: separate;
  border-spacing: 4px;
  table-layout: fixed;

  th, td { padding: 0; }

  thead th button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
    padding: 10px 12px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
    color: var(--klh-ink);

    strong { font-size: 15px; }
    small { font-size: 12px; font-weight: 400; color: var(--klh-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    &:hover { background: var(--klh-ink-tint); }
    &.is-on { background: var(--klh-ink); color: var(--klh-white); small { color: rgba(255, 255, 255, 0.7); } }
  }

  .matrix__corner { width: 120px; }
  .matrix__corner button { justify-content: center; align-items: center; height: 100%; min-height: 56px; font-weight: 700; }

  tbody th button {
    width: 100%;
    height: 48px;
    padding: 0 12px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    text-align: left;
    color: var(--klh-ink);
    cursor: pointer;
    &:hover { background: var(--klh-ink-tint); }
    &.is-on { background: var(--klh-ink); color: var(--klh-white); }
  }
}

.cell {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 48px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: var(--klh-paper);
  font: inherit;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, opacity 0.18s;

  &:hover { border-color: var(--klh-line-strong); background: var(--klh-white); }
  &.is-on { border-color: var(--klh-ink); background: var(--klh-white); box-shadow: 0 0 0 3px var(--klh-ink-tint); }
  &.is-dim { opacity: 0.4; }
  &.is-empty { background: transparent; border: 1px dashed var(--klh-line); }
}

.cell__empty {
  font-size: 12px;
  color: var(--klh-faint);
}

.pill {
  display: inline-grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 7px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--klh-white);

  &--agent { background: var(--klh-blue); }
  &--tool { background: var(--klh-orange); }
}

.matrix__legend {
  display: flex;
  gap: 20px;
  padding: 6px 12px 4px;
  font-size: 12px;
  color: var(--klh-muted);
}

.results {
  margin-top: 36px;
}

.results__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;

  h2 { font-size: 20px; font-weight: 800; }
}

.results__count {
  font-size: 13px;
  color: var(--klh-muted);
}

</style>

<template>
  <div class="klh-page">
    <header class="shead">
      <h1 class="shead__title">学科 AI 矩阵</h1>
      <label class="klh-search">
        <klh-icon name="search" :size="16" />
        <span class="sr-only">搜索课例</span>
        <input v-model.trim="keyword" type="search" placeholder="搜索课题或执教老师" />
      </label>
    </header>

    <div class="sfilter klh-panel" role="group" aria-label="课例筛选">
      <div class="sfilter__row">
        <span class="sfilter__label" id="f-subject">学科</span>
        <div class="sfilter__opts" role="group" aria-labelledby="f-subject">
          <button
            v-for="s in state.subjects"
            :key="s.key"
            type="button"
            :class="['opt', { 'is-active': subject === s.key }]"
            :aria-pressed="String(subject === s.key)"
            :disabled="!hasSubject(s.key)"
            :title="hasSubject(s.key) ? '' : '建设中'"
            @click="setSubject(s.key)"
          >{{ s.label }}</button>
        </div>
      </div>
      <div class="sfilter__row">
        <span class="sfilter__label" id="f-grade">年级</span>
        <div class="sfilter__opts" role="group" aria-labelledby="f-grade">
          <button
            v-for="g in state.grades"
            :key="g"
            type="button"
            :class="['opt', { 'is-active': grade === g }]"
            :aria-pressed="String(grade === g)"
            :disabled="!hasBook(subject, g)"
            @click="setGrade(g)"
          >{{ g }}</button>
        </div>
      </div>
      <div class="sfilter__row">
        <span class="sfilter__label" id="f-volume">册次</span>
        <div class="sfilter__opts" role="group" aria-labelledby="f-volume">
          <button
            v-for="v in ['上册', '下册']"
            :key="v"
            type="button"
            :class="['opt', { 'is-active': volume === v }]"
            :aria-pressed="String(volume === v)"
            :disabled="!hasBook(subject, grade, v)"
            @click="setVolume(v)"
          >{{ v }}</button>
        </div>
      </div>
      <div class="sfilter__row">
        <span class="sfilter__label" id="f-cat">分类</span>
        <div class="sfilter__opts" role="group" aria-labelledby="f-cat">
          <button
            v-for="c in catOptions"
            :key="c.key"
            type="button"
            :class="['opt', { 'is-active': cat === c.key }]"
            :aria-pressed="String(cat === c.key)"
            @click="cat = c.key"
          >
            <klh-icon v-if="c.icon" :name="c.icon" :size="15" :stroke="2" />{{ c.label }}
          </button>
        </div>
      </div>
      <div class="sfilter__row">
        <span class="sfilter__label" id="f-featured">精品课</span>
        <div class="sfilter__opts" role="group" aria-labelledby="f-featured">
          <button
            v-for="f in featuredOptions"
            :key="f.key"
            type="button"
            :class="['opt', { 'is-active': featured === f.key }]"
            :aria-pressed="String(featured === f.key)"
            @click="featured = f.key"
          >
            <klh-icon v-if="f.icon" :name="f.icon" :size="15" :stroke="2" />{{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="sbody">
      <nav class="units klh-panel" aria-label="单元目录">
        <p class="units__title">单元目录 · {{ edition }} · {{ grade }}{{ volume }}</p>
        <button
          type="button"
          :class="['unit', { 'is-active': !unitId }]"
          :aria-current="!unitId ? 'true' : null"
          @click="unitId = null"
        >
          <strong>全部单元</strong>
          <small>共 {{ countIn(bookUnits) }} 课</small>
        </button>
        <button
          v-for="u in bookUnits"
          :key="u.id"
          type="button"
          :class="['unit', { 'is-active': unitId === u.id }]"
          :aria-current="unitId === u.id ? 'true' : null"
          @click="unitId = u.id"
        >
          <strong>{{ u.order }} · {{ u.title }}</strong>
          <small>共 {{ countIn([u]) }} 课</small>
        </button>
      </nav>

      <section class="slist" aria-live="polite">
        <p class="slist__sum">
          共 <strong>{{ total }}</strong> 节课，其中 AI 赋能课 <strong>{{ aiTotal }}</strong> 节
        </p>

        <template v-if="total">
          <div v-for="g in groups" :key="g.unit.id" class="sgroup">
            <h2 class="sgroup__title">{{ g.unit.order }} · {{ g.unit.title }}</h2>
            <ul class="lessons">
              <li v-for="l in g.lessons" :key="l.id" class="lcard">
                <router-link :to="`/kelihua/lesson/${l.id}`" class="lcard__cover" :aria-label="`观看《${l.title}》课例视频`">
                  <img :src="covers[l.cover]" alt="" width="264" height="168" loading="lazy" />
                  <span class="lcard__video"><klh-icon name="video" :size="13" />视频</span>
                </router-link>
                <div class="lcard__body">
                  <h3 class="lcard__title">
                    {{ l.title }}
                    <span v-if="l.featured" class="tag tag--featured"><klh-icon name="award" :size="13" :stroke="2.2" />精品课</span>
                    <span v-if="l.ai" class="tag tag--ai"><klh-icon name="sparkle" :size="13" :stroke="2.2" />AI智能体</span>
                    <span v-else class="tag tag--plain">教育教学</span>
                  </h3>
                  <p class="lcard__meta">{{ g.unit.order }} · {{ g.unit.title }} · 执教：{{ l.teacher }} · {{ l.school }}</p>
                  <ul class="lcard__res" aria-label="本课资源">
                    <li v-if="l.ai && agentOf(l)">
                      <button type="button" class="res res--agent" @click="openAgent(l)">
                        <klh-icon name="bot" :size="16" />{{ l.agentName }}
                      </button>
                    </li>
                    <li><span class="res"><klh-icon name="monitor" :size="16" />{{ l.ai ? '智能课件' : '课件' }}</span></li>
                    <li><span class="res"><klh-icon name="file" :size="16" />教案</span></li>
                    <li v-if="!l.ai"><span class="res"><klh-icon name="clipboard" :size="16" />学习任务单</span></li>
                  </ul>
                </div>
                <router-link :to="`/kelihua/lesson/${l.id}`" class="lcard__enter">
                  进入本课<klh-icon name="chevronRight" :size="16" :stroke="2.2" />
                </router-link>
              </li>
            </ul>
          </div>
        </template>
        <div v-else class="klh-empty">
          <klh-icon name="inbox" :size="28" />
          <p>没有符合条件的课例，换个筛选条件试试，或到「共建中心」提交新课例。</p>
          <router-link to="/kelihua/build" class="klh-btn klh-btn--sm">去提交</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import coverBook from '../assets/cover-book.png';
import coverScience from '../assets/cover-science.png';
import state, { actions, getters } from '../store';

export default {
  name: 'KlhSubjectMatrix',
  components: { KlhIcon },
  data() {
    return {
      state,
      covers: { book: coverBook, science: coverScience },
      subject: 'yw',
      grade: '七年级',
      volume: '上册',
      unitId: null,
      cat: 'all',
      featured: 'all',
      keyword: '',
      catOptions: [
        { key: 'all', label: '全部' },
        { key: 'ai', label: 'AI智能体', icon: 'sparkle' },
        { key: 'plain', label: '教育教学' }
      ],
      featuredOptions: [
        { key: 'all', label: '全部' },
        { key: 'yes', label: '精品课', icon: 'award' },
        { key: 'no', label: '普通课' }
      ]
    };
  },
  computed: {
    bookUnits() {
      return state.lessonUnits.filter((u) => u.subject === this.subject && u.grade === this.grade && u.volume === this.volume);
    },
    edition() {
      return (this.bookUnits[0] || {}).edition || '—';
    },
    groups() {
      return this.bookUnits
        .filter((u) => !this.unitId || u.id === this.unitId)
        .map((unit) => ({ unit, lessons: unit.lessons.filter(this.match) }))
        .filter((g) => g.lessons.length);
    },
    total() {
      return this.groups.reduce((n, g) => n + g.lessons.length, 0);
    },
    aiTotal() {
      return this.groups.reduce((n, g) => n + g.lessons.filter((l) => l.ai).length, 0);
    }
  },
  created() {
    const { cat, featured, subject } = this.$route.query;
    if (cat === 'ai') this.cat = 'ai';
    if (featured === '1') this.featured = 'yes';
    if (subject && this.hasSubject(subject)) this.setSubject(subject);
  },
  methods: {
    match(l) {
      if (this.cat === 'ai' && !l.ai) return false;
      if (this.cat === 'plain' && l.ai) return false;
      if (this.featured === 'yes' && !l.featured) return false;
      if (this.featured === 'no' && l.featured) return false;
      if (this.keyword && !`${l.title}${l.teacher}`.includes(this.keyword)) return false;
      return true;
    },
    countIn(units) {
      return units.reduce((n, u) => n + u.lessons.filter(this.match).length, 0);
    },
    hasSubject(key) {
      return state.lessonUnits.some((u) => u.subject === key);
    },
    hasBook(subject, grade, volume) {
      return state.lessonUnits.some((u) => u.subject === subject && u.grade === grade && (!volume || u.volume === volume));
    },
    firstBook(subject, grade) {
      return state.lessonUnits.find((u) => u.subject === subject && (!grade || u.grade === grade));
    },
    setSubject(key) {
      this.subject = key;
      const book = this.firstBook(key, this.hasBook(key, this.grade) ? this.grade : null);
      this.grade = book.grade;
      this.volume = book.volume;
      this.unitId = null;
    },
    setGrade(g) {
      this.grade = g;
      if (!this.hasBook(this.subject, g, this.volume)) this.volume = this.firstBook(this.subject, g).volume;
      this.unitId = null;
    },
    setVolume(v) {
      this.volume = v;
      this.unitId = null;
    },
    agentOf(l) {
      return l.agentName ? getters.findAgentByName(l.agentName) : null;
    },
    openAgent(l) {
      const a = this.agentOf(l);
      if (a) actions.openResource(a.id);
    }
  }
};
</script>

<style lang="scss" scoped>
.shead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.shead__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 800;
  &::before { content: ''; width: 4px; height: 20px; border-radius: 2px; background: var(--klh-blue); }
}

/* —— 筛选面板 —— */
.sfilter {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
}

.sfilter__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.sfilter__label {
  flex-shrink: 0;
  width: 56px;
  line-height: 34px;
  font-size: 15px;
  font-weight: 700;
}

.sfilter__opts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
}

.opt {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--klh-ink-tint);
  color: var(--klh-ink);
  font: inherit;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;

  &:hover:not(:disabled):not(.is-active) { background: var(--klh-blue-tint-2); color: var(--klh-blue); }
  &.is-active { background: var(--klh-blue); color: var(--klh-white); }
  &:disabled { color: var(--klh-faint); opacity: 0.7; cursor: not-allowed; }
}

/* —— 目录 + 列表 —— */
.sbody {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  margin-top: 22px;
}

.units {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 12px;
}

.units__title {
  padding: 0 10px 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--klh-muted);
}

.unit {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  font: inherit;
  text-align: left;
  color: var(--klh-ink);
  cursor: pointer;
  transition: background 0.18s;

  strong { font-size: 15px; font-weight: 600; }
  small { font-size: 12px; color: var(--klh-muted); }

  &:hover { background: var(--klh-ink-tint); }
  &.is-active {
    background: var(--klh-blue-tint);
    strong { color: var(--klh-blue); font-weight: 700; }
  }
}

.slist__sum {
  font-size: 15px;
  color: var(--klh-muted);

  strong { color: var(--klh-blue); font-size: 17px; font-variant-numeric: tabular-nums; }
}

.sgroup { margin-top: 18px; }

.sgroup__title {
  margin-bottom: 12px;
  font-size: 17px;
  font-weight: 800;
}

.lessons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
}

.lcard {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 20px 12px 12px;
  border-radius: 16px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover { border-color: var(--klh-line-strong); box-shadow: var(--klh-shadow); }
}

.lcard__cover {
  position: relative;
  flex-shrink: 0;
  width: 176px;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
  &:hover img { transform: scale(1.04); }
}

.lcard__video {
  position: absolute;
  left: 6px;
  bottom: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 7px;
  border-radius: 5px;
  background: rgba(23, 32, 58, 0.66);
  color: var(--klh-white);
  font-size: 12px;
}

.lcard__body {
  flex: 1;
  min-width: 0;
}

.lcard__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 19px;
  font-weight: 800;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;

  &--ai { background: var(--klh-blue); color: var(--klh-white); }
  &--featured { background: var(--klh-orange-tint-2); color: #a54f06; }
  &--plain { background: var(--klh-ink-tint); color: var(--klh-muted); font-weight: 500; }
}

.lcard__meta {
  margin-top: 6px;
  font-size: 14px;
  color: var(--klh-muted);
}

.lcard__res {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 22px;
  margin-top: 12px;
  list-style: none;
}

.res {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--klh-ink);

  .klh-icon { color: var(--klh-blue); }

  &--agent {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: 14px;
    color: var(--klh-blue);
    font-weight: 600;
    cursor: pointer;
    &:hover { text-decoration: underline; text-underline-offset: 3px; }
  }
}

.lcard__enter {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 42px;
  padding: 0 14px 0 20px;
  border-radius: 10px;
  border: 1.5px solid var(--klh-blue);
  color: var(--klh-blue);
  font-size: 15px;
  font-weight: 700;
  transition: background 0.18s, color 0.18s;

  &:hover { background: var(--klh-blue); color: var(--klh-white); }
}

@media (max-width: 1000px) {
  .sbody { grid-template-columns: 1fr; }
  .units { position: static; flex-direction: row; overflow-x: auto; }
  .units__title { display: none; }
  .unit { flex-shrink: 0; }
}

@media (max-width: 720px) {
  .shead { flex-direction: column; align-items: stretch; }
  .sfilter { padding: 16px; }
  .sfilter__row { flex-direction: column; gap: 6px; }
  .sfilter__label { line-height: 1.4; }
  .lcard { flex-wrap: wrap; padding: 12px; gap: 14px; }
  .lcard__cover { width: 120px; }
  .lcard__enter { width: 100%; justify-content: center; }
}
</style>

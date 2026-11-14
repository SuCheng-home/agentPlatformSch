<template>
  <div class="klh-page">
    <page-head
      glyph="程"
      eyebrow="AI 赋能学程案例矩阵"
      title="以大单元为单位的 AI 赋能学程"
      desc="每个案例以单元大概念和真实任务统领，串联课时、课件、教学设计、任务单与智能体，呈现 AI 在完整学程中的使用方式。"
    />

    <div class="cfilter klh-panel" role="group" aria-label="案例筛选">
      <div class="cfilter__row">
        <span class="cfilter__label">学科</span>
        <button
          v-for="s in subjectOptions"
          :key="s.key"
          type="button"
          :class="['klh-chip', { 'is-active': subject === s.key }]"
          :aria-pressed="String(subject === s.key)"
          @click="setSubject(s.key)"
        >{{ s.label }}</button>
      </div>
      <div class="cfilter__row">
        <span class="cfilter__label">年级</span>
        <button
          v-for="g in ['全部', ...state.grades]"
          :key="g"
          type="button"
          :class="['klh-chip', { 'is-active': grade === g }]"
          :aria-pressed="String(grade === g)"
          @click="setGrade(g)"
        >{{ g }}</button>
      </div>
    </div>

    <p class="csummary">
      共 <strong>{{ units.length }}</strong> 个大单元 · <strong>{{ lessonTotal }}</strong> 个课时，其中 AI 赋能课时 <strong>{{ aiTotal }}</strong> 个
      <span class="csummary__note">教学示例 · 正式课例与资源待接入</span>
    </p>

    <div v-if="units.length" class="case">
      <nav class="case__catalog klh-panel" aria-label="大单元目录">
        <h2 class="case__catalog-title">
          <klh-icon name="layers" :size="18" />
          大单元目录
        </h2>
        <button
          v-for="u in units"
          :key="u.id"
          type="button"
          :class="['unit-item', { 'is-active': active && active.id === u.id }]"
          :aria-current="active && active.id === u.id ? 'true' : null"
          @click="activeId = u.id"
        >
          <small>{{ subjectLabel(u.subject) }} · {{ u.grade }}{{ u.volume }} · {{ u.order }}</small>
          <strong>{{ u.title }}</strong>
          <span>{{ u.lessons.length }} 个课时 · AI 赋能 {{ u.lessons.filter((l) => l.ai).length }}</span>
        </button>
      </nav>

      <section v-if="active" class="case__detail" aria-live="polite">
        <header class="unit-hero">
          <p class="unit-hero__crumb">{{ active.edition }} · {{ active.grade }}{{ active.volume }} · {{ active.order }} · {{ subjectLabel(active.subject) }}</p>
          <h2 class="unit-hero__title">{{ active.title }}</h2>
          <p class="unit-hero__idea"><span>单元大概念</span>{{ active.bigIdea }}</p>
          <div class="unit-hero__task">
            <span class="unit-hero__task-tag">单元任务</span>
            <p>{{ active.task }}</p>
          </div>
          <p class="unit-hero__by">设计团队：{{ active.designer }}</p>
        </header>

        <div class="lessons-head">
          <h3>学程课时</h3>
          <span>共 {{ active.lessons.length }} 课时 · 按单元进程推进</span>
        </div>

        <ol class="lessons">
          <li v-for="(l, i) in active.lessons" :key="i" :class="['lesson', { 'lesson--ai': l.ai }]">
            <div class="lesson__no" aria-hidden="true">
              <small>课时</small>
              <strong>{{ String(i + 1).padStart(2, '0') }}</strong>
            </div>
            <div class="lesson__body">
              <h4 class="lesson__title">
                <span class="sr-only">课时 {{ i + 1 }}：</span>{{ l.title }}
                <span v-if="l.featured" class="tag tag--featured">
                  <klh-icon name="award" :size="12" :stroke="2.2" />精品课
                </span>
                <span v-if="l.ai" class="tag tag--ai">
                  <klh-icon name="sparkle" :size="12" :stroke="2.2" />AI 赋能
                </span>
              </h4>
              <p class="lesson__goal">{{ l.goal }}</p>
              <ul class="lesson__res" aria-label="课时资源">
                <li v-for="k in l.kinds" :key="k">
                  <button
                    v-if="k === '智能体' && agentOf(l)"
                    type="button"
                    class="res res--agent"
                    @click="openAgent(l)"
                  >
                    <klh-icon name="bot" :size="15" />{{ agentOf(l).name }}
                  </button>
                  <span v-else class="res">
                    <klh-icon :name="kindIcon(k)" :size="15" />{{ k }}
                  </span>
                </li>
              </ul>
            </div>
            <button type="button" class="klh-btn klh-btn--sm lesson__enter" @click="enter(l)">
              进入本课
              <klh-icon name="arrowRight" :size="14" />
            </button>
          </li>
        </ol>
      </section>
    </div>
    <div v-else class="klh-empty">
      <klh-icon name="route" :size="28" />
      <p>当前学科与年级暂无学程案例，欢迎各教研组提交大单元设计。</p>
    </div>
  </div>
</template>

<script>
import PageHead from '../components/PageHead.vue';
import KlhIcon from '../components/KlhIcon.vue';
import state, { actions, getters } from '../store';

const KIND_ICON = { 'AI 课件': 'monitor', 教学设计: 'file', 任务单: 'clipboard', 微课: 'video', 评价量表: 'award' };

export default {
  name: 'KlhCaseMatrix',
  components: { PageHead, KlhIcon },
  data() {
    return { state, subject: 'all', grade: '全部', activeId: null };
  },
  computed: {
    subjectOptions() {
      const used = new Set(state.units.map((u) => u.subject));
      return [{ key: 'all', label: '全部' }, ...state.subjects.filter((s) => used.has(s.key))];
    },
    units() {
      return state.units.filter((u) => (this.subject === 'all' || u.subject === this.subject)
        && (this.grade === '全部' || u.grade === this.grade));
    },
    active() {
      return this.units.find((u) => u.id === this.activeId) || this.units[0] || null;
    },
    lessonTotal() {
      return this.units.reduce((n, u) => n + u.lessons.length, 0);
    },
    aiTotal() {
      return this.units.reduce((n, u) => n + u.lessons.filter((l) => l.ai).length, 0);
    }
  },
  methods: {
    subjectLabel: getters.subjectLabel,
    kindIcon(k) {
      return KIND_ICON[k] || 'file';
    },
    agentOf(l) {
      return l.agentName ? getters.findAgentByName(l.agentName) : null;
    },
    openAgent(l) {
      const a = this.agentOf(l);
      if (a) actions.openResource(a.id);
    },
    setSubject(k) {
      this.subject = k;
      this.activeId = null;
    },
    setGrade(g) {
      this.grade = g;
      this.activeId = null;
    },
    enter(l) {
      this.$message({ message: `「${l.title}」课例资源待接入`, customClass: 'klh-popper' });
    }
  }
};
</script>

<style lang="scss" scoped>
.cfilter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
}

.cfilter__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.cfilter__label {
  width: 48px;
  font-size: 13px;
  font-weight: 700;
}

.csummary {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  margin: 22px 0 16px;
  font-size: 14px;
  color: var(--klh-muted);

  strong { color: var(--klh-blue); font-size: 16px; font-variant-numeric: tabular-nums; }
}

.csummary__note {
  margin-left: auto;
  font-size: 13px;
  color: var(--klh-faint);
}

.case {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.case__catalog {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 12px 12px;
}

.case__catalog-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 10px;
  font-size: 17px;
  font-weight: 800;
  color: var(--klh-ink);
  .klh-icon { color: var(--klh-blue); }
}

.unit-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font: inherit;
  text-align: left;
  color: var(--klh-ink);
  cursor: pointer;
  transition: background 0.18s;

  small { font-size: 12px; color: var(--klh-faint); }
  strong { font-size: 16px; font-weight: 700; }
  span { font-size: 12px; color: var(--klh-muted); }

  &:hover { background: var(--klh-ink-tint); }
  &.is-active {
    background: var(--klh-blue-tint);
    strong { color: var(--klh-blue); }
  }
}

.unit-hero {
  position: relative;
  padding: 26px 28px;
  border-radius: 18px;
  background: var(--klh-white);
  border: 1px solid var(--klh-line);
  overflow: hidden;
}

.unit-hero__crumb {
  font-size: 13px;
  color: var(--klh-muted);
}

.unit-hero__title {
  margin-top: 6px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.unit-hero__idea {
  margin-top: 10px;
  font-size: 15px;
  color: var(--klh-ink);

  span {
    margin-right: 10px;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--klh-ink-tint);
    font-size: 12px;
    font-weight: 700;
    vertical-align: 1px;
  }
}

.unit-hero__task {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 12px;
  background: var(--klh-orange-tint);

  p { font-size: 15px; font-weight: 600; }
}

.unit-hero__task-tag {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 800;
  color: #b85a08;
}

.unit-hero__by {
  margin-top: 14px;
  font-size: 12px;
  color: var(--klh-faint);
}

.lessons-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 28px 0 14px;

  h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 800;
    &::before { content: ''; width: 4px; height: 18px; border-radius: 2px; background: var(--klh-blue); }
  }
  span { font-size: 13px; color: var(--klh-muted); }
}

/* 课时按学程串成一条纵线 */
.lessons {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;

  &::before {
    content: '';
    position: absolute;
    left: 39px;
    top: 24px;
    bottom: 24px;
    width: 2px;
    background: repeating-linear-gradient(var(--klh-line-strong) 0 6px, transparent 6px 12px);
  }
}

.lesson {
  position: relative;
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;
  padding: 18px 20px 18px 0;
  border-radius: 16px;
  background: var(--klh-white);
  border: 1px solid var(--klh-line);
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover { border-color: var(--klh-line-strong); box-shadow: var(--klh-shadow); }
}

.lesson__no {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  width: 58px;
  padding: 6px 0;
  border-radius: 12px;
  background: var(--klh-paper);
  border: 1px solid var(--klh-line);

  small { font-size: 11px; color: var(--klh-muted); }
  strong { font-size: 24px; font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; color: var(--klh-ink); }

  .lesson--ai & {
    background: var(--klh-blue);
    border-color: var(--klh-blue);
    small { color: rgba(255, 255, 255, 0.75); }
    strong { color: var(--klh-white); }
  }
}

.lesson__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 17px;
  font-weight: 700;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;

  &--ai { background: var(--klh-blue); color: var(--klh-white); }
  &--featured { background: var(--klh-orange-tint); color: #b85a08; }
}

.lesson__goal {
  margin-top: 4px;
  font-size: 14px;
  color: var(--klh-muted);
}

.lesson__res {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 12px;
  list-style: none;
}

.res {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--klh-ink);
  opacity: 0.8;

  &--agent {
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid rgba(28, 69, 196, 0.25);
    background: var(--klh-blue-tint);
    color: var(--klh-blue);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    opacity: 1;
    cursor: pointer;
    &:hover { background: var(--klh-blue-tint-2); }
  }
}

.lesson__enter {
  align-self: center;
}

@media (max-width: 1000px) {
  .case { grid-template-columns: 1fr; }
  .case__catalog { position: static; }
}

@media (max-width: 640px) {
  .lesson {
    grid-template-columns: 64px minmax(0, 1fr);
    padding-right: 14px;
  }
  .lessons::before { left: 31px; }
  .lesson__enter { grid-column: 2; justify-self: start; }
  .unit-hero { padding: 20px; }
  .unit-hero__title { font-size: 26px; }
  .unit-hero__task { flex-direction: column; align-items: flex-start; gap: 4px; }
}
</style>

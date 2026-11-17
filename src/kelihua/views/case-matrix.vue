<template>
  <div class="klh-page">
    <h1 class="sr-only">AI 赋能学程案例矩阵</h1>

    <div class="cfilter klh-panel" role="group" aria-label="案例筛选">
      <div class="cfilter__row">
        <span class="cfilter__label">学科</span>
        <button
          v-for="s in subjectOptions"
          :key="s.key"
          type="button"
          :class="['klh-chip', { 'is-active': currentSubject === s.key }]"
          :aria-pressed="String(currentSubject === s.key)"
          @click="setSubject(s.key)"
        >{{ s.label }}</button>
      </div>
      <div class="cfilter__row">
        <span class="cfilter__label">年级</span>
        <button
          v-for="g in gradeOptions"
          :key="g"
          type="button"
          :class="['klh-chip', { 'is-active': currentGrade === g }]"
          :aria-pressed="String(currentGrade === g)"
          @click="setGrade(g)"
        >{{ g }}</button>
      </div>
    </div>

    <p class="csummary">
      共 <strong>{{ units.length }}</strong> 个主题单元 · <strong>{{ lessonTotal }}</strong> 个课时，其中原文涉及 AI 的课例 <strong>{{ aiTotal }}</strong> 个
      <span class="csummary__note">真实课例已导入 · 视频与独立课件未提供</span>
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
          <small>{{ subjectLabel(u.subject) }} · {{ u.order }}</small>
          <strong>{{ u.title }}</strong>
          <span>{{ u.lessons.length }} 个课时</span>
        </button>
      </nav>

      <section v-if="active" class="case__detail" aria-live="polite">
        <div class="lessons-head">
          <h2>{{ active.title }} · 单元课时资源</h2>
          <span>共 {{ active.lessons.length }} 课时 · 按单元进程上课</span>
        </div>

        <ol class="lessons">
          <li v-for="(l, i) in active.lessons" :key="l.id" class="lesson">
            <div class="lesson__no" aria-hidden="true">
              <small>课时</small>
              <strong>{{ String(i + 1).padStart(2, '0') }}</strong>
            </div>
            <div class="lesson__body">
              <h3 class="lesson__title">
                <span class="sr-only">课时 {{ i + 1 }}：</span>{{ l.title }}
                <span v-if="l.featured" class="tag tag--featured">
                  <klh-icon name="award" :size="12" :stroke="2.2" />精品课
                </span>
                <span v-if="l.ai" class="tag tag--ai">
                  <klh-icon name="sparkle" :size="12" :stroke="2.2" />AI 赋能
                </span>
              </h3>
              <p class="lesson__goal">{{ l.goal }}</p>
              <div class="lesson__foot">
                <ul class="lesson__res" aria-label="课时资源">
                  <li v-for="k in LESSON_KINDS" :key="k.label">
                    <span class="res"><klh-icon :name="k.icon" :size="15" />{{ k.label }}</span>
                  </li>
                </ul>
                <router-link :to="`/kelihua/lesson/${l.id}`" class="lesson__enter">
                  进入本课
                  <klh-icon name="arrowRight" :size="14" :stroke="2.2" />
                </router-link>
              </div>
            </div>
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
import KlhIcon from '../components/KlhIcon.vue';
import state, { getters } from '../store';

const LESSON_KINDS = [
  { label: 'AI 课件', icon: 'monitor' },
  { label: '教学设计', icon: 'file' },
  { label: '任务单', icon: 'clipboard' },
  { label: '智能体', icon: 'bot' }
];

export default {
  name: 'KlhCaseMatrix',
  components: { KlhIcon },
  data() {
    return { state, LESSON_KINDS, subject: '', grade: '', activeId: null };
  },
  computed: {
    subjectOptions() {
      const used = new Set(state.lessonUnits.map((u) => u.subject));
      return state.subjects.filter((s) => used.has(s.key));
    },
    currentSubject() {
      return this.subjectOptions.some((s) => s.key === this.subject) ? this.subject : (this.subjectOptions[0] || {}).key;
    },
    gradeOptions() {
      const used = new Set(state.lessonUnits
        .filter((unit) => unit.subject === this.currentSubject)
        .flatMap((unit) => unit.lessons.map((lesson) => lesson.grade || '年级待核实')));
      return [...state.grades, '年级待核实'].filter((g) => used.has(g));
    },
    currentGrade() {
      return this.gradeOptions.includes(this.grade) ? this.grade : this.gradeOptions[0];
    },
    units() {
      return state.lessonUnits
        .filter((unit) => unit.subject === this.currentSubject)
        .map((unit) => ({ ...unit, lessons: unit.lessons.filter((lesson) => (lesson.grade || '年级待核实') === this.currentGrade) }))
        .filter((unit) => unit.lessons.length);
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
    setSubject(k) {
      this.subject = k;
      this.activeId = null;
    },
    setGrade(g) {
      this.grade = g;
      this.activeId = null;
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
  top: 92px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 12px 12px;
  max-height: calc(100vh - 116px);
  overflow-y: auto;
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
  flex-shrink: 0;
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

.lessons-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 16px;

  h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 800;
    &::before { content: ''; flex-shrink: 0; width: 4px; height: 20px; border-radius: 2px; background: var(--klh-blue); }
  }
  span { flex-shrink: 0; font-size: 13px; color: var(--klh-muted); }
}

.lessons {
  display: flex;
  flex-direction: column;
  gap: 14px;
  list-style: none;
  padding: 0;
}

.lesson {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
  padding: 22px 24px;
  border-radius: 18px;
  background: var(--klh-white);
  border: 1px solid var(--klh-line);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

  &:hover { border-color: var(--klh-blue-tint-2); box-shadow: var(--klh-shadow); transform: translateY(-2px); }
}

.lesson__no {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 76px;
  height: 76px;
  border-radius: 16px;
  background: var(--klh-blue-tint);
  color: var(--klh-blue);

  small { font-size: 12px; opacity: 0.85; }
  strong { font-size: 28px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
}

.lesson__body { min-width: 0; }

.lesson__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.4;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 24px;
  padding: 0 9px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;

  &--ai { background: var(--klh-blue); color: var(--klh-white); }
  &--featured { background: var(--klh-orange-tint); color: #b85a08; }
}

.lesson__goal {
  display: -webkit-box;
  margin-top: 8px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 14px;
  line-height: 1.7;
  color: var(--klh-muted);
}

.lesson__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-top: 16px;
}

.lesson__res {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  list-style: none;
  padding: 0;
}

.res {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--klh-muted);
  .klh-icon { color: var(--klh-blue); }
}

.lesson__enter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1.5px solid var(--klh-blue-tint-2);
  color: var(--klh-blue);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s, border-color 0.2s;

  &:hover { background: var(--klh-blue); border-color: var(--klh-blue); color: var(--klh-white); }
}

@media (max-width: 1000px) {
  .case { grid-template-columns: 1fr; }
  .case__catalog { position: static; max-height: none; }
}

@media (max-width: 640px) {
  .lesson { grid-template-columns: 1fr; gap: 14px; padding: 18px; }
  .lesson__no { flex-direction: row; width: auto; height: auto; padding: 6px 12px; justify-self: start; gap: 6px; }
  .lesson__no strong { font-size: 18px; }
  .lessons-head { flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  .lesson { transition: none; }
}
</style>

<template>
  <div class="klh-page home">
    <section class="hero" aria-labelledby="klh-home-title">
      <div class="hero__main">
        <p class="hero__date">{{ today }}</p>
        <h1 id="klh-home-title" class="hero__title">
          <span class="klh-brush hero__brand">科智汇</span>
          <span class="hero__sub">AI 矩阵平台</span>
        </h1>
        <p class="hero__greet">{{ teacherName }}，{{ greeting }}。今天想从哪里开始？</p>
      </div>

      <nav class="hero__entries" aria-label="三大矩阵入口">
        <router-link v-for="m in matrices" :key="m.key" :to="m.to" :class="['entry', `entry--${m.key}`]">
          <span class="entry__text">
            <strong class="entry__title">{{ m.title }}</strong>
            <span class="entry__sub">{{ m.sub }}</span>
          </span>
          <span class="entry__arrow" aria-hidden="true">
            <klh-icon name="arrowRight" :size="26" :stroke="2" />
          </span>
        </router-link>
      </nav>
    </section>
  </div>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import { getters } from '../store';

export default {
  name: 'KlhHome',
  components: { KlhIcon },
  data() {
    return {
      matrices: [
        { key: 'subject', title: '学科应用矩阵', sub: '精准教学 · 智慧教研', to: '/kelihua/subject' },
        { key: 'education', title: '育人管理矩阵', sub: '五育融合 · 全面发展', to: '/kelihua/education' },
        { key: 'course', title: 'AI 赋能学程案例矩阵', sub: '创新实践 · 共建共享', to: '/kelihua/course' }
      ]
    };
  },
  computed: {
    teacherName() {
      const name = getters.roleInfo().name;
      return name.endsWith('老师') ? name : `${name}老师`;
    },
    today() {
      const d = new Date();
      const week = '日一二三四五六'[d.getDay()];
      return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${week}`;
    },
    greeting() {
      const h = new Date().getHours();
      if (h < 11) return '早上好';
      if (h < 14) return '中午好';
      if (h < 18) return '下午好';
      return '晚上好';
    }
  }
};
</script>

<style lang="scss" scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 12px;
  min-height: min(620px, calc(100vh - 140px));
}

/* 标志性元素：校徽蓝整块色面 + 超大毛笔「科智汇」 */
.hero__main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  padding: clamp(28px, 4vw, 56px);
  background: var(--klh-blue);
  color: var(--klh-white);
  animation: klh-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.hero__date {
  font-size: 14px;
  letter-spacing: 0.16em;
  opacity: 0.8;
}

.hero__title {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero__brand {
  font-size: clamp(72px, 10vw, 148px);
  line-height: 0.95;
  letter-spacing: 0.02em;
}

.hero__sub {
  font-size: clamp(24px, 2.6vw, 36px);
  font-weight: 800;
  letter-spacing: 0.24em;
}

.hero__greet {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
}

.hero__entries {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 12px;
}

.entry {
  --bg: var(--klh-orange);
  --fg: var(--klh-ink);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px clamp(20px, 2.6vw, 36px);
  background: var(--bg);
  color: var(--fg);
  animation: klh-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  transition: transform 0.2s;

  &:nth-child(1) { animation-delay: 0.08s; }
  &:nth-child(2) { animation-delay: 0.16s; }
  &:nth-child(3) { animation-delay: 0.24s; }

  &:hover { transform: translateX(-6px); }
  &:hover .entry__arrow { transform: translateX(6px); }

  &--education { --bg: var(--klh-ink); --fg: var(--klh-white); }
  &--course { --bg: var(--klh-teal); --fg: var(--klh-white); }
}

.entry__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry__title {
  font-size: clamp(22px, 2.2vw, 30px);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-wrap: balance;
}

.entry__sub {
  font-size: 15px;
  letter-spacing: 0.12em;
  opacity: 0.85;
}

.entry__arrow {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 2px solid currentColor;
  border-radius: 50%;
  transition: transform 0.2s;
}

@keyframes klh-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 960px) {
  .hero { grid-template-columns: 1fr; min-height: 0; }
  .entry { min-height: 120px; }
}

@media (prefers-reduced-motion: reduce) {
  .hero__main, .entry { animation: none; }
  .entry, .entry__arrow { transition: none; }
}
</style>

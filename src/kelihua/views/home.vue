<template>
  <div class="home">
    <section class="hero" aria-labelledby="klh-home-title" :style="{ backgroundImage: `url(${heroImg})` }">
      <header class="hero__brand">
        <img :src="logo" alt="南京市科利华中学校徽" width="44" height="44" />
        <span class="klh-brush hero__brand-zh">科智汇</span>
        <span class="hero__brand-sub">AI 矩阵平台</span>
      </header>

      <div class="hero__center">
        <h1 id="klh-home-title" class="hero__title">
          <span class="klh-brush hero__zh">科智汇</span>
          <span class="hero__ai">AI 矩阵平台</span>
        </h1>
        <p class="hero__motto">
          <span class="rule" aria-hidden="true" />
          汇聚教育智慧<span class="gap" aria-hidden="true" />赋能师生成长
          <span class="rule" aria-hidden="true" />
        </p>
      </div>

      <p class="hero__greet">{{ today }} · {{ teacherName }}，{{ greeting }}</p>
    </section>

    <aside class="side">
      <div class="side__top">
        <user-menu />
      </div>

      <nav class="entries" aria-label="三大矩阵入口">
        <router-link v-for="m in matrices" :key="m.key" :to="m.to" :class="['entry', `entry--${m.key}`]">
          <span class="entry__icon"><img :src="m.icon" alt="" width="96" height="96" /></span>
          <span class="entry__text">
            <strong class="entry__title">{{ m.title }}</strong>
            <span class="entry__sub">{{ m.sub }}</span>
          </span>
          <span class="entry__arrow" aria-hidden="true">
            <klh-icon name="arrowRight" :size="20" :stroke="2" />
          </span>
        </router-link>
      </nav>

      <nav class="quick" aria-label="更多栏目">
        <router-link v-for="item in extras" :key="item.to" :to="item.to" class="quick__link">
          <klh-icon :name="item.icon" :size="18" />
          {{ item.label }}
          <span v-if="item.badge" class="quick__badge" :aria-label="`${item.badge} 条待审核`">{{ item.badge }}</span>
        </router-link>
      </nav>
    </aside>
  </div>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import UserMenu from '../components/user-menu.vue';
import logo from '../assets/logo.png';
import heroImg from '../assets/home-hero.webp';
import iconSubject from '../assets/icons/mx-subject.webp';
import iconEducation from '../assets/icons/mx-education.webp';
import iconCourse from '../assets/icons/mx-course.webp';
import { getters } from '../store';
import { navItems } from '../nav';

export default {
  name: 'KlhHome',
  components: { KlhIcon, UserMenu },
  data() {
    return {
      logo,
      heroImg,
      matrices: [
        { key: 'subject', title: '学科应用矩阵', sub: '精准教学 · 智慧教研', to: '/kelihua/subject', icon: iconSubject },
        { key: 'education', title: '育人管理矩阵', sub: '五育融合 · 全面发展', to: '/kelihua/education', icon: iconEducation },
        { key: 'course', title: 'AI 赋能学程案例矩阵', sub: '创新实践 · 共建共享', to: '/kelihua/course', icon: iconCourse }
      ]
    };
  },
  computed: {
    extras() {
      return navItems().filter((item) => !item.matrix && item.to !== '/kelihua/home');
    },
    teacherName() {
      const name = getters.roleInfo().name;
      return name.endsWith('老师') ? name : `${name}老师`;
    },
    today() {
      const d = new Date();
      const week = '日一二三四五六'[d.getDay()];
      return `${d.getMonth() + 1} 月 ${d.getDate()} 日 星期${week}`;
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
.home {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(340px, 1fr);
  gap: 20px;
  min-height: 100vh;
  padding: clamp(16px, 2vw, 28px);
}

.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  min-height: 560px;
  padding: clamp(20px, 2.4vw, 32px) clamp(24px, 3vw, 44px);
  border-radius: 24px;
  background-color: #f7f9fc;
  background-size: cover;
  background-position: right bottom;
  box-shadow: var(--klh-shadow);
  overflow: hidden;
  animation: klh-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.hero__brand {
  display: flex;
  align-items: center;
  gap: 10px;

  img { width: 44px; height: 44px; border-radius: 50%; }
}
.hero__brand-zh { font-size: 30px; line-height: 1; color: var(--klh-blue-deep); }
.hero__brand-sub {
  padding-left: 12px;
  border-left: 1.5px solid var(--klh-line-strong);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--klh-blue-deep);
}

.hero__center {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(16px, 2vw, 28px);
}

.hero__title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.hero__zh {
  font-size: clamp(72px, 9vw, 160px);
  line-height: 1;
  white-space: nowrap;
  letter-spacing: 0.04em;
  color: var(--klh-blue-deep);
  text-shadow: 0 6px 18px rgba(20, 50, 154, 0.12);
}

.hero__ai {
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 800;
  letter-spacing: 0.32em;
  padding-left: 0.32em;
  color: var(--klh-blue);
}

.hero__motto {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: clamp(16px, 1.5vw, 20px);
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--klh-blue-deep);
  white-space: nowrap;

  .rule { width: 40px; height: 1.5px; background: currentColor; opacity: 0.5; }
  .gap { display: inline-block; width: 1em; }
}

.hero__greet {
  font-size: 14px;
  letter-spacing: 0.06em;
  color: var(--klh-muted);
}

.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.side__top {
  display: flex;
  justify-content: flex-end;
}

.entries {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
}

.entry {
  --tone: var(--klh-orange);
  --tint: #fff3e6;
  display: flex;
  flex: 1;
  align-items: center;
  gap: 20px;
  min-height: 120px;
  padding: 20px 24px;
  border-radius: 20px;
  background: linear-gradient(120deg, var(--tint), var(--klh-white) 140%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8), var(--klh-shadow);
  animation: klh-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  transition: transform 0.2s, box-shadow 0.2s;

  &:nth-child(1) { animation-delay: 0.08s; }
  &:nth-child(2) { animation-delay: 0.16s; }
  &:nth-child(3) { animation-delay: 0.24s; }

  &:hover {
    transform: translateY(-3px);
    box-shadow: inset 0 0 0 1px var(--tone), 0 16px 32px -20px var(--tone);
  }
  &:hover .entry__arrow { background: var(--tone); color: var(--klh-white); }

  &--education { --tone: var(--klh-blue); --tint: #e9effd; }
  &--course { --tone: var(--klh-teal); --tint: #e3f4f1; }
}

.entry__icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--klh-white);
  box-shadow: 0 8px 20px -12px var(--tone);

  img { width: 68px; height: 68px; object-fit: contain; }
}

.entry__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.entry__title {
  font-size: clamp(20px, 1.8vw, 26px);
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: var(--tone);
  text-wrap: balance;
}

.entry__sub {
  font-size: 15px;
  letter-spacing: 0.1em;
  color: var(--klh-muted);
}

.entry__arrow {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1.5px solid var(--tone);
  border-radius: 50%;
  color: var(--tone);
  transition: background 0.2s, color 0.2s;
}

.quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  font-size: 14px;
  color: var(--klh-ink);
  transition: border-color 0.2s, color 0.2s;

  &:hover { border-color: var(--klh-blue); color: var(--klh-blue); }
}

.quick__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--klh-orange);
  color: var(--klh-white);
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

@keyframes klh-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 1080px) {
  .home { grid-template-columns: 1fr; }
  .hero { min-height: 440px; }
  .hero__center { max-width: 100%; }
  .side__top { order: -1; }
}

@media (max-width: 560px) {
  .hero__motto .rule { display: none; }
  .hero__motto { white-space: normal; }
  .entry { gap: 14px; padding: 16px; }
  .entry__icon { width: 64px; height: 64px; img { width: 52px; height: 52px; } }
}

@media (prefers-reduced-motion: reduce) {
  .hero, .entry { animation: none; }
  .entry, .entry__arrow { transition: none; }
}
</style>

<template>
  <div class="home" :style="{ '--campus': `url(${campus})`, '--school-name': `url(${schoolName})` }">
    <section class="hero" aria-labelledby="klh-home-title">
      <header class="hero__bar">
        <div class="hero__brand">
          <span class="hero__logo"><img :src="logo" alt="" width="40" height="36" /></span>
          <span class="hero__school" role="img" aria-label="南京市科利华中学" />
        </div>
      </header>

      <div class="hero__center">
        <h1 id="klh-home-title" class="hero__title">
          <span class="klh-brush hero__zh">科智汇</span>
          <span class="hero__sep" aria-hidden="true">｜</span>
          <span class="hero__ai">AI 矩阵平台</span>
        </h1>
        <p class="hero__motto">
          <span class="rule" aria-hidden="true" />
          汇聚教育智慧<span class="gap" aria-hidden="true" />赋能师生成长
        </p>
      </div>
    </section>

    <nav class="entries" aria-label="三大矩阵入口">
      <router-link v-for="m in matrices" :key="m.key" :to="m.to" :class="['entry', `entry--${m.key}`]">
        <span class="entry__icon"><img :src="m.icon" alt="" width="96" height="96" /></span>
        <strong class="entry__title">{{ m.title }}</strong>
        <span class="entry__arrow" aria-hidden="true">
          进入
          <klh-icon name="arrowRight" :size="16" :stroke="2.4" />
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
  </div>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import logo from '../assets/logo-klh.png';
import schoolName from '../assets/school-name.png';
import campus from '../assets/home-campus.webp';
import iconSubject from '../assets/icons/mx-subject.webp';
import iconEducation from '../assets/icons/mx-education.webp';
import iconCourse from '../assets/icons/mx-course.webp';
import { navItems } from '../nav';

export default {
  name: 'KlhHome',
  components: { KlhIcon },
  data() {
    return {
      logo,
      schoolName,
      campus,
      matrices: [
        { key: 'subject', title: '学科应用矩阵', to: '/kelihua/subject', icon: iconSubject },
        { key: 'education', title: '育人管理矩阵', to: '/kelihua/education', icon: iconEducation },
        { key: 'course', title: 'AI 赋能学程案例矩阵', to: '/kelihua/course', icon: iconCourse }
      ]
    };
  },
  computed: {
    extras() {
      const hidden = ['/kelihua/home', '/kelihua/prompts', '/kelihua/build'];
      return navItems().filter((item) => !item.matrix && !hidden.includes(item.to));
    }
  }
};
</script>

<style lang="scss" scoped>
/* 校园实景铺满整页：上 1/3 标题，下 2/3 三大矩阵入口 */
.home {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-rows: minmax(220px, 1fr) minmax(340px, 2fr) auto;
  gap: 20px;
  height: 100vh;
  min-height: 640px;
  padding: clamp(16px, 2vw, 28px) max(clamp(16px, 2.4vw, 36px), calc((100vw - 1440px) / 2));
  background: var(--klh-blue-deep);
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
  }

  &::before {
    z-index: -2;
    background: var(--campus) center 38% / cover no-repeat;
    animation: klh-zoom 1.2s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  /* 顶部压深蓝保证白字可读，中段透出操场与教学楼 */
  &::after {
    background:
      linear-gradient(180deg, rgba(13, 36, 120, 0.86) 0%, rgba(13, 36, 120, 0.6) 26%, rgba(13, 36, 120, 0.12) 52%, rgba(13, 36, 120, 0.05) 72%, rgba(13, 36, 120, 0.5) 100%);
  }
}

.hero {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  min-height: 0;
  color: var(--klh-white);
  animation: klh-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.hero__bar {
  display: flex;
  align-items: center;
}

.hero__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero__logo {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--klh-white);
  box-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.5);

  img { width: 40px; height: 36px; object-fit: contain; }
}

/* 书法校名为黑色透明底 PNG，用遮罩染成白色 */
.hero__school {
  display: block;
  width: clamp(180px, 20vw, 260px);
  aspect-ratio: 613 / 90;
  background: var(--klh-white);
  -webkit-mask: var(--school-name) left center / contain no-repeat;
  mask: var(--school-name) left center / contain no-repeat;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.hero__center {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(10px, 1.2vw, 16px);
}

.hero__title {
  display: flex;
  align-items: center;
  gap: 0 clamp(6px, 0.8vw, 12px);
  white-space: nowrap;
  text-shadow: 0 6px 24px rgba(5, 16, 60, 0.45);
}

.hero__zh {
  font-size: clamp(44px, 5.2vw, 84px);
  line-height: 1;
  letter-spacing: 0.04em;
}

.hero__sep {
  font-size: clamp(32px, 3.6vw, 58px);
  font-weight: 300;
  line-height: 1;
  opacity: 0.7;
}

.hero__ai {
  font-size: clamp(28px, 3.2vw, 52px);
  font-weight: 800;
  letter-spacing: 0.1em;
  line-height: 1;
}

.hero__motto {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: clamp(15px, 1.4vw, 19px);
  font-weight: 600;
  letter-spacing: 0.16em;
  white-space: nowrap;
  text-shadow: 0 2px 10px rgba(5, 16, 60, 0.5);

  .rule { width: 40px; height: 2px; background: var(--klh-orange); }
  .gap { display: inline-block; width: 1em; }
}

/* 三大矩阵入口：图标与标题居中，色块半透以融入校园照片 */
.entries {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-content: center;
  gap: clamp(14px, 1.8vw, 24px);
  min-height: 0;
}

.entry {
  --tone: 210, 101, 10;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 1.4vw, 18px);
  height: 100%;
  max-height: 420px;
  min-height: 0;
  padding: clamp(20px, 2.4vw, 32px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: linear-gradient(160deg, rgba(var(--tone), 0.9) 0%, rgba(var(--tone), 0.78) 100%);
  backdrop-filter: blur(10px) saturate(1.2);
  color: var(--klh-white);
  text-align: center;
  box-shadow: 0 22px 40px -24px rgba(5, 16, 60, 0.8);
  animation: klh-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  transition: transform 0.25s, box-shadow 0.25s;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.18s; }
  &:nth-child(3) { animation-delay: 0.26s; }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 30px 48px -22px rgba(5, 16, 60, 0.85);
  }
  &:hover .entry__arrow { background: var(--klh-white); color: rgb(var(--tone)); }
  &:hover .entry__icon { transform: scale(1.06) rotate(-3deg); }

  &--education { --tone: 22, 56, 176; }
  &--course { --tone: 10, 109, 103; }
}

.entry__icon {
  display: grid;
  place-items: center;
  width: clamp(96px, 9.4vw, 144px);
  height: clamp(96px, 9.4vw, 144px);
  border-radius: 50%;
  background: var(--klh-white);
  box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.18), 0 16px 30px -14px rgba(0, 0, 0, 0.55);
  transition: transform 0.3s;

  img { width: 78%; height: 78%; object-fit: contain; }
}

.entry__title {
  font-size: clamp(20px, 1.9vw, 28px);
  font-weight: 800;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-wrap: balance;
}

.entry__arrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px 0 18px;
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  transition: background 0.2s, color 0.2s;
}

.quick {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.quick__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
  font-size: 14px;
  font-weight: 600;
  color: var(--klh-ink);
  transition: border-color 0.2s, color 0.2s, background 0.2s;

  &:hover { border-color: var(--klh-blue); background: var(--klh-blue); color: var(--klh-white); }
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

@keyframes klh-zoom {
  from { transform: scale(1.06); }
  to { transform: none; }
}

@media (max-width: 860px) {
  .home { height: auto; min-height: 100vh; grid-template-rows: auto auto auto; overflow: visible; }
  .home::before { position: fixed; }
  .hero { min-height: 220px; }
  .entries { grid-template-columns: 1fr; gap: 14px; }
  .entry { flex-direction: row; justify-content: flex-start; height: auto; text-align: left; }
  .entry__icon { width: 76px; height: 76px; flex-shrink: 0; }
  .entry__title { flex: 1; }
  .entry__arrow { padding: 0 12px; }
}

@media (max-width: 560px) {
  .hero__school { width: 160px; }
  .hero__zh { font-size: 40px; }
  .hero__sep { font-size: 28px; }
  .hero__ai { font-size: 22px; letter-spacing: 0.04em; }
  .hero__motto .rule { display: none; }
  .hero__motto { white-space: normal; }
  .entry { gap: 14px; padding: 16px; }
  .entry__icon { width: 60px; height: 60px; }
  .entry__arrow { font-size: 0; gap: 0; width: 36px; padding: 0; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .home::before, .hero, .entry { animation: none; }
  .entry, .entry__arrow, .entry__icon { transition: none; }
}
</style>

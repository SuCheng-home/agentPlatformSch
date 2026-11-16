<template>
  <div class="home">
    <section class="hero" aria-labelledby="klh-home-title">
      <img class="hero__art" :src="heroImg" alt="" aria-hidden="true" />

      <header class="hero__bar">
        <div class="hero__brand">
          <img :src="logo" alt="南京市科利华中学校徽" width="44" height="44" />
          <span class="hero__school">南京市科利华中学</span>
        </div>
        <user-menu />
      </header>

      <div class="hero__center">
        <h1 id="klh-home-title" class="hero__title">
          <span class="klh-brush hero__zh">科智汇</span>
          <span class="hero__ai">AI 矩阵平台</span>
        </h1>
        <p class="hero__motto">
          <span class="rule" aria-hidden="true" />
          汇聚教育智慧<span class="gap" aria-hidden="true" />赋能师生成长
        </p>
      </div>

      <p class="hero__greet">{{ today }} · {{ teacherName }}，{{ greeting }}</p>
    </section>

    <nav class="entries" aria-label="三大矩阵入口">
      <router-link v-for="m in matrices" :key="m.key" :to="m.to" :class="['entry', `entry--${m.key}`]">
        <span class="entry__icon"><img :src="m.icon" alt="" width="96" height="96" /></span>
        <span class="entry__text">
          <strong class="entry__title">{{ m.title }}</strong>
          <span class="entry__sub">{{ m.sub }}</span>
        </span>
        <span class="entry__arrow" aria-hidden="true">
          <klh-icon name="arrowRight" :size="20" :stroke="2.2" />
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
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1440px;
  min-height: 100vh;
  margin: 0 auto;
  padding: clamp(16px, 2vw, 28px);
}

/* 上：科智汇主视觉，深校徽蓝底，插画在右侧淡入 */
.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  gap: 28px;
  min-height: 380px;
  padding: clamp(20px, 2.4vw, 32px) clamp(24px, 3.6vw, 56px);
  border-radius: 24px;
  background: var(--klh-blue-deep);
  color: var(--klh-white);
  overflow: hidden;
  box-shadow: 0 24px 48px -28px rgba(13, 36, 120, 0.7);
  animation: klh-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(90deg, var(--klh-blue-deep) 0%, var(--klh-blue-deep) 34%, rgba(13, 36, 120, 0.7) 60%, rgba(13, 36, 120, 0.14) 100%);
  }
}

.hero__art {
  position: absolute;
  inset: 0 0 0 auto;
  z-index: -2;
  width: min(68%, 900px);
  height: 100%;
  object-fit: cover;
  object-position: right center;
}

.hero__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.hero__brand {
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--klh-white);
  }
}

.hero__school {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.hero__center {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(14px, 1.8vw, 24px);
}

.hero__title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 28px;
}

.hero__zh {
  font-size: clamp(76px, 9vw, 148px);
  line-height: 1;
  white-space: nowrap;
  letter-spacing: 0.04em;
  color: var(--klh-white);
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

.hero__ai {
  padding: 6px 16px;
  border-radius: 10px;
  background: var(--klh-orange);
  font-size: clamp(20px, 2.2vw, 30px);
  font-weight: 800;
  letter-spacing: 0.24em;
  line-height: 1.3;
  color: var(--klh-white);
}

.hero__motto {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: clamp(16px, 1.5vw, 20px);
  font-weight: 600;
  letter-spacing: 0.16em;
  white-space: nowrap;

  .rule { width: 40px; height: 2px; background: var(--klh-orange); }
  .gap { display: inline-block; width: 1em; }
}

.hero__greet {
  font-size: 14px;
  letter-spacing: 0.06em;
  opacity: 0.88;
}

/* 下：三大矩阵入口，实色卡片 + 白字 */
.entries {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.entry {
  --tone: var(--klh-orange);
  --tone-deep: #a94f05;
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: clamp(132px, 20vh, 188px);
  padding: 22px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--tone) 0%, var(--tone-deep) 100%);
  color: var(--klh-white);
  box-shadow: 0 18px 32px -22px var(--tone-deep);
  animation: klh-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  transition: transform 0.2s, box-shadow 0.2s;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.18s; }
  &:nth-child(3) { animation-delay: 0.26s; }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 40px -20px var(--tone-deep);
  }
  &:hover .entry__arrow { background: var(--klh-white); color: var(--tone-deep); }

  &--education { --tone: var(--klh-blue); --tone-deep: var(--klh-blue-deep); }
  &--course { --tone: var(--klh-teal); --tone-deep: #064843; }
}

.entry__icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--klh-white);
  box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.45);

  img { width: 64px; height: 64px; object-fit: contain; }
}

.entry__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.entry__title {
  font-size: clamp(19px, 1.6vw, 24px);
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-wrap: balance;
}

.entry__sub {
  font-size: 14px;
  letter-spacing: 0.1em;
  opacity: 0.92;
}

.entry__arrow {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 2px solid var(--klh-white);
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
}

.quick {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1.5px solid var(--klh-line-strong);
  background: var(--klh-white);
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

@media (max-width: 1080px) {
  .entries { grid-template-columns: 1fr; gap: 14px; }
  .entry { min-height: 108px; }
  .hero__art { width: 100%; opacity: 0.6; }
}

@media (max-width: 560px) {
  .hero__school { display: none; }
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

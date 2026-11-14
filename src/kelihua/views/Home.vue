<template>
  <div class="klh-page home">
    <header class="home__hello">
      <p class="home__date">{{ today }}</p>
      <h1 class="home__title">
        <span class="klh-brush">科智汇</span><span class="home__bar" aria-hidden="true">｜</span>AI 矩阵平台
      </h1>
      <p class="home__greet">{{ roleInfo.name }}老师，{{ greeting }}。今天想从哪里开始？</p>
    </header>

    <section class="matrices" aria-label="三大矩阵入口">
      <article v-for="m in matrices" :key="m.key" :class="['mx', `mx--${m.key}`]">
        <router-link :to="m.to" class="mx__head" :aria-label="`进入${m.title}`">
          <span class="mx__icon" aria-hidden="true">
            <klh-icon :name="m.icon" :size="34" :stroke="2" />
          </span>
          <span class="mx__arrow" aria-hidden="true">
            <klh-icon name="arrowRight" :size="18" :stroke="2.2" />
          </span>
          <h2 class="mx__title">{{ m.title }}</h2>
          <p class="mx__sub">{{ m.sub }}</p>
        </router-link>
        <ul class="mx__quick">
          <li v-for="q in m.quick" :key="q.label">
            <router-link :to="q.to" class="quick">
              <span class="quick__icon" aria-hidden="true"><klh-icon :name="q.icon" :size="20" :stroke="2" /></span>
              <span class="quick__label">{{ q.label }}</span>
            </router-link>
          </li>
        </ul>
      </article>
    </section>

    <section class="picks" aria-labelledby="klh-picks-title">
      <header class="picks__head">
        <h2 id="klh-picks-title">本周推荐课例</h2>
        <router-link to="/kelihua/subject" class="picks__more">
          全部课例<klh-icon name="chevronRight" :size="14" />
        </router-link>
      </header>
      <ul class="picks__list">
        <li v-for="p in picks" :key="p.lesson.id">
          <router-link :to="`/kelihua/lesson/${p.lesson.id}`" class="pick">
            <span class="pick__cover">
              <img :src="covers[p.lesson.cover]" alt="" width="320" height="200" loading="lazy" />
              <span class="pick__video"><klh-icon name="video" :size="12" />视频</span>
            </span>
            <span class="pick__body">
              <strong>{{ p.lesson.title }}</strong>
              <small>{{ subjectLabel(p.unit.subject) }} · {{ p.unit.grade }}{{ p.unit.volume }} · 执教：{{ p.lesson.teacher }}</small>
            </span>
          </router-link>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import coverBook from '../assets/cover-book.png';
import coverScience from '../assets/cover-science.png';
import state, { getters } from '../store';

export default {
  name: 'KlhHome',
  components: { KlhIcon },
  data() {
    return {
      covers: { book: coverBook, science: coverScience },
      matrices: [
        {
          key: 'subject',
          title: '学科 AI 矩阵',
          sub: '精准教学 · 智慧教研',
          icon: 'book',
          to: '/kelihua/subject',
          quick: [
            { label: '智能备课', icon: 'graduation', to: '/kelihua/subject?cat=ai' },
            { label: '精品课例', icon: 'award', to: '/kelihua/subject?featured=1' },
            { label: '学科资源', icon: 'layers', to: '/kelihua/subject' },
            { label: '提示词库', icon: 'prompt', to: '/kelihua/prompts' }
          ]
        },
        {
          key: 'education',
          title: '育人管理矩阵',
          sub: '五育融合 · 全面发展',
          icon: 'users',
          to: '/kelihua/education',
          quick: [
            { label: '德育活动', icon: 'star', to: '/kelihua/education?domain=moral' },
            { label: '心理关爱', icon: 'heart', to: '/kelihua/education?domain=mental' },
            { label: '班主任工作', icon: 'trophy', to: '/kelihua/education?domain=headteacher' },
            { label: '成长评价', icon: 'user', to: '/kelihua/education?domain=evaluate' }
          ]
        },
        {
          key: 'course',
          title: 'AI 赋能学程案例矩阵',
          sub: '创新实践 · 共建共享',
          icon: 'bulb',
          to: '/kelihua/course',
          quick: [
            { label: '优秀案例', icon: 'file', to: '/kelihua/course' },
            { label: '示范课堂', icon: 'video', to: '/kelihua/lesson/u1-l2' },
            { label: '共建中心', icon: 'upload', to: '/kelihua/build' },
            { label: '经验共享', icon: 'share', to: '/kelihua/prompts' }
          ]
        }
      ]
    };
  },
  computed: {
    roleInfo() {
      return getters.roleInfo();
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
    },
    picks() {
      const out = [];
      state.lessonUnits.forEach((unit) => {
        unit.lessons.forEach((lesson) => {
          if (lesson.featured && lesson.ai) out.push({ unit, lesson });
        });
      });
      const seen = new Set();
      return out.filter((p) => !seen.has(p.unit.subject) && seen.add(p.unit.subject)).slice(0, 4);
    }
  },
  methods: {
    subjectLabel: getters.subjectLabel
  }
};
</script>

<style lang="scss" scoped>
.home__hello {
  padding: 12px 4px 26px;
}

.home__date {
  font-size: 13px;
  color: var(--klh-faint);
  letter-spacing: 0.08em;
}

.home__title {
  margin-top: 6px;
  font-size: clamp(28px, 3.2vw, 38px);
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--klh-ink);
  line-height: 1.2;

  .klh-brush {
    font-size: 1.25em;
    color: var(--klh-blue);
    letter-spacing: 0.02em;
  }
}

.home__bar {
  margin: 0 6px;
  font-weight: 300;
  color: var(--klh-orange);
}

.home__greet {
  margin-top: 8px;
  font-size: 15px;
  color: var(--klh-muted);
}

/* —— 三大矩阵入口：本页的标志性元素 —— */
.matrices {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.mx {
  --mx: var(--klh-blue);
  --mx-tint: var(--klh-blue-tint);
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-radius: 26px;
  border: 1px solid var(--klh-white);
  background:
    radial-gradient(120% 80% at 100% 0%, var(--klh-white) 0%, transparent 55%),
    linear-gradient(160deg, var(--mx-tint) 0%, var(--klh-white) 90%);
  box-shadow: 0 18px 40px -26px var(--mx-shadow, rgba(28, 69, 196, 0.5));
  opacity: 0;
  transform: translateY(14px);
  animation: klh-mx-in 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  transition: transform 0.25s, box-shadow 0.25s;

  &:nth-child(2) { animation-delay: 0.08s; }
  &:nth-child(3) { animation-delay: 0.16s; }

  &--subject { --mx-tint: rgba(28, 69, 196, 0.13); }
  &--education { --mx: var(--klh-orange); --mx-tint: rgba(236, 122, 22, 0.16); --mx-shadow: rgba(236, 122, 22, 0.55); }
  &--course { --mx: var(--klh-teal); --mx-tint: rgba(15, 138, 131, 0.14); --mx-shadow: rgba(15, 138, 131, 0.5); }
}

@keyframes klh-mx-in {
  to { opacity: 1; transform: none; }
}

.mx__head {
  position: relative;
  display: block;
  padding: 22px 22px 24px;
  border-radius: 20px;
  color: var(--klh-ink);

  &:hover .mx__arrow { background: var(--mx); color: var(--klh-white); transform: translateX(2px); }
}

.mx__icon {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--klh-white);
  color: var(--mx);
  box-shadow: 0 6px 16px -10px var(--mx);
}

.mx__arrow {
  position: absolute;
  top: 22px;
  right: 22px;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--klh-white);
  color: var(--mx);
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.mx__title {
  margin-top: 18px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-wrap: balance;
}

.mx__sub {
  margin-top: 6px;
  font-size: 15px;
  color: var(--klh-muted);
  letter-spacing: 0.08em;
}

.mx__quick {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  margin-top: auto;
  padding: 16px 8px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  list-style: none;
}

.quick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 6px 2px;
  border-radius: 12px;
  color: var(--klh-ink);
  transition: background 0.18s;

  &:hover {
    background: var(--klh-white);
    .quick__icon { background: var(--mx); color: var(--klh-white); }
  }
}

.quick__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--klh-white);
  color: var(--mx);
  box-shadow: 0 2px 8px -4px rgba(23, 32, 58, 0.25);
  transition: background 0.18s, color 0.18s;
}

.quick__label {
  font-size: 13px;
  white-space: nowrap;
}

/* 推荐课例 */
.picks {
  margin-top: 40px;
}

.picks__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;

  h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 800;
    &::before { content: ''; width: 4px; height: 18px; border-radius: 2px; background: var(--klh-blue); }
  }
}

.picks__more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: var(--klh-muted);
  &:hover { color: var(--klh-blue); }
}

.picks__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  list-style: none;
}

.pick {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 16px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  overflow: hidden;
  color: var(--klh-ink);
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover { border-color: var(--klh-line-strong); box-shadow: var(--klh-shadow); }
  &:hover img { transform: scale(1.03); }
}

.pick__cover {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
}

.pick__video {
  position: absolute;
  left: 8px;
  bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(23, 32, 58, 0.62);
  color: var(--klh-white);
  font-size: 12px;
}

.pick__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px 14px;

  strong { font-size: 16px; }
  small { font-size: 12px; color: var(--klh-muted); }
}

@media (max-width: 1100px) {
  .matrices { grid-template-columns: 1fr; }
  .mx__quick { margin-top: 0; }
  .picks__list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .picks__list { grid-template-columns: 1fr; }
  .mx__title { font-size: 21px; }
}

@media (prefers-reduced-motion: reduce) {
  .mx { animation: none; opacity: 1; transform: none; }
}
</style>

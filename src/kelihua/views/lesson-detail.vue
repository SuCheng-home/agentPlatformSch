<template>
  <main class="klh-page dp">
    <div v-if="!found" class="klh-empty">
      未找到该课例，请从学程案例矩阵重新选择。
      <router-link to="/kelihua/course" class="klh-btn klh-btn--sm">返回学程案例矩阵</router-link>
    </div>
    <template v-else>
      <div class="dp-top">
        <nav class="dp-crumb" aria-label="当前位置">
          <router-link to="/kelihua/home">首页</router-link>
          <klh-icon name="chevronRight" :size="14" />
          <router-link to="/kelihua/course">AI 赋能学程案例矩阵</router-link>
          <klh-icon name="chevronRight" :size="14" />
          <span>{{ unit.title }}</span>
          <klh-icon name="chevronRight" :size="14" />
          <span aria-current="page">{{ lesson.title }}</span>
        </nav>
        <button type="button" class="dp-back" @click="back">
          <klh-icon name="chevronLeft" :size="16" />返回
        </button>
      </div>

      <header class="dp-head">
        <div class="dp-head__text">
          <div class="dp-tags">
            <span class="dp-tag dp-tag--blue">{{ subjectLabel(lesson.subject) }}</span>
            <span class="dp-tag">{{ lesson.grade }}</span>
            <span v-if="lesson.ai" class="dp-tag dp-tag--solid"><klh-icon name="sparkle" :size="12" :stroke="2.2" />AI 赋能</span>
            <span v-if="lesson.featured" class="dp-tag dp-tag--orange"><klh-icon name="award" :size="12" :stroke="2.2" />精品课</span>
          </div>
          <h1 class="dp-title">{{ lesson.title }}</h1>
          <p class="dp-sub">{{ subjectLabel(lesson.subject) }} · {{ lesson.grade }} · {{ unit.title }} · 第 {{ lessonNo }} 课时</p>
        </div>
        <div class="dp-cta">
          <a :href="url" :download="lesson.sourceName" class="dp-cta__btn">
            <klh-icon name="download" :size="18" :stroke="2.2" />下载学程设计单
          </a>
          <small>原件 · {{ lesson.format }}</small>
        </div>
      </header>

      <div class="dp-bar">
        <div class="dp-bar__meta">
          <span><klh-icon name="building" :size="16" />{{ lesson.school }}</span>
          <span><klh-icon name="user" :size="16" />授课教师：{{ lesson.teacher }}</span>
        </div>
        <div class="dp-bar__acts">
          <button type="button" :aria-pressed="String(starred)" @click="starred = !starred">
            <klh-icon name="star" :size="16" />{{ starred ? '已收藏' : '收藏' }}
          </button>
          <button type="button" :aria-pressed="String(liked)" @click="liked = !liked">
            <klh-icon name="thumbsUp" :size="16" />{{ liked ? '已点赞' : '点赞' }}
          </button>
        </div>
      </div>

      <section class="dp-stage" aria-label="课例展示">
        <div class="dp-preview dp-preview--paper">
          <article class="doc-sheet" tabindex="0" :aria-label="`${lesson.title} 原件文本`">
            <p class="doc-sheet__label">{{ lesson.sourceName }}</p>
            <pre class="doc-text">{{ lesson.sourceText }}</pre>
          </article>
        </div>
        <aside class="dp-side" aria-label="课时资源">
          <h2 class="dp-side__head">
            <span class="dp-side__badge"><klh-icon name="layers" :size="16" :stroke="2.2" /></span>
            课时资源
          </h2>
          <ul class="dp-list">
            <li class="dp-item is-active">
              <klh-icon class="dp-item__icon" name="file" :size="18" />
              <span class="dp-item__label">学程设计单（原件）</span>
              <a :href="url" :download="lesson.sourceName" class="dp-item__btn" aria-label="下载学程设计单">
                <klh-icon name="download" :size="15" />
              </a>
            </li>
            <li v-for="k in PENDING_KINDS" :key="k.label" class="dp-item" :style="{ '--c': k.color }">
              <klh-icon class="dp-item__icon" :name="k.icon" :size="18" />
              <span class="dp-item__label">{{ k.label }}</span>
              <span v-if="k.ai" class="dp-item__ai">AI</span>
              <span class="dp-item__state">待上传</span>
            </li>
            <li v-for="r in related" :key="r.id" class="dp-item" style="--c: var(--klh-blue)">
              <klh-icon class="dp-item__icon" :name="r.type === 'tool' ? 'tool' : 'bot'" :size="18" />
              <span class="dp-item__label">{{ r.name }}</span>
              <router-link :to="`/kelihua/resource/${r.id}`" class="dp-item__btn" :aria-label="`查看 ${r.name}`">
                <klh-icon name="arrowRight" :size="15" />
              </router-link>
            </li>
          </ul>
          <p class="dp-side__foot">左侧为原件文本，完整排版与图表请下载原件。课件、任务单等资源上传后将在此处展示。</p>
        </aside>
      </section>

      <div class="dp-lower">
        <div>
          <section class="dp-card">
            <h2 class="dp-card__title">课程简介</h2>
            <p class="dp-card__text">{{ lesson.goal }}</p>
          </section>
          <section v-if="unit.bigIdea || unit.task" class="dp-card">
            <h2 class="dp-card__title">所属大单元 · {{ unit.title }}</h2>
            <ul class="dp-points">
              <li v-if="unit.bigIdea">{{ unit.bigIdea }}</li>
              <li v-if="unit.task">{{ unit.task }}</li>
            </ul>
          </section>
        </div>
        <aside>
          <section class="dp-card">
            <h2 class="dp-card__title">授课教师</h2>
            <p class="dp-quote">{{ lesson.teacher }} 老师执教的{{ subjectLabel(lesson.subject) }}课例，收录于「{{ unit.title }}」单元。</p>
            <p class="dp-person">{{ lesson.teacher }} · {{ lesson.school }}</p>
          </section>
          <nav v-if="siblings.length > 1" class="dp-card" aria-label="同单元课时">
            <h2 class="dp-card__title">同单元课时</h2>
            <ul class="dp-links">
              <li v-for="(s, i) in siblings" :key="s.id">
                <router-link :to="`/kelihua/lesson/${s.id}`" :aria-current="s.id === lesson.id ? 'page' : null">
                  <span>{{ String(i + 1).padStart(2, '0') }} · {{ s.title }}</span>
                </router-link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </template>
  </main>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import { getters } from '../store';
import { assetUrl } from '../utils/resources';

const PENDING_KINDS = [
  { label: 'AI 课件', icon: 'monitor', color: '#d2650a', ai: true },
  { label: '课堂视频', icon: 'video', color: '#1638b0' },
  { label: '学习任务单', icon: 'clipboard', color: '#0a6d67' },
  { label: '课后练习', icon: 'notebook', color: '#0a6d67' }
];

export default {
  name: 'KlhLessonDetail',
  components: { KlhIcon },
  data() {
    return { PENDING_KINDS, starred: false, liked: false };
  },
  computed: {
    found() { return getters.findLesson(this.$route.params.id); },
    lesson() { return this.found.lesson; },
    unit() { return this.found.unit; },
    siblings() { return this.found.siblings; },
    lessonNo() { return this.siblings.findIndex((s) => s.id === this.lesson.id) + 1; },
    url() { return this.found ? assetUrl(this.lesson.asset) : ''; },
    related() {
      return this.found ? getters.published((resource) => this.lesson.resourceIds.includes(resource.id)) : [];
    }
  },
  methods: {
    subjectLabel: getters.subjectLabel,
    back() {
      if (window.history.length > 1) this.$router.back();
      else this.$router.push('/kelihua/course');
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/detail.scss';

.dp-preview--paper { padding: 28px 32px 0; }

.doc-sheet {
  height: 100%;
  max-height: 560px;
  min-height: 492px;
  overflow: auto;
  padding: 36px 44px;
  border-radius: 10px 10px 0 0;
  background: var(--klh-white);
  box-shadow: 0 10px 30px -16px rgba(14, 22, 48, 0.35);
}

.doc-sheet__label {
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--klh-line);
  font-size: 12px;
  color: var(--klh-faint);
}

.doc-text {
  margin: 0;
  font: inherit;
  font-size: 15px;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--klh-ink);
}
</style>

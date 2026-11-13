<template>
  <div class="rp" :class="'rp-' + variant">
    <!-- 课程视频 -->
    <div v-if="type === 'video'" class="rp-video">
      <video v-if="pkg.video.url" class="rp-video-player" :src="pkg.video.url" :poster="pkg.cover" controls />
      <template v-else>
        <img class="rp-video-poster" :src="pkg.cover" :alt="pkg.video.title">
        <div class="rp-video-overlay">
          <span class="rp-video-play" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path :d="icons.play" /></svg>
          </span>
          <span class="rp-video-pending">视频源待接入</span>
        </div>
        <div class="rp-video-foot">
          <span>{{ pkg.video.title }}</span>
          <span>{{ pkg.video.duration }}</span>
        </div>
      </template>
    </div>

    <!-- 课件：左侧缩略图 + 主画面 + 讲稿 -->
    <div v-else-if="type === 'slides'" class="rp-slides">
      <div class="rp-thumbs" role="tablist" aria-label="课件页">
        <button
          v-for="(slide, i) in pkg.slides"
          :key="i"
          type="button"
          role="tab"
          class="rp-thumb"
          :class="{ on: i === slideIndex }"
          :aria-selected="i === slideIndex"
          :aria-label="'第 ' + (i + 1) + ' 页：' + slide.title"
          @click="slideIndex = i"
        >
          <span class="rp-thumb-no">{{ i + 1 }}</span>
          <SlideView :slide="slide" :cover="pkg.cover" :teacher="pkg.teacher" :school="pkg.school" thumb />
        </button>
      </div>
      <div class="rp-slide-main">
        <SlideView :slide="currentSlide" :cover="pkg.cover" :teacher="pkg.teacher" :school="pkg.school" />
        <div class="rp-slide-bar">
          <button type="button" class="rp-btn" :disabled="slideIndex === 0" @click="slideIndex--">上一页</button>
          <span class="rp-slide-count">{{ slideIndex + 1 }} / {{ pkg.slides.length }}</span>
          <button type="button" class="rp-btn" :disabled="slideIndex === pkg.slides.length - 1" @click="slideIndex++">下一页</button>
          <button type="button" class="rp-btn ghost" :aria-pressed="showNote" @click="showNote = !showNote">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.edit" /></svg>
            讲稿
          </button>
        </div>
        <p v-if="showNote && currentSlide.note" class="rp-note">{{ currentSlide.note }}</p>
      </div>
    </div>

    <!-- 教学设计 -->
    <div v-else-if="type === 'design'" class="rp-doc">
      <section>
        <h4>教学目标</h4>
        <ul><li v-for="(item, i) in pkg.design.objectives" :key="i">{{ item }}</li></ul>
      </section>
      <div class="rp-doc-grid">
        <section>
          <h4>教学重点</h4>
          <ul><li v-for="(item, i) in pkg.design.keyPoints" :key="i">{{ item }}</li></ul>
        </section>
        <section>
          <h4>教学难点</h4>
          <ul><li v-for="(item, i) in pkg.design.difficulties" :key="i">{{ item }}</li></ul>
        </section>
      </div>
      <section>
        <h4>教学准备</h4>
        <ul><li v-for="(item, i) in pkg.design.preparation" :key="i">{{ item }}</li></ul>
      </section>
      <section>
        <h4>教学过程</h4>
        <ol class="rp-process">
          <li v-for="(step, i) in pkg.design.process" :key="i">
            <div class="rp-process-head">
              <b>{{ step.stage }}</b>
              <span>{{ step.minutes }} 分钟</span>
              <em>{{ step.resource }}</em>
            </div>
            <p><span class="rp-role">教师</span>{{ step.teacher }}</p>
            <p><span class="rp-role student">学生</span>{{ step.student }}</p>
          </li>
        </ol>
      </section>
      <section>
        <h4>教学反思</h4>
        <p>{{ pkg.design.reflection }}</p>
      </section>
    </div>

    <!-- 智能体 / AI 工具：来自平台，点击直接调起平台预览 -->
    <div v-else-if="type === 'agents' || type === 'tools'" class="rp-apps">
      <p class="rp-apps-tip">
        以下{{ type === 'agents' ? '智能体' : '工具' }}来自平台「智能体广场」，点击即可在课堂中直接打开使用。
      </p>
      <div class="rp-app-grid">
        <button v-for="item in appItems" :key="item.id" type="button" class="rp-app" @click="$emit('open-app', item)">
          <ResIcon :icon="type === 'agents' ? 'bot' : 'wand'" :tone="type === 'agents' ? 'violet' : 'indigo'" :size="22" :box="46" />
          <span class="rp-app-copy">
            <b>{{ item.name }}</b>
            <small>{{ item.usage }}</small>
          </span>
          <span class="rp-app-open">
            打开
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path :d="icons.chevronRight" /></svg>
          </span>
        </button>
      </div>
    </div>

    <!-- 学习任务单 -->
    <div v-else-if="type === 'taskSheet'" class="rp-doc">
      <h4 class="rp-sheet-title">{{ pkg.taskSheet.title }}</h4>
      <section v-for="(section, i) in pkg.taskSheet.sections" :key="i">
        <h4>{{ section.title }}</h4>
        <ul><li v-for="(item, j) in section.items" :key="j">{{ item }}</li></ul>
      </section>
    </div>

    <!-- 课后练习：可在课堂上逐题作答并揭晓 -->
    <div v-else-if="type === 'exercises'" class="rp-quiz">
      <div class="rp-quiz-head">
        <span>共 {{ pkg.exercises.length }} 题 · 已答 {{ answeredCount }} 题</span>
        <button type="button" class="rp-btn ghost" @click="revealAll = !revealAll">{{ revealAll ? '隐藏答案' : '公布全部答案' }}</button>
      </div>
      <ol class="rp-quiz-list">
        <li v-for="(item, i) in pkg.exercises" :key="i" class="rp-question">
          <p class="rp-stem"><b>{{ i + 1 }}.</b> {{ item.stem }}</p>
          <div class="rp-options">
            <button
              v-for="(option, j) in item.options"
              :key="j"
              type="button"
              class="rp-option"
              :class="optionClass(i, j, item.answer)"
              @click="choose(i, j)"
            >
              <span class="rp-option-letter">{{ letters[j] }}</span>{{ option }}
            </button>
          </div>
          <p v-if="isRevealed(i)" class="rp-analysis">
            <b>答案 {{ letters[item.answer] }}</b>　{{ item.analysis }}
          </p>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
import { ICONS } from '@/constants/icons';
import SlideView from './slide-view.vue';
import ResIcon from './res-icon.vue';

export default {
  name: 'ResourcePanel',
  components: { SlideView, ResIcon },
  props: {
    pkg: { type: Object, required: true },
    type: { type: String, required: true },
    /** page：工作台详情页；stage：上课大屏 */
    variant: { type: String, default: 'page' }
  },
  data() {
    return {
      icons: ICONS,
      letters: ['A', 'B', 'C', 'D', 'E', 'F'],
      slideIndex: 0,
      showNote: false,
      answers: {},
      revealAll: false
    };
  },
  computed: {
    currentSlide() {
      return this.pkg.slides[this.slideIndex] || this.pkg.slides[0];
    },
    appItems() {
      return this.type === 'agents' ? this.pkg.agents : this.pkg.tools;
    },
    answeredCount() {
      return Object.keys(this.answers).length;
    }
  },
  watch: {
    'pkg.id'() {
      this.slideIndex = 0;
      this.answers = {};
      this.revealAll = false;
    }
  },
  methods: {
    choose(questionIndex, optionIndex) {
      if (this.answers[questionIndex] !== undefined) return;
      this.$set(this.answers, questionIndex, optionIndex);
    },
    isRevealed(questionIndex) {
      return this.revealAll || this.answers[questionIndex] !== undefined;
    },
    optionClass(questionIndex, optionIndex, answer) {
      const chosen = this.answers[questionIndex];
      if (!this.isRevealed(questionIndex)) return '';
      if (optionIndex === answer) return 'correct';
      if (optionIndex === chosen) return 'wrong';
      return 'dim';
    }
  }
};
</script>

<style scoped>
.rp { color: var(--ink); font-size: 14px; line-height: 1.6; }
.rp-stage { font-size: 17px; }

.rp-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.rp-btn:disabled { opacity: .4; cursor: not-allowed; }
.rp-btn.ghost { background: var(--surface); color: var(--primary); border-color: #cddffb; }
.rp-btn.ghost[aria-pressed='true'] { background: var(--soft); }

/* 视频 */
.rp-video {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #0f1d4a;
  aspect-ratio: 16 / 9;
}
.rp-video-player,
.rp-video-poster { width: 100%; height: 100%; object-fit: cover; display: block; }
.rp-video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: rgba(15, 29, 74, .28);
}
.rp-video-play {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, .92);
  color: var(--primary);
  padding-left: 4px;
  box-sizing: border-box;
}
.rp-video-pending {
  font-size: 13px;
  color: #fff;
  background: rgba(15, 29, 74, .6);
  padding: 4px 12px;
  border-radius: 999px;
}
.rp-video-foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  padding: 28px 20px 14px;
  color: #fff;
  font-size: 15px;
  background: linear-gradient(transparent, rgba(10, 20, 50, .7));
}

/* 课件 */
.rp-slides { display: flex; gap: 16px; min-height: 0; }
.rp-thumbs {
  flex: none;
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 440px;
  overflow-y: auto;
  padding-right: 4px;
}
.rp-stage .rp-thumbs { width: 200px; max-height: calc(100vh - 220px); }
.rp-thumb {
  position: relative;
  border: 2px solid transparent;
  border-radius: 9px;
  padding: 0;
  background: none;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(19, 33, 61, .12);
}
.rp-thumb.on { border-color: var(--primary); }
.rp-thumb-no {
  position: absolute;
  left: 4px;
  top: 4px;
  z-index: 1;
  min-width: 18px;
  height: 18px;
  border-radius: 5px;
  font-size: 11px;
  line-height: 18px;
  color: #fff;
  background: rgba(15, 29, 74, .7);
}
.rp-slide-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.rp-slide-main > .slide { box-shadow: 0 6px 24px rgba(19, 33, 61, .12); }
.rp-stage .rp-slide-main > .slide { width: auto; max-width: 100%; height: calc(100vh - 270px); align-self: center; }
.rp-slide-bar { display: flex; align-items: center; justify-content: center; gap: 12px; }
.rp-slide-count { font-size: 13px; color: var(--muted); min-width: 56px; text-align: center; }
.rp-note {
  margin: 0;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--canvas);
  color: #53617a;
  font-size: 14px;
}

/* 文档：教学设计 / 任务单 */
.rp-doc { display: flex; flex-direction: column; gap: 18px; }
.rp-doc section { display: flex; flex-direction: column; gap: 6px; }
.rp-doc h4 { margin: 0; font-size: 15px; font-weight: 700; }
.rp-doc ul { margin: 0; padding-left: 20px; }
.rp-doc p { margin: 0; }
.rp-doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.rp-sheet-title { font-size: 17px !important; }
.rp-process { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.rp-process li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
}
.rp-process-head { display: flex; align-items: center; gap: 10px; }
.rp-process-head span { font-size: 12px; color: var(--muted); }
.rp-process-head em { margin-left: auto; font-style: normal; font-size: 12px; color: var(--primary); background: var(--soft); padding: 1px 8px; border-radius: 6px; }
.rp-role {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  margin-right: 8px;
}
.rp-role.student { color: #0e9f6e; }

/* 智能体 / 工具 */
.rp-apps { display: flex; flex-direction: column; gap: 14px; }
.rp-apps-tip { margin: 0; color: var(--muted); font-size: 13px; }
.rp-app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.rp-app {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.rp-app:hover { border-color: var(--primary); box-shadow: 0 6px 18px rgba(33, 104, 243, .12); }
.rp-app-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.rp-app-copy b { font-size: 15px; }
.rp-app-copy small { font-size: 13px; color: var(--muted); line-height: 1.5; }
.rp-app-open { flex: none; display: inline-flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 600; color: var(--primary); }

/* 练习 */
.rp-quiz { display: flex; flex-direction: column; gap: 14px; }
.rp-quiz-head { display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 13px; }
.rp-quiz-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.rp-question {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
}
.rp-stem { margin: 0; font-weight: 600; }
.rp-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.rp-option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--canvas);
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.rp-option:hover { border-color: #cddffb; }
.rp-option-letter {
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  background: var(--surface);
  border: 1px solid var(--line);
}
.rp-option.correct { border-color: #0e9f6e; background: #e3f7ee; color: #0b6b4b; }
.rp-option.correct .rp-option-letter { background: #0e9f6e; border-color: #0e9f6e; color: #fff; }
.rp-option.wrong { border-color: #e5484d; background: #ffecec; color: #b42328; }
.rp-option.wrong .rp-option-letter { background: #e5484d; border-color: #e5484d; color: #fff; }
.rp-option.dim { opacity: .6; }
.rp-analysis { margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--canvas); font-size: 13px; color: #53617a; }
.rp-analysis b { color: #0b6b4b; }

.rp-stage .rp-option { min-height: 52px; font-size: 17px; }
.rp-stage .rp-analysis { font-size: 15px; }

@media (max-width: 768px) {
  .rp-slides { flex-direction: column-reverse; }
  .rp-thumbs { width: auto; flex-direction: row; max-height: none; overflow-x: auto; }
  .rp-thumb { flex: none; width: 120px; }
  .rp-options,
  .rp-doc-grid { grid-template-columns: 1fr; }
}
</style>

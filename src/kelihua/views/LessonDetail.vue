<template>
  <div class="klh-page lesson-page">
    <div v-if="!found" class="klh-empty">
      <klh-icon name="inbox" :size="28" />
      <p>没有找到这节课，可能已下架或链接有误。</p>
      <router-link to="/kelihua/subject" class="klh-btn klh-btn--sm">返回学科矩阵</router-link>
    </div>

    <template v-else>
      <button type="button" class="back" @click="goBack">
        <klh-icon name="chevronLeft" :size="16" :stroke="2.2" />返回
      </button>

      <header class="lhead">
        <div class="lhead__main">
          <ul class="lhead__tags" aria-label="课例标签">
            <li class="tag tag--blue">科利华好课</li>
            <li v-if="lesson.ai" class="tag tag--ai">智能体赋能</li>
            <li v-if="lesson.featured" class="tag tag--orange">精品课</li>
            <li class="tag tag--plain">教学示例</li>
          </ul>
          <h1 class="lhead__title">{{ lesson.title }}</h1>
          <p class="lhead__crumb">{{ crumb }}</p>
          <p class="lhead__who">
            <span>授课教师：<strong>{{ lesson.teacher }}</strong></span>
            <span>所在学校：<strong>{{ lesson.school }}</strong></span>
          </p>
        </div>
        <div class="lhead__pack">
          <button type="button" class="pack-btn" @click="downloadAll">
            <klh-icon name="download" :size="20" :stroke="2.2" />一键收下整套备课包
          </button>
          <p>示例包 · 课件、教案、任务单、练习与配置</p>
        </div>
      </header>

      <div class="lstats">
        <ul class="lstats__info">
          <li><klh-icon name="building" :size="16" />科利华中学教师发展中心</li>
          <li><klh-icon name="eye" :size="16" />{{ formatCount(lesson.views) }}</li>
          <li class="stars" :aria-label="`评分 ${lesson.rating} 分，${lesson.ratingCount} 人评价`">
            <span aria-hidden="true">
              <klh-icon v-for="n in 5" :key="n" name="star" :size="16" :stroke="0" class="star" />
            </span>
            {{ lesson.rating }}分（{{ lesson.ratingCount }}个）
          </li>
        </ul>
        <ul class="lstats__acts">
          <li>
            <button type="button" :class="['act', { 'is-on': rated }]" :aria-pressed="String(rated)" @click="rate">
              <klh-icon name="star" :size="17" />{{ rated ? '已评分' : '评分' }}
            </button>
          </li>
          <li>
            <button type="button" :class="['act', { 'is-on': saved }]" :aria-pressed="String(saved)" @click="saved = !saved">
              <klh-icon name="heart" :size="17" />{{ saved ? '已收藏' : '收藏' }}
            </button>
          </li>
          <li>
            <button type="button" :class="['act', { 'is-on': liked }]" :aria-pressed="String(liked)" @click="liked = !liked">
              <klh-icon name="thumbsUp" :size="17" />{{ lesson.likes + (liked ? 1 : 0) }}
            </button>
          </li>
          <li>
            <button type="button" class="act" @click="suggest">
              <klh-icon name="message" :size="17" />建议
            </button>
          </li>
        </ul>
      </div>

      <section class="stage" aria-label="课时内容">
        <div class="stage__view">
          <div v-if="current.key === 'video'" class="video">
            <img :src="classroom" :alt="`《${lesson.title}》课堂实录`" width="1280" height="720" />
            <button type="button" class="video__play" aria-label="播放课例视频" @click="playVideo">
              <klh-icon name="play" :size="34" :stroke="0" />
            </button>
          </div>
          <div v-else class="doc">
            <span :class="['doc__icon', `doc__icon--${current.tone}`]" aria-hidden="true">
              <klh-icon :name="current.icon" :size="34" :stroke="1.8" />
            </span>
            <h2>{{ lesson.title }} · {{ current.label }}</h2>
            <p>{{ current.desc }}</p>
            <div class="doc__acts">
              <button v-if="current.key === 'agent'" type="button" class="klh-btn klh-btn--primary" @click="openAgent">
                <klh-icon name="bot" :size="16" />进入智能体对话
              </button>
              <button v-else type="button" class="klh-btn klh-btn--primary" @click="downloadOne(current)">
                <klh-icon name="download" :size="16" />下载{{ current.label }}
              </button>
            </div>
            <small>示例内容 · 正式资源待接入</small>
          </div>
        </div>

        <aside class="res" aria-labelledby="klh-res-title">
          <h2 id="klh-res-title" class="res__title">
            <span class="res__badge" aria-hidden="true"><klh-icon name="play" :size="16" :stroke="0" /></span>
            课时资源
          </h2>
          <ul class="res__list">
            <li v-for="r in resources" :key="r.key" :class="['ritem', { 'is-active': current.key === r.key }]">
              <button type="button" class="ritem__main" :aria-current="current.key === r.key ? 'true' : null" @click="activeKey = r.key">
                <klh-icon :name="r.icon" :size="22" :class="['ritem__icon', `ritem__icon--${r.tone}`]" />
                <span class="ritem__label">{{ r.label }}</span>
                <span v-if="r.ai" class="ritem__ai"><klh-icon name="sparkle" :size="12" :stroke="2.2" />AI</span>
              </button>
              <template v-if="r.key === 'video'">
                <klh-icon name="chart" :size="20" class="ritem__chart" />
                <span class="ritem__pending">待接入</span>
              </template>
              <template v-else>
                <button
                  type="button"
                  :class="['ritem__check', { 'is-on': picked.includes(r.key) }]"
                  role="checkbox"
                  :aria-checked="String(picked.includes(r.key))"
                  :aria-label="`选择${r.label}`"
                  @click="togglePick(r.key)"
                >
                  <klh-icon v-if="picked.includes(r.key)" name="check" :size="12" :stroke="3" />
                </button>
                <button type="button" class="ritem__dl" :aria-label="`下载${r.label}`" @click="downloadOne(r)">
                  <klh-icon name="download" :size="17" />
                </button>
              </template>
            </li>
          </ul>
          <footer class="res__foot">
            <p>可单独下载当前展示的示例内容，文档为可打印格式。</p>
            <button type="button" class="klh-btn klh-btn--sm" :disabled="!picked.length" @click="downloadPicked">
              <klh-icon name="download" :size="14" />下载所选{{ picked.length ? `（${picked.length}）` : '' }}
            </button>
          </footer>
        </aside>
      </section>

      <section class="more">
        <div class="more__intro klh-panel">
          <h2>本课目标</h2>
          <p>{{ lesson.goal }}</p>
        </div>
        <nav class="more__siblings klh-panel" :aria-label="`${unit.title}的其他课时`">
          <h2>同单元课时</h2>
          <ul>
            <li v-for="s in siblings" :key="s.id">
              <router-link :to="`/kelihua/lesson/${s.id}`" :class="{ 'is-current': s.id === lesson.id }" :aria-current="s.id === lesson.id ? 'page' : null">
                <span>{{ s.title }}</span>
                <klh-icon v-if="s.ai" name="sparkle" :size="14" :stroke="2.2" class="sib-ai" />
              </router-link>
            </li>
          </ul>
        </nav>
      </section>
    </template>
  </div>
</template>

<script>
import KlhIcon from '../components/KlhIcon.vue';
import classroom from '../assets/classroom.png';
import { actions, getters } from '../store';

export default {
  name: 'KlhLessonDetail',
  components: { KlhIcon },
  data() {
    return { classroom, activeKey: 'video', picked: [], saved: false, liked: false, rated: false };
  },
  computed: {
    found() {
      return getters.findLesson(this.$route.params.id);
    },
    lesson() {
      return this.found.lesson;
    },
    unit() {
      return this.found.unit;
    },
    siblings() {
      return this.found.siblings;
    },
    crumb() {
      const u = this.unit;
      return [getters.subjectLabel(u.subject), u.edition, `${u.grade}${u.volume}`, `${u.order} · ${u.title}`].join(' · ');
    },
    resources() {
      const l = this.lesson;
      const list = [
        { key: 'video', label: '视频课程', icon: 'play', tone: 'orange' },
        { key: 'ppt', label: '课件', icon: 'monitor', tone: 'orange', ai: l.ai, desc: `${l.ai ? '含 AI 互动环节的' : ''}授课课件，可直接在教室大屏打开使用。` },
        { key: 'design', label: '教学设计', icon: 'pen', tone: 'blue', desc: '包含教学目标、重难点、教学过程与板书设计的完整教案。' }
      ];
      if (l.agentName) {
        list.push({ key: 'agent', label: '智能体问答', icon: 'bot', tone: 'blue', desc: `本课配套智能体「${l.agentName}」，可用于课前预习、课堂互动与课后答疑。` });
      }
      list.push(
        { key: 'task', label: '学习任务单', icon: 'clipboard', tone: 'teal', desc: '学生课堂活动任务单，A4 可打印，含分组合作环节。' },
        { key: 'practice', label: '课后练习', icon: 'notebook', tone: 'teal', desc: '分层设计的课后练习，附参考答案与评分建议。' }
      );
      return list;
    },
    current() {
      return this.resources.find((r) => r.key === this.activeKey) || this.resources[0];
    }
  },
  watch: {
    '$route.params.id'() {
      this.activeKey = 'video';
      this.picked = [];
      this.saved = false;
      this.liked = false;
      this.rated = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  mounted() {
    if (this.found) document.title = `${this.lesson.title} · 科智汇｜AI矩阵平台`;
  },
  methods: {
    notify(message, type = 'info') {
      this.$message({ message, type, customClass: 'klh-popper' });
    },
    formatCount(n) {
      return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(n);
    },
    goBack() {
      if (window.history.length > 1) this.$router.back();
      else this.$router.push(this.found.source === 'course' ? '/kelihua/course' : '/kelihua/subject');
    },
    togglePick(key) {
      const i = this.picked.indexOf(key);
      if (i > -1) this.picked.splice(i, 1);
      else this.picked.push(key);
    },
    downloadOne(r) {
      this.notify(`「${r.label}」示例文件已开始下载（正式资源待接入）`, 'success');
    },
    downloadPicked() {
      const names = this.resources.filter((r) => this.picked.includes(r.key)).map((r) => r.label).join('、');
      this.notify(`已打包：${names}（示例）`, 'success');
    },
    downloadAll() {
      this.notify(`《${this.lesson.title}》整套备课包已加入下载（示例）`, 'success');
    },
    playVideo() {
      this.notify('课例视频待接入，正式上线后可在此播放');
    },
    openAgent() {
      const a = getters.findAgentByName(this.lesson.agentName);
      if (a) actions.openResource(a.id);
      else this.notify('该智能体暂未上架');
    },
    rate() {
      this.rated = true;
      this.notify('感谢评分！', 'success');
    },
    suggest() {
      this.notify('建议反馈入口待接入，可先在「共建中心」留言');
    }
  }
};
</script>

<style lang="scss" scoped>
.back {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 14px;
  padding: 4px 10px 4px 4px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--klh-muted);
  cursor: pointer;
  &:hover { background: var(--klh-ink-tint); color: var(--klh-ink); }
}

.lhead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.lhead__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
}

.tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;

  &--blue { background: var(--klh-blue-tint); color: var(--klh-blue); }
  &--ai { background: var(--klh-blue); color: var(--klh-white); }
  &--orange { background: var(--klh-orange-tint); color: #a54f06; }
  &--plain { background: var(--klh-ink-tint); color: var(--klh-muted); }
}

.lhead__title {
  margin-top: 10px;
  font-size: clamp(32px, 3.6vw, 44px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.lhead__crumb {
  margin-top: 8px;
  font-size: 16px;
  color: var(--klh-muted);
}

.lhead__who {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 40px;
  margin-top: 14px;
  font-size: 15px;
  color: var(--klh-muted);

  strong { color: var(--klh-ink); font-weight: 700; }
}

.lhead__pack {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;

  p { font-size: 12px; color: var(--klh-faint); }
}

.pack-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 54px;
  padding: 0 26px;
  border: 0;
  border-radius: 14px;
  background: var(--klh-blue);
  color: var(--klh-white);
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 26px -12px rgba(28, 69, 196, 0.7);
  transition: background 0.2s, transform 0.2s;

  &:hover { background: var(--klh-blue-deep); }
  &:active { transform: translateY(1px); }
}

.lstats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  margin: 20px 0 18px;
}

.lstats__info,
.lstats__acts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
  list-style: none;
}

.lstats__info li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--klh-muted);
}

.stars span { display: inline-flex; gap: 1px; }
.star { fill: #f5a524; color: #f5a524; }

.act {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font: inherit;
  font-size: 15px;
  color: var(--klh-muted);
  cursor: pointer;
  transition: color 0.18s, background 0.18s;

  &:hover { background: var(--klh-ink-tint); color: var(--klh-ink); }
  &.is-on { color: var(--klh-orange); }
}

/* —— 主体：左侧播放/预览，右侧课时资源 —— */
.stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  border-radius: 18px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  overflow: hidden;
  box-shadow: var(--klh-shadow);
}

.stage__view {
  min-width: 0;
  min-height: 420px;
  overflow: hidden;
  background: var(--klh-ink);
}

.video {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;

  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
}

.video__play {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  padding-left: 6px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  color: var(--klh-blue);
  transform: translate(-50%, -50%);
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(23, 32, 58, 0.35);
  transition: transform 0.2s;

  .klh-icon { fill: currentColor; }
  &:hover { transform: translate(-50%, -50%) scale(1.06); }
}

.doc {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  min-height: 420px;
  padding: 40px 24px;
  background: var(--klh-paper);
  text-align: center;

  h2 { font-size: 22px; font-weight: 800; }
  p { max-width: 420px; font-size: 15px; color: var(--klh-muted); line-height: 1.6; text-wrap: pretty; }
  small { font-size: 12px; color: var(--klh-faint); }
}

.doc__icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin-bottom: 4px;
  border-radius: 20px;
  background: var(--klh-white);
  box-shadow: var(--klh-shadow);

  &--orange { color: var(--klh-orange); }
  &--blue { color: var(--klh-blue); }
  &--teal { color: var(--klh-teal); }
}

.doc__acts { margin: 8px 0 4px; }

.res {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-left: 1px solid var(--klh-line);
  background: var(--klh-white);
}

.res__title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  font-size: 19px;
  font-weight: 800;
}

.res__badge {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding-left: 2px;
  border-radius: 7px;
  background: var(--klh-blue);
  color: var(--klh-white);
  .klh-icon { fill: currentColor; }
}

.res__list {
  flex: 1;
  list-style: none;
}

.ritem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px 6px 8px;
  transition: background 0.18s;

  &.is-active {
    background: var(--klh-blue-tint);
    .ritem__label { color: var(--klh-blue); font-weight: 700; }
  }
  &:not(.is-active):hover { background: var(--klh-ink-tint); }
}

.ritem__main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
  color: var(--klh-ink);
  cursor: pointer;
}

.ritem__icon {
  &--orange { color: var(--klh-orange); }
  &--blue { color: var(--klh-blue); }
  &--teal { color: var(--klh-teal); }
}

.ritem__label { font-size: 16px; }

.ritem__ai {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--klh-blue);
  color: var(--klh-white);
  font-size: 12px;
  font-weight: 700;
}

.ritem__chart { color: var(--klh-blue); }
.ritem__pending { font-size: 12px; color: var(--klh-faint); }

.ritem__check {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 50%;
  border: 1.5px solid var(--klh-line-strong);
  background: var(--klh-white);
  color: var(--klh-white);
  cursor: pointer;
  &.is-on { border-color: var(--klh-blue); background: var(--klh-blue); }
}

.ritem__dl {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--klh-line-strong);
  background: var(--klh-white);
  color: var(--klh-ink);
  cursor: pointer;
  &:hover { border-color: var(--klh-blue); color: var(--klh-blue); }
}

.res__foot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--klh-line);

  p { font-size: 12px; color: var(--klh-faint); }
}

.more {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  margin-top: 20px;

  h2 { font-size: 16px; font-weight: 800; margin-bottom: 8px; }
}

.more__intro {
  padding: 18px 22px;
  p { font-size: 15px; color: var(--klh-ink); line-height: 1.7; }
}

.more__siblings {
  padding: 18px 14px 12px;

  h2 { padding: 0 8px; }
  ul { list-style: none; }
  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    font-size: 14px;
    color: var(--klh-ink);
    &:hover { background: var(--klh-ink-tint); }
    &.is-current { background: var(--klh-blue-tint); color: var(--klh-blue); font-weight: 700; }
  }
}

.sib-ai { color: var(--klh-blue); }

@media (max-width: 1000px) {
  .lhead { flex-direction: column; }
  .lhead__pack { align-items: flex-start; }
  .stage, .more { grid-template-columns: 1fr; }
  .stage__view { min-height: 0; }
  .video { min-height: 0; aspect-ratio: 16 / 9; }
  .res { border-left: 0; border-top: 1px solid var(--klh-line); }
}
</style>

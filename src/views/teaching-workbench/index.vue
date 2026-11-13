<template>
  <div class="tw">
    <header class="tw-head">
      <div class="tw-head-copy">
        <h1>教学工作台</h1>
        <p>按教材课时找到课程包：课程视频、课件、教学设计、智能体问答、AI 工具与课后练习一站备齐，可一键打包下载后自由改编，也能直接带进课堂。</p>
      </div>
    </header>

    <!-- 筛选：学科 / 版本 / 年级 / 册次 -->
    <section class="tw-filter" aria-label="教材筛选">
      <div class="tw-frow">
        <span class="tw-flabel">学科</span>
        <div class="tw-chips">
          <button v-for="item in subjects" :key="item.code" type="button" class="tw-chip" :class="{ on: subject === item.code }" :aria-pressed="subject === item.code" @click="selectSubject(item.code)">{{ item.name }}</button>
        </div>
      </div>
      <template v-if="subjectBooks.length">
        <div class="tw-frow">
          <span class="tw-flabel">版本</span>
          <div class="tw-chips">
            <button v-for="item in editions" :key="item" type="button" class="tw-chip" :class="{ on: edition === item }" :aria-pressed="edition === item" @click="selectEdition(item)">{{ item }}</button>
          </div>
        </div>
        <div class="tw-frow">
          <span class="tw-flabel">年级</span>
          <div class="tw-chips">
            <button v-for="item in grades" :key="item" type="button" class="tw-chip" :class="{ on: grade === item }" :aria-pressed="grade === item" @click="selectGrade(item)">{{ item }}</button>
          </div>
        </div>
        <div class="tw-frow">
          <span class="tw-flabel">册次</span>
          <div class="tw-chips">
            <button v-for="item in volumes" :key="item" type="button" class="tw-chip" :class="{ on: volume === item }" :aria-pressed="volume === item" @click="selectVolume(item)">{{ item }}</button>
          </div>
        </div>
      </template>
    </section>

    <div v-if="!textbook" class="tw-empty card">
      <b>{{ subjectName }}的教材目录与课程包正在建设中</b>
      <span>可以先切换到「物理」体验完整的课程包流程。</span>
    </div>

    <div v-else class="tw-body">
      <ChapterTree class="tw-tree" :textbook="textbook" :subject-name="subjectName" :active-lesson-id="lessonId" @select="selectLesson" />

      <section class="tw-list card" aria-live="polite">
        <div class="tw-list-head">
          <div class="tw-tabs" role="tablist">
            <button v-for="tab in tabs" :key="tab.key" type="button" role="tab" class="tw-tab" :class="{ on: activeTab === tab.key }" :aria-selected="activeTab === tab.key" @click="activeTab = tab.key">{{ tab.label }}</button>
          </div>
          <label class="tw-search">
            <span class="sr-only">搜索课程包</span>
            <input v-model.trim="keyword" type="search" placeholder="输入关键词">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path :d="icons.search" /></svg>
          </label>
        </div>

        <p class="tw-crumb">
          <span>{{ currentChapterName }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path :d="icons.chevronRight" /></svg>
          <b>{{ currentLessonName }}</b>
          <em>共 {{ visiblePackages.length }} 个</em>
        </p>

        <div v-if="visiblePackages.length" class="tw-cards">
          <PackageCard
            v-for="pkg in visiblePackages"
            :key="pkg.id"
            :pkg="pkg"
            :badge="currentTab.badge"
            :downloading="downloadingId === pkg.id"
            @view="openPackage(pkg)"
            @teach="teach(pkg)"
            @download="downloadAll(pkg)"
          />
        </div>
        <div v-else class="tw-empty">
          <b>{{ keyword ? '没有匹配的课程包' : '该课时暂无课程包' }}</b>
          <span>可以在左侧选择其他课时，或前往智能体广场查找本课可用的智能体与工具。</span>
          <button type="button" class="tw-link" @click="$router.push({ name: 'agents' })">前往智能体广场</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ICONS } from '@/constants/icons';
import { SUBJECTS, LESSON_INDEX, textbooksOfSubject } from '@/data/teaching/curriculum';
import { PACKAGES, RESOURCE_TYPES, packagesOfLesson } from '@/data/teaching/packages';
import { downloadPackage } from '@/utils/teaching-export';
import ChapterTree from './components/chapter-tree.vue';
import PackageCard from './components/package-card.vue';

const TABS = [
  { key: 'package', label: '课程包', badge: '课程包' },
  { key: 'slides', label: '课件', badge: '课件' },
  { key: 'design', label: '教学设计', badge: '教学设计' }
];

function unique(list) {
  return list.filter((item, index) => list.indexOf(item) === index);
}

export default {
  name: 'TeachingWorkbench',
  components: { ChapterTree, PackageCard },
  data() {
    return {
      icons: ICONS,
      subjects: SUBJECTS,
      tabs: TABS,
      subject: 'physics',
      edition: '',
      grade: '',
      volume: '',
      lessonId: '',
      activeTab: 'package',
      keyword: '',
      downloadingId: ''
    };
  },
  computed: {
    subjectName() {
      const found = SUBJECTS.find((item) => item.code === this.subject);
      return found ? found.name : '';
    },
    subjectBooks() {
      return textbooksOfSubject(this.subject);
    },
    editions() {
      return unique(this.subjectBooks.map((book) => book.edition));
    },
    grades() {
      return unique(this.subjectBooks.filter((book) => book.edition === this.edition).map((book) => book.grade));
    },
    volumes() {
      return unique(this.subjectBooks.filter((book) => book.edition === this.edition && book.grade === this.grade).map((book) => book.volume));
    },
    textbook() {
      return this.subjectBooks.find((book) => book.edition === this.edition && book.grade === this.grade && book.volume === this.volume) || null;
    },
    currentTab() {
      return TABS.find((tab) => tab.key === this.activeTab) || TABS[0];
    },
    currentLessonName() {
      const entry = LESSON_INDEX[this.lessonId];
      return entry ? entry.lesson.name : '';
    },
    currentChapterName() {
      const entry = LESSON_INDEX[this.lessonId];
      return entry ? entry.chapter.name : '';
    },
    visiblePackages() {
      const keyword = this.keyword.toLowerCase();
      return packagesOfLesson(this.lessonId).filter((pkg) => !keyword || pkg.title.toLowerCase().indexOf(keyword) !== -1);
    }
  },
  watch: {
    // 同一路由下仅 query 变化时组件会被复用，需要手动同步外部带入的课时
    '$route.query.lesson'(id) {
      if (id && id !== this.lessonId) this.restoreFromQuery();
    }
  },
  created() {
    this.restoreFromQuery();
  },
  methods: {
    /** 从地址栏恢复所选课时，便于从课程包详情返回或分享链接 */
    restoreFromQuery() {
      const entry = LESSON_INDEX[this.$route.query.lesson];
      if (entry) {
        const book = entry.textbook;
        this.subject = book.subject;
        this.edition = book.edition;
        this.grade = book.grade;
        this.volume = book.volume;
        this.lessonId = entry.lesson.id;
        return;
      }
      if (this.$route.query.subject) {
        this.subject = this.$route.query.subject;
      }
      this.selectSubject(this.subject);
    },
    syncQuery() {
      const query = { subject: this.subject };
      if (this.lessonId) query.lesson = this.lessonId;
      if (this.$route.query.lesson === query.lesson && this.$route.query.subject === query.subject) return;
      this.$router.replace({ query }).catch(() => {});
    },
    selectSubject(code) {
      this.subject = code;
      this.edition = this.editions[0] || '';
      this.selectEdition(this.edition);
    },
    selectEdition(edition) {
      this.edition = edition;
      this.grade = this.grades[0] || '';
      this.selectGrade(this.grade);
    },
    selectGrade(grade) {
      this.grade = grade;
      this.volume = this.volumes[0] || '';
      this.selectVolume(this.volume);
    },
    selectVolume(volume) {
      this.volume = volume;
      this.selectLesson(this.defaultLessonId());
    },
    /** 默认选中教材内第一个有课程包的课时，否则选中第一个课时 */
    defaultLessonId() {
      if (!this.textbook) return '';
      const lessons = this.textbook.chapters.reduce((all, chapter) => all.concat(chapter.lessons), []);
      const withPackage = lessons.find((lesson) => PACKAGES.some((pkg) => pkg.lessonIds.indexOf(lesson.id) !== -1));
      return (withPackage || lessons[0] || {}).id || '';
    },
    selectLesson(lessonId) {
      this.lessonId = lessonId;
      this.syncQuery();
    },
    openPackage(pkg) {
      const res = this.activeTab === 'package' ? undefined : this.activeTab;
      this.$router.push({ name: 'teaching-package', params: { id: pkg.id }, query: { lesson: this.lessonId, res } });
    },
    teach(pkg) {
      this.$router.push({ path: '/desktop-app', query: { package: pkg.id } });
    },
    async downloadAll(pkg) {
      if (this.downloadingId) return;
      this.downloadingId = pkg.id;
      try {
        await downloadPackage(pkg, RESOURCE_TYPES.map((type) => type.key));
        this.$message.success('课程包已开始下载');
      } catch (error) {
        console.warn('[TeachingWorkbench] 打包失败：', error);
        this.$message.error('打包失败，请稍后重试');
      } finally {
        this.downloadingId = '';
      }
    }
  }
};
</script>

<style scoped>
.tw { display: flex; flex-direction: column; gap: 16px; }
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}
.tw-head h1 { margin: 0 0 4px; font-size: 22px; font-weight: 800; }
.tw-head p { margin: 0; max-width: 760px; color: var(--muted); font-size: 14px; line-height: 1.6; text-wrap: pretty; }

.tw-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
}
.tw-frow { display: flex; align-items: flex-start; gap: 14px; }
.tw-flabel { flex: none; width: 40px; line-height: 32px; font-size: 14px; color: var(--muted); }
.tw-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.tw-chip {
  height: 32px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: none;
  font: inherit;
  font-size: 14px;
  color: #53617a;
  cursor: pointer;
}
.tw-chip:hover { color: var(--primary); }
.tw-chip.on { background: var(--soft); color: var(--primary); font-weight: 600; }

.tw-body { display: flex; align-items: flex-start; gap: 16px; }
.tw-tree { flex: none; width: 260px; position: sticky; top: 0; max-height: calc(100vh - 56px); overflow-y: auto; }
.tw-list { flex: 1; min-width: 0; padding: 6px 24px 10px; }
.tw-cards { container-type: inline-size; }
.tw-list-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--line); }
.tw-tabs { display: flex; gap: 28px; }
.tw-tab {
  position: relative;
  height: 52px;
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  font-size: 16px;
  color: #53617a;
  cursor: pointer;
}
.tw-tab.on { color: var(--primary); font-weight: 700; }
.tw-tab.on::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -1px;
  width: 28px;
  height: 3px;
  border-radius: 2px;
  background: var(--primary);
  transform: translateX(-50%);
}
.tw-search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
}
.tw-search:focus-within { border-color: var(--primary); }
.tw-search input { width: 160px; border: 0; outline: none; font: inherit; font-size: 13px; background: none; color: var(--ink); }

.tw-crumb { display: flex; align-items: center; gap: 6px; margin: 14px 0 0; font-size: 13px; color: var(--muted); }
.tw-crumb b { color: var(--ink); font-weight: 600; }
.tw-crumb em { margin-left: 6px; font-style: normal; }
.tw-cards { display: flex; flex-direction: column; }

.tw-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 56px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}
.tw-empty b { color: var(--ink); font-size: 15px; }
.tw-link {
  margin-top: 6px;
  border: 0;
  background: none;
  font: inherit;
  font-size: 13px;
  color: var(--primary);
  cursor: pointer;
}
.tw-link:hover { text-decoration: underline; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 960px) {
  .tw-body { flex-direction: column; align-items: stretch; }
  .tw-tree { width: auto; position: static; max-height: none; }
}
</style>

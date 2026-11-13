<template>
  <aside class="tree">
    <div class="tree-book">
      <ResIcon icon="book" tone="blue" :size="22" :box="48" />
      <div class="tree-book-copy">
        <b>{{ subjectName }}</b>
        <small>{{ textbook.grade }} · {{ textbook.volume }} · {{ textbook.edition }}</small>
      </div>
    </div>
    <nav class="tree-body" aria-label="教材章节">
      <div v-for="chapter in textbook.chapters" :key="chapter.id" class="tree-chapter">
        <button
          type="button"
          class="tree-chapter-head"
          :aria-expanded="isOpen(chapter.id)"
          @click="toggle(chapter.id)"
        >
          <svg class="tree-caret" :class="{ open: isOpen(chapter.id) }" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l9 7-9 7z" /></svg>
          <span>{{ chapter.name }}</span>
        </button>
        <ul v-show="isOpen(chapter.id)" class="tree-lessons">
          <li v-for="lesson in chapter.lessons" :key="lesson.id">
            <button
              type="button"
              class="tree-lesson"
              :class="{ on: lesson.id === activeLessonId }"
              :aria-current="lesson.id === activeLessonId ? 'true' : null"
              @click="$emit('select', lesson.id)"
            >
              <span class="tree-lesson-name">{{ lesson.name }}</span>
              <em v-if="countOf(lesson.id)" class="tree-count">{{ countOf(lesson.id) }}</em>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script>
import ResIcon from '@/components/teaching/res-icon.vue';
import { packagesOfLesson } from '@/data/teaching/packages';

export default {
  name: 'ChapterTree',
  components: { ResIcon },
  props: {
    textbook: { type: Object, required: true },
    subjectName: { type: String, default: '' },
    activeLessonId: { type: String, default: '' }
  },
  data() {
    return { opened: {} };
  },
  watch: {
    // 切换教材或选中课时变化时，自动展开所在章节
    activeLessonId: { immediate: true, handler: 'openActiveChapter' },
    'textbook.id': 'openActiveChapter'
  },
  methods: {
    isOpen(id) {
      return !!this.opened[id];
    },
    toggle(id) {
      this.$set(this.opened, id, !this.opened[id]);
    },
    openActiveChapter() {
      const chapter = this.textbook.chapters.find((item) => item.lessons.some((lesson) => lesson.id === this.activeLessonId));
      if (chapter) this.$set(this.opened, chapter.id, true);
    },
    countOf(lessonId) {
      return packagesOfLesson(lessonId).length;
    }
  }
};
</script>

<style scoped>
.tree {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}
.tree-book {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: var(--soft);
  border-bottom: 1px solid var(--line);
}
.tree-book-copy { display: flex; flex-direction: column; line-height: 1.4; }
.tree-book-copy b { font-size: 16px; }
.tree-book-copy small { font-size: 12px; color: var(--muted); }
.tree-body { display: flex; flex-direction: column; padding: 6px 0 10px; }
.tree-chapter-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: 0;
  background: none;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}
.tree-chapter-head:hover { background: var(--canvas); }
.tree-caret { flex: none; color: #93a0b6; transition: transform .2s; }
.tree-caret.open { transform: rotate(90deg); }
.tree-lessons { list-style: none; margin: 0; padding: 0 10px 6px; display: flex; flex-direction: column; gap: 2px; }
.tree-lesson {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px 9px 28px;
  border: 0;
  border-radius: 8px;
  background: none;
  font: inherit;
  font-size: 13px;
  color: #53617a;
  text-align: left;
  cursor: pointer;
}
.tree-lesson:hover { background: var(--canvas); color: var(--ink); }
.tree-lesson.on { background: var(--soft); color: var(--primary); font-weight: 600; }
.tree-lesson-name { flex: 1; min-width: 0; }
.tree-count {
  flex: none;
  font-style: normal;
  font-size: 11px;
  min-width: 18px;
  text-align: center;
  padding: 0 6px;
  border-radius: 9px;
  color: var(--primary);
  background: #dce8ff;
}
</style>

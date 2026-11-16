<template>
  <main class="klh-page lesson-page">
    <router-link to="/kelihua/course" class="klh-btn klh-btn--sm">返回学程案例矩阵</router-link>
    <div v-if="!found" class="klh-empty">未找到该课例，请从学程案例矩阵重新选择。</div>
    <template v-else>
      <header class="lesson-head">
        <p class="lesson-eyebrow">真实课例 · {{ subjectLabel(lesson.subject) }} · {{ lesson.grade }}</p>
        <h1 class="lesson-title">{{ lesson.title }}</h1>
        <p class="lesson-meta">{{ lesson.school }} · 执教：{{ lesson.teacher }} · {{ unit.title }}</p>
        <p v-if="lesson.metadataNote" class="lesson-notice">{{ lesson.metadataNote }}</p>
      </header>
      <div class="lesson-layout">
        <section class="document-panel klh-panel">
          <header class="document-header">
            <div>
              <h2 class="section-title">原始课例 · {{ lesson.format }}</h2>
              <p class="lesson-meta">{{ lesson.sourceName }}</p>
            </div>
            <a :href="url" :download="lesson.sourceName" class="klh-btn klh-btn--primary">下载原文件</a>
          </header>
          <div class="document-text">
            <h2 class="section-title">课例内容</h2>
            <p class="lesson-meta">以下为原文件文本提取，图表及完整排版请查看原文件。</p>
            <pre class="source-text">{{ lesson.sourceText }}</pre>
          </div>
        </section>
        <aside class="lesson-aside">
          <section class="klh-panel lesson-resources">
            <h2 class="section-title">资源完成状态</h2>
            <p class="lesson-meta">原始课例：已导入，可下载</p>
            <p class="lesson-meta">课堂视频、独立课件：未提供</p>
            <p class="lesson-meta">浏览、点赞与评分统计：未接入</p>
          </section>
          <section class="klh-panel lesson-resources">
            <h2 class="section-title">本课关联智能体与工具</h2>
            <button v-for="resource in related" :key="resource.id" type="button" :class="['resource-link', `resource-link--${resource.type}`]" @click="openResource(resource.id)">{{ resource.name }}</button>
            <p v-if="!related.length" class="lesson-meta">本课尚未提供独立应用资料。</p>
          </section>
          <nav class="klh-panel lesson-resources" aria-label="同主题课例">
            <h2 class="section-title">同主题课例</h2>
            <router-link v-for="sibling in siblings" :key="sibling.id" :to="`/kelihua/lesson/${sibling.id}`" class="sibling-link" :aria-current="sibling.id === lesson.id ? 'page' : null">{{ sibling.title }} · {{ sibling.teacher }}</router-link>
          </nav>
        </aside>
      </div>
    </template>
  </main>
</template>

<script>
import { actions, getters } from '../store';
import { assetUrl } from '../utils/resources';

export default {
  name: 'KlhLessonDetail',
  computed: {
    found() { return getters.findLesson(this.$route.params.id); },
    lesson() { return this.found.lesson; },
    unit() { return this.found.unit; },
    siblings() { return this.found.siblings; },
    url() { return this.found ? assetUrl(this.lesson.asset) : ''; },
    related() {
      return this.found ? getters.published((resource) => this.lesson.resourceIds.includes(resource.id)) : [];
    }
  },
  methods: {
    subjectLabel: getters.subjectLabel,
    openResource: actions.openResource
  }
};
</script>

<style lang="scss" scoped>
.lesson-head { padding: 28px 0; }
.lesson-eyebrow { color: var(--klh-blue); font-size: 13px; font-weight: 700; }
.lesson-title { margin-top: 10px; font-size: 30px; line-height: 1.4; }
.lesson-meta { margin-top: 9px; font-size: 13px; line-height: 1.7; color: var(--klh-muted); overflow-wrap: anywhere; }
.lesson-notice { margin-top: 12px; color: #a35411; font-size: 13px; }
.lesson-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 24px; align-items: start; }
.document-panel { overflow: hidden; }
.document-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 24px; border-bottom: 1px solid var(--klh-line); }
.document-header .klh-btn { flex-shrink: 0; }
.section-title { font-size: 17px; }
.document-text { padding: 24px; }
.source-text { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 15px; line-height: 1.9; margin: 20px 0 0; }
.lesson-aside { display: flex; flex-direction: column; gap: 16px; }
.lesson-resources { padding: 20px; }
.sibling-link { display: block; margin-top: 12px; color: var(--klh-muted); font-size: 14px; }
.sibling-link[aria-current="page"] { color: var(--klh-blue); font-weight: 700; }
.resource-link { display: block; margin-top: 14px; padding: 10px; width: 100%; border: 1px solid var(--klh-blue); background: var(--klh-white); border-radius: 8px; color: var(--klh-blue); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.resource-link--tool { border-color: var(--klh-orange); color: #a35411; }
@media (max-width: 800px) {
  .lesson-layout { grid-template-columns: 1fr; }
  .document-header { flex-direction: column; align-items: flex-start; }
  .lesson-title { font-size: 24px; }
}
</style>

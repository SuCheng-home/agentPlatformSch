<template>
  <div v-if="pkg" class="pd">
    <div class="pd-top">
      <nav class="pd-crumb" aria-label="面包屑">
        <button type="button" @click="backToList">教学工作台</button>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path :d="icons.chevronRight" /></svg>
        <span>{{ chapterName }}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path :d="icons.chevronRight" /></svg>
        <b aria-current="page">{{ pkg.title }}</b>
      </nav>
      <button type="button" class="pd-back" @click="backToList">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.arrowLeft" /></svg>
        返回列表
      </button>
    </div>

    <header class="pd-head">
      <div class="pd-head-copy">
        <div class="pd-tags">
          <span v-for="(tag, i) in pkg.tags" :key="tag" class="pd-tag" :class="'t' + i">{{ tag }}</span>
        </div>
        <h1 class="pd-title">{{ pkg.title }}</h1>
        <p class="pd-sub">{{ pkg.textbookLabel }}</p>
        <p class="pd-people">授课教师：<b>{{ pkg.teacher }}</b><span>所在学校：<b>{{ pkg.school }}</b></span></p>
        <p class="pd-stats">
          <span>{{ pkg.org }}</span>
          <span class="pd-stat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path :d="icons.eye" /></svg>
            {{ formatCount(pkg.views) }}
          </span>
          <span class="pd-rating">
            <svg v-for="n in 5" :key="n" width="15" height="15" viewBox="0 0 24 24" :fill="n <= Math.round(pkg.rating) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path :d="icons.star" /></svg>
            <b>{{ pkg.rating }} 分（{{ pkg.ratingCount }} 个）</b>
          </span>
        </p>
      </div>
      <div class="pd-cta">
        <button type="button" class="pd-cta-main" :disabled="packing || !selectedKeys.length" @click="packSelected">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.download" /></svg>
          {{ packing ? '正在打包…' : packLabel }}
        </button>
        <button type="button" class="pd-cta-sub" @click="teach">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.monitor" /></svg>
          带着课程包去上课
        </button>
        <small>ZIP 包含可编辑的课件、教案、任务单、练习与智能体清单</small>
      </div>
    </header>

    <section class="pd-main">
      <div class="pd-stage">
        <div class="pd-stage-head">
          <ResIcon :icon="activeType.icon" :tone="activeType.tone" />
          <h2>{{ activeType.label }}</h2>
        </div>
        <ResourcePanel :pkg="pkg" :type="activeKey" @open-app="openApp" />
      </div>

      <aside class="pd-res" aria-label="课时资源">
        <div class="pd-res-head">
          <h2>课时资源</h2>
          <button type="button" class="pd-res-all" @click="toggleAll">{{ allSelected ? '取消全选' : '全选' }}</button>
        </div>
        <ul class="pd-res-list">
          <li v-for="type in resourceTypes" :key="type.key" class="pd-res-row" :class="{ on: activeKey === type.key }">
            <button type="button" class="pd-res-main" :aria-current="activeKey === type.key ? 'true' : null" @click="activeKey = type.key">
              <ResIcon :icon="type.icon" :tone="type.tone" :size="17" :box="32" />
              <span class="pd-res-label">{{ type.label }}</span>
              <em class="pd-res-meta">{{ resourceMeta(type.key) }}</em>
            </button>
            <label class="pd-check">
              <input v-model="selectedKeys" type="checkbox" :value="type.key">
              <span class="sr-only">打包时包含{{ type.label }}</span>
            </label>
            <button type="button" class="pd-dl" :title="'下载' + type.label" :aria-label="'下载' + type.label" @click="downloadOne(type.key)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.download" /></svg>
            </button>
          </li>
        </ul>
        <p class="pd-res-foot">勾选资源后可一键打包。文档导出为可用 Word / WPS 直接打开改编的 HTML，智能体与工具导出为平台链接清单；课程视频接入后提供下载地址。</p>
      </aside>
    </section>

    <section class="pd-summary">
      <h2>课程包简介</h2>
      <p>{{ pkg.summary }}</p>
    </section>

    <AppPreview ref="preview" />
  </div>
  <div v-else class="pd-missing">
    <b>未找到该课程包</b>
    <button type="button" @click="backToList">返回教学工作台</button>
  </div>
</template>

<script>
import { ICONS } from '@/constants/icons';
import { LESSON_INDEX } from '@/data/teaching/curriculum';
import { RESOURCE_TYPES, getPackage } from '@/data/teaching/packages';
import { downloadPackage, downloadResource } from '@/utils/teaching-export';
import ResourcePanel from '@/components/teaching/resource-panel.vue';
import ResIcon from '@/components/teaching/res-icon.vue';
import AppPreview from '@/components/app-preview.vue';

export default {
  name: 'TeachingPackageDetail',
  components: { ResourcePanel, ResIcon, AppPreview },
  data() {
    const keys = RESOURCE_TYPES.map((type) => type.key);
    const res = this.$route.query.res;
    return {
      icons: ICONS,
      resourceTypes: RESOURCE_TYPES,
      activeKey: keys.indexOf(res) !== -1 ? res : 'video',
      selectedKeys: keys.slice(),
      packing: false
    };
  },
  computed: {
    pkg() {
      return getPackage(this.$route.params.id);
    },
    lessonEntry() {
      const fromQuery = LESSON_INDEX[this.$route.query.lesson];
      return fromQuery || (this.pkg && LESSON_INDEX[this.pkg.lessonIds[0]]) || null;
    },
    chapterName() {
      return this.lessonEntry ? this.lessonEntry.chapter.name : '';
    },
    activeType() {
      return RESOURCE_TYPES.find((type) => type.key === this.activeKey) || RESOURCE_TYPES[0];
    },
    allSelected() {
      return this.selectedKeys.length === RESOURCE_TYPES.length;
    },
    packLabel() {
      if (this.allSelected) return '一键打包整套课程包';
      return this.selectedKeys.length ? `打包所选 ${this.selectedKeys.length} 项资源` : '请勾选要打包的资源';
    }
  },
  watch: {
    '$route.query.res'(res) {
      if (RESOURCE_TYPES.some((type) => type.key === res)) this.activeKey = res;
    }
  },
  methods: {
    formatCount(value) {
      return value >= 10000 ? `${(value / 10000).toFixed(1)}万` : String(value);
    },
    resourceMeta(key) {
      const pkg = this.pkg;
      switch (key) {
        case 'video': return pkg.video.url ? pkg.video.duration : '待接入';
        case 'slides': return `${pkg.slides.length} 页`;
        case 'agents': return `${pkg.agents.length} 个`;
        case 'tools': return `${pkg.tools.length} 个`;
        case 'exercises': return `${pkg.exercises.length} 题`;
        default: return '';
      }
    },
    toggleAll() {
      this.selectedKeys = this.allSelected ? [] : RESOURCE_TYPES.map((type) => type.key);
    },
    async packSelected() {
      if (this.packing || !this.selectedKeys.length) return;
      this.packing = true;
      try {
        const ordered = RESOURCE_TYPES.map((type) => type.key).filter((key) => this.selectedKeys.indexOf(key) !== -1);
        await downloadPackage(this.pkg, ordered);
        this.$message.success('课程包已开始下载');
      } catch (error) {
        console.warn('[TeachingPackageDetail] 打包失败：', error);
        this.$message.error('打包失败，请稍后重试');
      } finally {
        this.packing = false;
      }
    },
    downloadOne(key) {
      downloadResource(this.pkg, key);
    },
    openApp(item) {
      this.$refs.preview.open({ id: item.id, name: item.name });
    },
    teach() {
      this.$router.push({ path: '/desktop-app', query: { package: this.pkg.id } });
    },
    backToList() {
      const lesson = this.lessonEntry ? this.lessonEntry.lesson.id : undefined;
      this.$router.push({ name: 'teaching', query: { lesson } });
    }
  }
};
</script>

<style scoped>
.pd { display: flex; flex-direction: column; gap: 20px; }
.pd-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.pd-crumb { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--muted); min-width: 0; }
.pd-crumb button { border: 0; background: none; padding: 0; font: inherit; color: var(--muted); cursor: pointer; }
.pd-crumb button:hover { color: var(--primary); }
.pd-crumb b { color: var(--ink); font-weight: 600; }
.pd-back {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  font: inherit;
  font-size: 13px;
  color: var(--ink);
  cursor: pointer;
}
.pd-back:hover { border-color: var(--primary); color: var(--primary); }

.pd-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.pd-head-copy { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.pd-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.pd-tag { font-size: 13px; padding: 2px 10px; border-radius: 6px; color: #53617a; background: var(--canvas); }
.pd-tag.t0 { color: var(--primary); background: var(--soft); }
.pd-tag.t1 { color: #7c3aed; background: #f1eaff; }
.pd-title { margin: 4px 0 0; font-size: 32px; font-weight: 800; line-height: 1.25; text-wrap: balance; }
.pd-sub { margin: 0; font-size: 15px; color: #53617a; }
.pd-people { margin: 0; font-size: 14px; color: var(--muted); }
.pd-people b { color: var(--ink); }
.pd-people span { margin-left: 28px; }
.pd-stats { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 22px; font-size: 14px; color: var(--muted); }
.pd-stat { display: inline-flex; align-items: center; gap: 4px; }
.pd-rating { display: inline-flex; align-items: center; gap: 1px; color: #f5a623; }
.pd-rating b { margin-left: 6px; color: var(--muted); font-weight: 400; }

.pd-cta { flex: none; display: flex; flex-direction: column; align-items: stretch; gap: 10px; width: 300px; }
.pd-cta-main,
.pd-cta-sub {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.pd-cta-main {
  height: 54px;
  border: 0;
  font-size: 17px;
  color: #fff;
  background: var(--primary);
  box-shadow: 0 10px 24px rgba(33, 104, 243, .28);
}
.pd-cta-main:hover { background: var(--primary-dark); }
.pd-cta-main:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
.pd-cta-sub {
  height: 44px;
  border: 1px solid #cddffb;
  font-size: 15px;
  color: var(--primary);
  background: var(--surface);
}
.pd-cta-sub:hover { background: var(--soft); }
.pd-cta small { font-size: 12px; color: var(--muted); text-align: center; }

.pd-main {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  background: var(--surface);
}
.pd-stage { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; padding: 20px 24px 24px; background: var(--canvas); }
.pd-stage-head { display: flex; align-items: center; gap: 10px; }
.pd-stage-head h2 { margin: 0; font-size: 17px; font-weight: 700; }

.pd-res { flex: none; width: 340px; display: flex; flex-direction: column; border-left: 1px solid var(--line); }
.pd-res-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 10px; }
.pd-res-head h2 { margin: 0; font-size: 18px; font-weight: 800; }
.pd-res-all { border: 0; background: none; font: inherit; font-size: 13px; color: var(--primary); cursor: pointer; }
.pd-res-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.pd-res-row { display: flex; align-items: center; gap: 10px; padding: 0 16px 0 0; }
.pd-res-row.on { background: var(--soft); }
.pd-res-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0 14px 20px;
  border: 0;
  background: none;
  font: inherit;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}
.pd-res-row.on .pd-res-label { color: var(--primary); font-weight: 700; }
.pd-res-label { flex: 1; font-size: 15px; }
.pd-res-meta { font-style: normal; font-size: 12px; color: var(--muted); }
.pd-check { display: inline-flex; cursor: pointer; }
.pd-check input { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }
.pd-dl {
  flex: none;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface);
  color: #53617a;
  cursor: pointer;
}
.pd-dl:hover { border-color: var(--primary); color: var(--primary); }
.pd-res-foot { margin: auto 0 0; padding: 16px 20px; border-top: 1px solid var(--line); font-size: 12px; line-height: 1.7; color: var(--muted); }

.pd-summary { display: flex; flex-direction: column; gap: 6px; }
.pd-summary h2 { margin: 0; font-size: 16px; font-weight: 700; }
.pd-summary p { margin: 0; max-width: 860px; font-size: 14px; line-height: 1.7; color: #53617a; }

.pd-missing { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 80px 0; color: var(--muted); }
.pd-missing button { border: 0; background: none; font: inherit; color: var(--primary); cursor: pointer; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 1180px) {
  .pd-head { flex-direction: column; }
  .pd-cta { width: 100%; flex-direction: row; flex-wrap: wrap; }
  .pd-cta-main,
  .pd-cta-sub { flex: 1 1 240px; height: 48px; }
  .pd-cta small { width: 100%; text-align: left; }
  .pd-main { flex-direction: column; }
  .pd-res { width: auto; border-left: 0; border-top: 1px solid var(--line); }
}
</style>

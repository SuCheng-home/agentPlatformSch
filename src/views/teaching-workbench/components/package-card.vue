<template>
  <article class="pcard">
    <button type="button" class="pcard-cover" :aria-label="'查看 ' + pkg.title" @click="$emit('view')">
      <img :src="pkg.cover" :alt="pkg.title" loading="lazy">
      <span class="pcard-duration">{{ pkg.duration }}</span>
    </button>
    <div class="pcard-body">
      <div class="pcard-title-row">
        <span class="pcard-badge">{{ badge }}</span>
        <h3 class="pcard-title">
          <button type="button" @click="$emit('view')">{{ pkg.title }}</button>
        </h3>
      </div>
      <p class="pcard-meta">{{ pkg.teacher }} · {{ pkg.school }}</p>
      <div class="pcard-stats">
        <span>{{ pkg.updatedAt }}</span>
        <span class="pcard-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path :d="icons.eye" /></svg>
          {{ formatCount(pkg.views) }}
        </span>
        <span class="pcard-stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path :d="icons.thumbUp" /></svg>
          {{ pkg.likes }}
        </span>
        <span class="pcard-rating" :aria-label="'评分 ' + pkg.rating + ' 分'">
          <svg v-for="n in 5" :key="n" width="14" height="14" viewBox="0 0 24 24" :fill="n <= Math.round(pkg.rating) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path :d="icons.star" /></svg>
          <b>{{ pkg.rating }}</b>
        </span>
      </div>
      <div class="pcard-res" aria-label="包含资源">
        <span v-for="type in resourceTypes" :key="type.key" class="pcard-res-chip">{{ type.short }}</span>
      </div>
    </div>
    <div class="pcard-actions">
      <button type="button" class="pcard-btn primary" @click="$emit('teach')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.monitor" /></svg>
        去上课
      </button>
      <button type="button" class="pcard-btn" :disabled="downloading" @click="$emit('download')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.download" /></svg>
        {{ downloading ? '打包中…' : '一键打包' }}
      </button>
    </div>
  </article>
</template>

<script>
import { ICONS } from '@/constants/icons';
import { RESOURCE_TYPES } from '@/data/teaching/packages';

export default {
  name: 'PackageCard',
  props: {
    pkg: { type: Object, required: true },
    badge: { type: String, default: '课程包' },
    downloading: { type: Boolean, default: false }
  },
  data() {
    return { icons: ICONS, resourceTypes: RESOURCE_TYPES };
  },
  methods: {
    formatCount(value) {
      return value >= 10000 ? `${(value / 10000).toFixed(1)}万` : String(value);
    }
  }
};
</script>

<style scoped>
.pcard {
  display: flex;
  align-items: stretch;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}
.pcard:last-child { border-bottom: 0; }
.pcard-cover {
  position: relative;
  flex: none;
  width: 240px;
  aspect-ratio: 16 / 10;
  border: 0;
  padding: 0;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: var(--canvas);
}
.pcard-cover img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
.pcard-cover:hover img { transform: scale(1.03); }
.pcard-duration {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 11px;
  color: #fff;
  background: rgba(15, 29, 74, .65);
  padding: 1px 8px;
  border-radius: 6px;
}
.pcard-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.pcard-title-row { display: flex; align-items: center; gap: 10px; }
.pcard-badge {
  flex: none;
  font-size: 12px;
  color: var(--primary);
  border: 1px solid #a9c6fb;
  background: var(--soft);
  padding: 0 7px;
  border-radius: 5px;
  line-height: 20px;
}
.pcard-title { margin: 0; font-size: 18px; font-weight: 700; min-width: 0; }
.pcard-title button {
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.pcard-title button:hover { color: var(--primary); }
.pcard-meta { margin: 0; font-size: 13px; color: var(--muted); }
.pcard-stats { display: flex; flex-wrap: wrap; align-items: center; gap: 18px; font-size: 13px; color: var(--muted); }
.pcard-stat { display: inline-flex; align-items: center; gap: 4px; }
.pcard-rating { display: inline-flex; align-items: center; gap: 1px; color: #f5a623; }
.pcard-rating b { margin-left: 6px; color: var(--ink); font-weight: 600; }
.pcard-res { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; }
.pcard-res-chip {
  font-size: 12px;
  color: #53617a;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 0 8px;
  line-height: 22px;
}
.pcard-actions { flex: none; display: flex; flex-direction: column; justify-content: center; gap: 10px; }
.pcard-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 118px;
  height: 38px;
  border-radius: 9px;
  border: 1px solid #cddffb;
  background: var(--surface);
  color: var(--primary);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.pcard-btn:hover { background: var(--soft); }
.pcard-btn:disabled { opacity: .6; cursor: wait; }
.pcard-btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.pcard-btn.primary:hover { background: var(--primary-dark); }

/* 按列表栏宽度（父级 container）自适应，而不是按视口 */
@container (max-width: 640px) {
  .pcard { flex-wrap: wrap; gap: 14px 16px; }
  .pcard-cover { width: 168px; }
  .pcard-actions { flex-direction: row; width: 100%; }
  .pcard-btn { flex: 1; width: auto; }
}
</style>

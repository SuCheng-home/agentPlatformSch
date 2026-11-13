<template>
  <div class="cls">
    <!-- 上课大屏：展示当前课程包的某类资源 -->
    <transition name="cls-fade">
      <section v-if="activeKey" class="cls-stage" :aria-label="'上课 · ' + pkg.title">
        <header class="cls-stage-bar">
          <div class="cls-stage-title">
            <ResIcon :icon="activeType.icon" :tone="activeType.tone" :size="18" :box="34" />
            <span class="cls-stage-copy">
              <b>{{ activeType.label }}</b>
              <small>{{ pkg.title }} · {{ pkg.teacher }}</small>
            </span>
          </div>
          <button type="button" class="cls-stage-close" @click="activeKey = ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.close" /></svg>
            返回桌面
          </button>
        </header>
        <div class="cls-stage-body">
          <div class="cls-stage-inner" :class="{ wide: activeKey === 'slides' || activeKey === 'video' }">
            <ResourcePanel :pkg="pkg" :type="activeKey" variant="stage" @open-app="$emit('open-app', $event)" />
          </div>
        </div>
      </section>
    </transition>

    <!-- 左下角课堂资源切换栏 -->
    <div v-show="!hidden || activeKey" class="cls-bar" :class="{ staged: !!activeKey }">
      <div class="cls-pkg">
        <button type="button" class="cls-pkg-btn" :aria-expanded="pickerOpen" aria-haspopup="listbox" @click="pickerOpen = !pickerOpen">
          <ResIcon icon="archive" tone="blue" :size="16" :box="30" />
          <span class="cls-pkg-copy">
            <small>当前课程包</small>
            <b>{{ pkg.title }}</b>
          </span>
          <svg class="cls-pkg-caret" :class="{ open: pickerOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons.chevronDown" /></svg>
        </button>
        <ul v-if="pickerOpen" class="cls-picker" role="listbox" aria-label="选择课程包">
          <li v-for="item in packages" :key="item.id">
            <button type="button" role="option" class="cls-picker-item" :class="{ on: item.id === pkg.id }" :aria-selected="item.id === pkg.id" @click="choosePackage(item.id)">
              <img :src="item.cover" alt="">
              <span>
                <b>{{ item.title }}</b>
                <small>{{ item.textbookLabel }}</small>
              </span>
            </button>
          </li>
          <li class="cls-picker-foot">在平台「教学工作台」中可查找更多课程包</li>
        </ul>
      </div>
      <div class="cls-tabs" role="toolbar" aria-label="课堂资源">
        <button
          v-for="type in resourceTypes"
          :key="type.key"
          type="button"
          class="cls-tab"
          :class="{ on: activeKey === type.key }"
          :aria-pressed="activeKey === type.key"
          @click="toggle(type.key)"
        >
          <span class="cls-tab-ico" :class="'tone-' + type.tone">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="icons[type.icon]" /></svg>
          </span>
          {{ type.short }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ICONS } from '@/constants/icons';
import { PACKAGES, RESOURCE_TYPES, getPackage } from '@/data/teaching/packages';
import ResourcePanel from '@/components/teaching/resource-panel.vue';
import ResIcon from '@/components/teaching/res-icon.vue';

export default {
  name: 'ClassroomDock',
  components: { ResourcePanel, ResIcon },
  props: {
    /** 初始课程包 id：来自教学工作台「去上课」 */
    packageId: { type: String, default: '' },
    /** 底部筛选栏展开时收起切换栏，避免遮挡 */
    hidden: { type: Boolean, default: false }
  },
  data() {
    return {
      icons: ICONS,
      packages: PACKAGES,
      resourceTypes: RESOURCE_TYPES,
      currentId: (getPackage(this.packageId) || PACKAGES[0]).id,
      activeKey: '',
      pickerOpen: false
    };
  },
  computed: {
    pkg() {
      return getPackage(this.currentId) || PACKAGES[0];
    },
    activeType() {
      return RESOURCE_TYPES.find((type) => type.key === this.activeKey) || RESOURCE_TYPES[0];
    }
  },
  watch: {
    packageId(id) {
      if (getPackage(id)) this.currentId = id;
    }
  },
  mounted() {
    document.addEventListener('pointerdown', this.onDocPointerDown);
    document.addEventListener('keydown', this.onKeydown);
  },
  beforeDestroy() {
    document.removeEventListener('pointerdown', this.onDocPointerDown);
    document.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    toggle(key) {
      this.pickerOpen = false;
      this.activeKey = this.activeKey === key ? '' : key;
    },
    choosePackage(id) {
      this.currentId = id;
      this.pickerOpen = false;
    },
    onDocPointerDown(event) {
      if (!this.pickerOpen) return;
      const pkgEl = this.$el.querySelector('.cls-pkg');
      if (pkgEl && !pkgEl.contains(event.target)) this.pickerOpen = false;
    },
    onKeydown(event) {
      if (event.key !== 'Escape') return;
      // 平台预览（app-preview 根节点 .full）打开时由预览自身处理 Escape，避免同时关闭上课大屏
      const preview = document.querySelector('.full');
      if (preview && window.getComputedStyle(preview).display !== 'none') return;
      if (this.pickerOpen) {
        this.pickerOpen = false;
      } else if (this.activeKey) {
        this.activeKey = '';
      }
    }
  }
};
</script>

<style scoped>
.cls-stage {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: #eef2fa;
}
.cls-stage-bar {
  height: 58px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 22px;
  color: #fff;
  background: linear-gradient(90deg, #12204f, #1d3a8f 60%, #16296a);
}
.cls-stage-title { display: flex; align-items: center; gap: 12px; min-width: 0; }
.cls-stage-copy { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
.cls-stage-copy b { font-size: 17px; }
.cls-stage-copy small { font-size: 12px; opacity: .7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cls-stage-close {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, .25);
  border-radius: 999px;
  background: rgba(255, 255, 255, .1);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.cls-stage-close:hover { background: rgba(255, 255, 255, .2); }
.cls-stage-body { flex: 1; min-height: 0; overflow-y: auto; padding: 24px 28px 120px; }
.cls-stage-inner { max-width: 1080px; margin: 0 auto; }
.cls-stage-inner.wide { max-width: 1480px; }

.cls-fade-enter-active,
.cls-fade-leave-active { transition: opacity .2s ease; }
.cls-fade-enter,
.cls-fade-leave-to { opacity: 0; }

/* 切换栏：常驻左下角，位于底部筛选栏上方；进入上课大屏后贴底 */
.cls-bar {
  position: fixed;
  left: 24px;
  bottom: 74px;
  z-index: 210;
  display: flex;
  align-items: stretch;
  gap: 6px;
  padding: 6px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e2e8f5;
  box-shadow: 0 12px 32px rgba(13, 27, 76, .18);
  user-select: none;
}
.cls-bar.staged { bottom: 20px; }

.cls-pkg { position: relative; display: flex; }
.cls-pkg-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 230px;
  padding: 6px 12px 6px 8px;
  border: 0;
  border-radius: 11px;
  background: #f3f6fd;
  font: inherit;
  color: #13213d;
  text-align: left;
  cursor: pointer;
}
.cls-pkg-btn:hover { background: #e8effd; }
.cls-pkg-copy { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
.cls-pkg-copy small { font-size: 11px; color: #6f7d98; }
.cls-pkg-copy b { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cls-pkg-caret { flex: none; color: #6f7d98; transform: rotate(180deg); transition: transform .2s; }
.cls-pkg-caret.open { transform: rotate(0deg); }

.cls-picker {
  position: absolute;
  left: 0;
  bottom: calc(100% + 12px);
  width: 340px;
  list-style: none;
  margin: 0;
  padding: 6px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f5;
  box-shadow: 0 16px 40px rgba(13, 27, 76, .2);
}
.cls-picker-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 0;
  border-radius: 10px;
  background: none;
  font: inherit;
  color: #13213d;
  text-align: left;
  cursor: pointer;
}
.cls-picker-item:hover { background: #f3f6fd; }
.cls-picker-item.on { background: #e8effd; }
.cls-picker-item img { flex: none; width: 72px; height: 45px; border-radius: 7px; object-fit: cover; }
.cls-picker-item span { display: flex; flex-direction: column; line-height: 1.35; min-width: 0; }
.cls-picker-item b { font-size: 14px; }
.cls-picker-item small { font-size: 11px; color: #6f7d98; }
.cls-picker-foot { padding: 8px 10px 4px; font-size: 12px; color: #6f7d98; border-top: 1px solid #eef2fa; margin-top: 4px; }

.cls-tabs { display: flex; gap: 2px; }
.cls-tab {
  width: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 0;
  border: 0;
  border-radius: 11px;
  background: none;
  font: inherit;
  font-size: 13px;
  color: #42506b;
  cursor: pointer;
}
.cls-tab:hover { background: #f3f6fd; }
.cls-tab.on { background: #e8effd; color: #2b6cff; font-weight: 700; }
.cls-tab-ico {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.cls-tab.on .cls-tab-ico { color: #fff; }
.tone-orange { color: #e8730c; background: #fff1e4; }
.tone-red { color: #e5484d; background: #ffecec; }
.tone-blue { color: #2168f3; background: #e8f0ff; }
.tone-violet { color: #7c3aed; background: #f1eaff; }
.tone-indigo { color: #4f46e5; background: #ecebff; }
.tone-green { color: #0e9f6e; background: #e3f7ee; }
.tone-teal { color: #0d8fa6; background: #e2f5f8; }
.cls-tab.on .tone-orange { background: #e8730c; }
.cls-tab.on .tone-red { background: #e5484d; }
.cls-tab.on .tone-blue { background: #2168f3; }
.cls-tab.on .tone-violet { background: #7c3aed; }
.cls-tab.on .tone-indigo { background: #4f46e5; }
.cls-tab.on .tone-green { background: #0e9f6e; }
.cls-tab.on .tone-teal { background: #0d8fa6; }

@media (prefers-reduced-motion: reduce) {
  .cls-fade-enter-active,
  .cls-fade-leave-active,
  .cls-pkg-caret { transition: none; }
}
</style>

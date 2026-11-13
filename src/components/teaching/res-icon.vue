<template>
  <span class="res-icon" :class="'tone-' + tone" :style="{ width: box + 'px', height: box + 'px' }" aria-hidden="true">
    <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path :d="path" />
    </svg>
  </span>
</template>

<script>
import { ICONS } from '@/constants/icons';

export default {
  name: 'ResIcon',
  props: {
    icon: { type: String, required: true },
    tone: { type: String, default: 'blue' },
    size: { type: Number, default: 18 },
    box: { type: Number, default: 34 }
  },
  computed: {
    path() {
      return ICONS[this.icon] || '';
    }
  }
};
</script>

<style scoped>
.res-icon {
  flex: none;
  display: inline-grid;
  place-items: center;
  border-radius: 9px;
}
.tone-orange { color: #e8730c; background: #fff1e4; }
.tone-red { color: #e5484d; background: #ffecec; }
.tone-blue { color: #2168f3; background: #e8f0ff; }
.tone-violet { color: #7c3aed; background: #f1eaff; }
.tone-indigo { color: #4f46e5; background: #ecebff; }
.tone-green { color: #0e9f6e; background: #e3f7ee; }
.tone-teal { color: #0d8fa6; background: #e2f5f8; }
</style>

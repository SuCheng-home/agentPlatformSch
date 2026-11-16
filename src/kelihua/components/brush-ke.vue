<template>
  <svg
    :key="playKey"
    class="brush-ke"
    viewBox="0 0 1000 1020"
    role="button"
    tabindex="0"
    aria-label="科，点击重新播放显影动画"
    @click="replay"
    @keydown.enter.prevent="replay"
    @keydown.space.prevent="replay"
  >
    <title>科</title>
    <defs>
      <linearGradient :id="`${uid}-ink`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f8a640" />
        <stop offset="0.55" stop-color="#ee8320" />
        <stop offset="1" stop-color="#dc6a0e" />
      </linearGradient>
    </defs>
    <!-- 完整字形统一显影，避免宽笔画遮罩穿过邻笔造成碎片、缺口和最后补齐时的跳变。 -->
    <g class="brush-ke__ink" :style="{ animationDelay: `${delay}s` }">
      <path :d="glyph" transform="matrix(1 0 0 -1 0 880)" :fill="`url(#${uid}-ink)`" />
    </g>
  </svg>
</template>

<script>
import glyph from '../assets/ke-glyph';

let sequence = 0;

export default {
  name: 'BrushKe',
  props: {
    delay: { type: Number, default: 0.2 }
  },
  data() {
    sequence += 1;
    return { uid: `klh-ke-${sequence}`, playKey: 0, glyph };
  },
  methods: {
    replay() {
      this.playKey += 1;
      this.$emit('replay');
    }
  }
};
</script>

<style lang="scss" scoped>
.brush-ke {
  display: block;
  cursor: pointer;
}

.brush-ke__ink {
  transform-origin: 50% 50%;
  animation: ink-appear 1.8s cubic-bezier(0.2, 0.7, 0.3, 1) both;
}

@keyframes ink-appear {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .brush-ke__ink { animation: none; }
}
</style>

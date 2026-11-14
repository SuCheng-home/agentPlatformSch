<template>
  <svg
    :key="playKey"
    class="brush-ke"
    viewBox="0 0 1000 1000"
    role="img"
    aria-label="科"
    @click="replay"
  >
    <title>科（点击重新书写）</title>
    <defs>
      <linearGradient :id="`${uid}-ink`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2452d6" />
        <stop offset="1" stop-color="#132f94" />
      </linearGradient>
      <linearGradient :id="`${uid}-swoosh`" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#f59a2e" stop-opacity="0" />
        <stop offset="0.25" stop-color="#f08a20" />
        <stop offset="0.75" stop-color="#ec7a16" />
        <stop offset="1" stop-color="#ffc06b" stop-opacity="0" />
      </linearGradient>
      <!-- 按笔顺逐笔揭示真实字形：每一笔是一条沿笔画走向、带宽度的遮罩线 -->
      <mask :id="`${uid}-mask`" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
        <path
          v-for="(s, i) in strokes"
          :key="i"
          class="brush-ke__stroke"
          :d="s.d"
          :stroke-width="s.w"
          pathLength="1"
          :style="{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }"
        />
        <rect class="brush-ke__settle" x="0" y="0" width="1000" height="1000" :style="{ animationDelay: `${settleDelay}s` }" />
      </mask>
      <mask :id="`${uid}-swoosh-mask`" maskUnits="userSpaceOnUse" x="-200" y="0" width="1900" height="1000">
        <path
          class="brush-ke__stroke"
          d="M230 760 C 560 600 980 450 1560 318"
          stroke-width="90"
          pathLength="1"
          :style="{ animationDuration: '0.7s', animationDelay: `${swooshDelay}s` }"
        />
      </mask>
    </defs>

    <g :mask="`url(#${uid}-mask)`">
      <path :d="glyph" transform="matrix(1 0 0 -1 0 880)" :fill="`url(#${uid}-ink)`" />
    </g>
    <path
      v-if="swoosh"
      :mask="`url(#${uid}-swoosh-mask)`"
      d="M230 752 C 560 586 980 432 1560 318 C 1000 462 620 620 270 778 Z"
      :fill="`url(#${uid}-swoosh)`"
    />
  </svg>
</template>

<script>
import glyph from '../assets/ke-glyph';

// 「科」九画：禾（撇、横、竖、撇、点）+ 斗（点、点、横、竖）。坐标为 1000×1000 画布、y 轴向下。
const STROKES = [
  { d: 'M385 105 Q300 200 165 262', w: 95, dur: 0.34 },
  { d: 'M65 485 Q220 380 400 325', w: 95, dur: 0.36 },
  { d: 'M292 248 L282 560 L268 875', w: 88, dur: 0.42 },
  { d: 'M242 445 Q170 590 48 712', w: 85, dur: 0.32 },
  { d: 'M318 455 Q390 480 420 540', w: 105, dur: 0.22 },
  { d: 'M505 195 Q595 210 600 268 Q570 290 535 298', w: 95, dur: 0.26 },
  { d: 'M430 370 Q500 400 562 440', w: 100, dur: 0.22 },
  { d: 'M312 642 Q480 540 700 485 Q860 425 952 462', w: 95, dur: 0.52 },
  { d: 'M700 65 L695 600 L680 990', w: 105, dur: 0.55 }
];
const GAP = 0.07;

let seq = 0;

export default {
  name: 'BrushKe',
  props: {
    delay: { type: Number, default: 0.2 },
    swoosh: { type: Boolean, default: true }
  },
  data() {
    seq += 1;
    return { uid: `klh-ke-${seq}`, playKey: 0, glyph };
  },
  computed: {
    strokes() {
      let t = this.delay;
      return STROKES.map((s) => {
        const item = { ...s, delay: t };
        t += s.dur + GAP;
        return item;
      });
    },
    writeEnd() {
      const last = this.strokes[this.strokes.length - 1];
      return last.delay + last.dur;
    },
    settleDelay() {
      return this.writeEnd;
    },
    swooshDelay() {
      return this.writeEnd + 0.05;
    }
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
  overflow: visible;
  cursor: pointer;
}

.brush-ke__stroke {
  fill: none;
  stroke: #fff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation-name: klh-draw;
  animation-timing-function: cubic-bezier(0.6, 0.05, 0.4, 1);
  animation-fill-mode: forwards;
}

.brush-ke__settle {
  fill: #fff;
  opacity: 0;
  animation: klh-settle 0.35s ease-out forwards;
}

@keyframes klh-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes klh-settle {
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .brush-ke__stroke { animation: none; stroke-dashoffset: 0; }
  .brush-ke__settle { animation: none; opacity: 1; }
}
</style>

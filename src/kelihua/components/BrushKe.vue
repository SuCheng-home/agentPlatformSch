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
        <stop offset="0" stop-color="#f8a640" />
        <stop offset="0.55" stop-color="#ee8320" />
        <stop offset="1" stop-color="#dc6a0e" />
      </linearGradient>
      <!-- 遮罩仅做极轻的抗锯齿；羽化过大会让书写中的笔画边缘发虚、出现“毛边” -->
      <filter :id="`${uid}-soft`" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation="1.2" />
      </filter>
      <!-- 按笔顺逐笔揭示真实字形：每一笔是一条沿笔画走向、带宽度的遮罩线 -->
      <mask :id="`${uid}-mask`" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
        <g :filter="`url(#${uid}-soft)`">
          <path
            v-for="(s, i) in strokes"
            :key="i"
            class="brush-ke__stroke"
            :d="s.d"
            :stroke-width="s.w"
            pathLength="1"
            :style="{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }"
          />
        </g>
        <rect class="brush-ke__settle" x="0" y="0" width="1000" height="1000" :style="{ animationDelay: `${writeEnd}s` }" />
      </mask>
    </defs>

    <g :mask="`url(#${uid}-mask)`">
      <path :d="glyph" transform="matrix(1 0 0 -1 0 880)" :fill="`url(#${uid}-ink)`" />
    </g>
  </svg>
</template>

<script>
import glyph from '../assets/ke-glyph';

// 「科」九画：禾（撇、横、竖、撇、点）+ 斗（点、点、横、竖）。坐标为 1000×1000 画布、y 轴向下。
const STROKES = [
  { d: 'M385 105 Q300 200 165 262', w: 115, dur: 0.34 },
  { d: 'M65 485 Q220 380 400 325', w: 115, dur: 0.36 },
  { d: 'M292 230 L282 560 L268 885', w: 135, dur: 0.42 },
  { d: 'M242 440 Q170 590 48 712', w: 110, dur: 0.32 },
  { d: 'M300 440 Q390 470 425 545', w: 140, dur: 0.22 },
  { d: 'M505 195 Q595 210 600 268 Q570 290 535 298', w: 115, dur: 0.26 },
  { d: 'M430 370 Q500 400 562 440', w: 120, dur: 0.22 },
  { d: 'M312 642 Q480 540 700 485 Q860 425 952 462', w: 115, dur: 0.52 },
  { d: 'M700 55 L695 600 L680 995', w: 130, dur: 0.55 }
];
const GAP = 0.07;

let seq = 0;

export default {
  name: 'BrushKe',
  props: {
    delay: { type: Number, default: 0.2 }
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

/*
 * 圆头线帽在虚线偏移为满长时仍会画出一个圆点，导致每一笔起笔处提前露出一块字形（“毛糙的点”）。
 * 因此等待阶段保持透明，动画开始的瞬间再显示。
 */
.brush-ke__stroke {
  fill: none;
  stroke: #fff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  animation-name: klh-draw;
  animation-timing-function: cubic-bezier(0.6, 0.05, 0.4, 1);
  animation-fill-mode: both;
}

.brush-ke__settle {
  fill: #fff;
  opacity: 0;
  animation: klh-settle 0.3s ease-out forwards;
}

@keyframes klh-draw {
  0% { stroke-dashoffset: 1; opacity: 0; }
  2% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

@keyframes klh-settle {
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .brush-ke__stroke { animation: none; stroke-dashoffset: 0; opacity: 1; }
  .brush-ke__settle { animation: none; opacity: 1; }
}
</style>

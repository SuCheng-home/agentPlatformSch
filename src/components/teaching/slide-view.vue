<template>
  <div class="slide" :class="['layout-' + slide.layout, { thumb }]">
    <template v-if="slide.layout === 'cover'">
      <img class="slide-bg" :src="cover" alt="">
      <div class="slide-cover-copy">
        <span class="slide-kicker">{{ slide.subtitle }}</span>
        <h3 class="slide-cover-title">{{ slide.title }}</h3>
        <span class="slide-byline">{{ teacher }} · {{ school }}</span>
      </div>
    </template>
    <template v-else>
      <div class="slide-head">
        <span class="slide-kicker">{{ kicker }}</span>
        <h3 class="slide-title">{{ slide.title }}</h3>
      </div>
      <table v-if="slide.table" class="slide-table">
        <thead>
          <tr><th v-for="cell in slide.table.head" :key="cell">{{ cell }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, r) in slide.table.rows" :key="r">
            <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
      <ol v-else class="slide-points">
        <li v-for="(point, i) in slide.points" :key="i">
          <span class="slide-point-mark">{{ i + 1 }}</span>
          <span>{{ point }}</span>
        </li>
      </ol>
    </template>
  </div>
</template>

<script>
const KICKERS = {
  question: '思考',
  bullets: '新知',
  activity: '探究活动',
  table: '归纳',
  summary: '小结'
};

export default {
  name: 'SlideView',
  props: {
    slide: { type: Object, required: true },
    cover: { type: String, default: '' },
    teacher: { type: String, default: '' },
    school: { type: String, default: '' },
    thumb: { type: Boolean, default: false }
  },
  computed: {
    kicker() {
      return KICKERS[this.slide.layout] || '';
    }
  }
};
</script>

<style scoped>
/* 课件页按 16:9 等比缩放：文字尺寸使用容器宽度单位，缩略图与大屏放映共用同一套排版 */
.slide {
  container-type: inline-size;
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 10px;
  background: #fbfcff;
  color: #13213d;
  display: flex;
  flex-direction: column;
  gap: 3cqw;
  padding: 5cqw 6cqw;
  box-sizing: border-box;
}
.slide.thumb { border-radius: 6px; }

.layout-cover {
  justify-content: flex-end;
  background: #0f1d4a;
  color: #fff;
}
.slide-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: .55;
}
.slide-cover-copy {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.4cqw;
}
.layout-cover .slide-kicker { color: #ffd76a; }
.slide-cover-title {
  margin: 0;
  font-size: 6.4cqw;
  font-weight: 800;
  line-height: 1.2;
  text-wrap: balance;
}
.slide-byline { font-size: 2.2cqw; opacity: .85; }

.slide-head { display: flex; flex-direction: column; gap: .8cqw; }
.slide-kicker {
  font-size: 2cqw;
  font-weight: 700;
  letter-spacing: .2em;
  color: #2168f3;
}
.slide-title { margin: 0; font-size: 4.6cqw; font-weight: 800; line-height: 1.25; }

.slide-points {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2.2cqw;
  font-size: 2.9cqw;
  line-height: 1.5;
}
.slide-points li { display: flex; align-items: flex-start; gap: 1.6cqw; }
.slide-point-mark {
  flex: none;
  width: 3.6cqw;
  height: 3.6cqw;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 2cqw;
  font-weight: 800;
  color: #fff;
  background: #2168f3;
  margin-top: .3cqw;
}
.layout-question .slide-point-mark,
.layout-activity .slide-point-mark { background: #e8730c; }

.slide-table { width: 100%; border-collapse: collapse; font-size: 2.3cqw; }
.slide-table th,
.slide-table td { border: 1px solid #d5deee; padding: 1.1cqw 1.6cqw; text-align: left; }
.slide-table th { background: #2168f3; color: #fff; font-weight: 700; border-color: #2168f3; }
.slide-table tbody tr:nth-child(even) td { background: #f1f5fd; }
</style>

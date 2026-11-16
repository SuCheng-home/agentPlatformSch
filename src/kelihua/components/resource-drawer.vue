<template>
  <el-drawer
    :visible="state.drawer.open"
    :size="drawerSize"
    custom-class="klh klh-drawer"
    :with-header="false"
    @close="close"
  >
    <div v-if="item" class="rd">
      <header :class="['rd__head', `rd__head--${item.type}`]">
        <div class="rd__toprow">
          <type-badge :type="item.type" solid />
          <span class="rd__code">{{ item.code }}</span>
          <button type="button" class="rd__close" aria-label="关闭" @click="close">
            <klh-icon name="x" :size="18" />
          </button>
        </div>
        <h2 class="rd__title">{{ item.name }}</h2>
        <p class="rd__desc">{{ item.desc }}</p>
        <dl class="rd__facts">
          <div v-for="f in facts" :key="f.k">
            <dt>{{ f.k }}</dt>
            <dd>{{ f.v }}</dd>
          </div>
        </dl>
        <div v-if="item.type !== 'prompt'" class="rd__cta">
          <button
            :disabled="!url"
            type="button"
            :class="['klh-btn', item.type === 'tool' ? 'klh-btn--orange' : 'klh-btn--primary']"
            @click="use"
          >
            {{ item.type === 'tool' ? '打开工具' : '进入使用' }}
            <klh-icon name="arrowRight" :size="16" />
          </button>
        </div>
      </header>

      <section v-if="item.steps && item.steps.length" class="rd__section">
        <h3>使用方法</h3>
        <ol class="rd__steps">
          <li v-for="(s, i) in item.steps" :key="i">{{ s }}</li>
        </ol>
      </section>

      <section class="rd__section">
        <h3>{{ item.type === 'agent' ? '人设与回复' : '提示词内容' }}</h3>
        <p class="rd__hint">{{ item.availability }} · 来源：{{ item.sourceName }}</p>
        <p v-if="item.sourceNote" class="rd__hint">{{ item.sourceNote }}</p>
        <p class="rd__hint">
          {{ item.type === 'agent'
            ? '这是该智能体的系统设定。可直接复制，迁移到其他大模型中复用或改写。'
            : '花括号 { } 内为需要替换的内容。' }}
        </p>
        <p v-if="!copyValue" class="rd__hint">{{ item.type === 'agent' ? '原资料未提供人设与回复，待作者补充。' : '原资料未提供提示词，待作者补充。' }}</p>
        <prompt-block v-else :text="copyValue" :title="item.type === 'agent' ? 'SYSTEM PROMPT' : 'PROMPT'" />
      </section>

      <section v-if="related.length" class="rd__section">
        <h3>同类推荐</h3>
        <ul class="rd__related">
          <li v-for="r in related" :key="r.id">
            <button type="button" @click="openOther(r.id)">
              <type-badge :type="r.type" />
              <span>{{ r.name }}</span>
              <klh-icon name="arrowRight" :size="14" />
            </button>
          </li>
        </ul>
      </section>
    </div>
  </el-drawer>
</template>

<script>
import KlhIcon from './KlhIcon.vue';
import TypeBadge from './TypeBadge.vue';
import PromptBlock from './prompt-block.vue';
import state, { actions, getters, groupKey } from '../store';
import { copyContent, resourceUrl } from '../utils/resources';

export default {
  name: 'ResourceDrawer',
  components: { KlhIcon, TypeBadge, PromptBlock },
  data() {
    return { state, viewport: window.innerWidth };
  },
  computed: {
    url() { return this.item ? resourceUrl(this.item) : ''; },
    copyValue() { return this.item ? copyContent(this.item) : ''; },
    item() {
      return state.drawer.resourceId ? getters.findById(state.drawer.resourceId) : null;
    },
    drawerSize() {
      return this.viewport < 640 ? '100%' : '560px';
    },
    facts() {
      const r = this.item;
      const list = [];
      if (r.matrix === 'subject') {
        list.push({ k: '学科', v: getters.subjectLabel(r.subject) });
        list.push({ k: '场景', v: getters.sceneLabel(r.scene) });
        if (r.grades) list.push({ k: '年级', v: r.grades.join('、') });
      } else if (r.matrix === 'education') {
        list.push({ k: '育人领域', v: getters.domainLabel(r.domain) });
      } else {
        list.push({ k: '分类', v: r.category });
      }
      list.push({ k: '建设者', v: `${r.author}${r.dept && r.dept !== r.author ? ` · ${r.dept}` : ''}` });
      return list;
    },
    related() {
      if (!this.item) return [];
      const key = groupKey(this.item);
      return getters.published((r) => r.id !== this.item.id && groupKey(r) === key).slice(0, 4);
    }
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    onResize() {
      this.viewport = window.innerWidth;
    },
    close() {
      actions.closeResource();
    },
    openOther(id) {
      actions.openResource(id);
    },
    use() {
      if (this.url) {
        window.open(this.url, '_blank', 'noopener,noreferrer');
        return;
      }
      this.$message({ message: `「${this.item.name}」使用地址待补充`, customClass: 'klh-popper' });
    }
  }
};
</script>

<style lang="scss" scoped>
.rd {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--klh-paper);
}

.rd__head {
  padding: 22px 28px 26px;
  background: var(--klh-white);
  border-bottom: 1px solid var(--klh-line);

  &--agent { box-shadow: inset 0 4px 0 var(--klh-blue); }
  &--tool { box-shadow: inset 0 4px 0 var(--klh-orange); }
  &--prompt { box-shadow: inset 0 4px 0 var(--klh-ink); }
}

.rd__toprow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rd__code {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  color: var(--klh-faint);
}

.rd__close {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 0;
  background: var(--klh-ink-tint);
  color: var(--klh-ink);
  cursor: pointer;
  &:hover { background: var(--klh-line-strong); }
}

.rd__title {
  margin-top: 16px;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
}

.rd__desc {
  margin-top: 8px;
  font-size: 15px;
  color: var(--klh-muted);
}

.rd__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin-top: 18px;

  dt { font-size: 12px; color: var(--klh-faint); }
  dd { margin: 2px 0 0; font-size: 14px; font-weight: 600; }
}

.rd__cta {
  margin-top: 22px;
  .klh-btn { height: 42px; padding: 0 22px; }
}

.rd__section {
  padding: 22px 28px 0;

  h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
  &:last-child { padding-bottom: 28px; }
}

.rd__hint {
  margin: -4px 0 12px;
  font-size: 13px;
  color: var(--klh-muted);
}

.rd__steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  list-style: none;
  counter-reset: s;

  li {
    position: relative;
    padding-left: 32px;
    font-size: 14px;
    counter-increment: s;
    &::before {
      content: counter(s);
      position: absolute;
      left: 0;
      top: 1px;
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--klh-white);
      border: 1px solid var(--klh-line-strong);
      font-size: 12px;
      font-weight: 700;
    }
  }
}

.rd__related {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;

  button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--klh-line);
    background: var(--klh-white);
    font: inherit;
    font-size: 14px;
    color: var(--klh-ink);
    text-align: left;
    cursor: pointer;
    span:nth-child(2) { flex: 1; }
    &:hover { border-color: var(--klh-line-strong); }
  }
}
</style>

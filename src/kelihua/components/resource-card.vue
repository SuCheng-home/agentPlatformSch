<template>
  <article :class="['res-card', `res-card--${item.type}`]">
    <button type="button" class="res-card__hit" :aria-label="`查看 ${item.name} 详情`" @click="open" />
    <div class="res-card__head">
      <span class="res-card__tile" aria-hidden="true">
        <klh-icon :name="item.type === 'agent' ? 'bot' : item.type === 'tool' ? 'tool' : 'prompt'" :size="22" />
      </span>
      <span class="res-card__code">{{ item.code }}</span>
    </div>
    <h3 class="res-card__title">{{ item.name }}</h3>
    <p class="res-card__desc">{{ item.desc }}</p>
    <p class="res-card__meta">{{ meta }}</p>
    <p class="res-card__status">{{ item.availability || '使用状态待核实' }}</p>
    <p v-if="!copyValue" class="res-card__status">{{ item.type === 'agent' ? '人设与回复未提供' : '提示词未提供' }}</p>
    <div class="res-card__foot">
      <type-badge :type="item.type" />
      <div class="res-card__actions">
        <button type="button" class="klh-btn klh-btn--ghost klh-btn--sm" :disabled="!copyValue" :title="copyValue ? copyLabel : '原资料未提供，待作者补充'" @click.stop="copy">
          {{ copyLabel }}
        </button>
        <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer" :class="['klh-btn', 'klh-btn--sm', item.type === 'tool' ? 'klh-btn--orange' : 'klh-btn--primary']" @click.stop>
          {{ item.asset && item.asset.endsWith('.ggb') ? '下载' : '打开' }}
        </a>
        <button v-else type="button" class="klh-btn klh-btn--sm" disabled>地址待补充</button>
      </div>
    </div>
  </article>
</template>

<script>
import KlhIcon from './KlhIcon.vue';
import TypeBadge from './TypeBadge.vue';
import { actions, getters } from '../store';
import { copyText } from './prompt-block.vue';
import { copyContent, resourceUrl } from '../utils/resources';

export default {
  name: 'ResourceCard',
  components: { KlhIcon, TypeBadge },
  props: {
    item: { type: Object, required: true }
  },
  computed: {
    url() { return resourceUrl(this.item); },
    copyValue() { return copyContent(this.item); },
    copyLabel() { return this.item.type === 'agent' ? '复制人设与回复' : '复制提示词'; },
    meta() {
      const r = this.item;
      if (r.matrix === 'subject') return `${getters.subjectLabel(r.subject)} · ${getters.sceneLabel(r.scene)} · ${r.author}`;
      if (r.matrix === 'education') return `${getters.domainLabel(r.domain)} · ${r.author}`;
      return `${r.category} · ${r.author}`;
    }
  },
  methods: {
    open() {
      actions.openResource(this.item.id);
    },
    async copy() {
      if (!this.copyValue) {
        return;
      }
      try {
        await copyText(this.copyValue);
        this.$message({ message: '已复制', type: 'success', customClass: 'klh-popper' });
      } catch {
        this.$message({ message: '复制失败，请打开详情手动复制', type: 'warning', customClass: 'klh-popper' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.res-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 18px 16px;
  border-radius: var(--klh-radius);
  border: 2px solid var(--klh-line);
  background: var(--klh-white);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--klh-shadow);
  }
  &--agent { border-color: var(--klh-blue); }
  &--tool { border-color: var(--klh-orange); }
  &--prompt:hover { border-color: var(--klh-line-strong); }
}

.res-card__hit {
  position: absolute;
  inset: 0;
  border: 0;
  background: transparent;
  border-radius: inherit;
  cursor: pointer;
}

.res-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.res-card__tile {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;

  .res-card--agent & { background: var(--klh-blue-tint); color: var(--klh-blue); }
  .res-card--tool & { background: var(--klh-orange-tint); color: var(--klh-orange); }
  .res-card--prompt & { background: var(--klh-ink-tint); color: var(--klh-ink); }
}

.res-card__code {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--klh-faint);
}

.res-card__title {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
}

.res-card__desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 42px;
  font-size: 14px;
  color: var(--klh-muted);
  line-height: 1.5;
}

.res-card__status {
  font-size: 12px;
  color: var(--klh-muted);
}

.res-card__meta {
  font-size: 12px;
  color: var(--klh-faint);
}

.res-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px dashed var(--klh-line);
}

.res-card__actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.res-card__actions button:disabled { opacity: 0.55; cursor: not-allowed; }
</style>

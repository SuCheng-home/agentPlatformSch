<template>
  <article :class="['mcard', `mcard--${item.type}`]">
    <button type="button" class="mcard__hit" :aria-label="`查看 ${item.name} 详情`" @click="open" />
    <div class="mcard__shot">
      <img v-if="shot" :src="shot" :alt="`${item.name} 界面截图`" width="800" height="500" loading="lazy" />
      <div v-else class="mcard__cover" aria-hidden="true">
        <klh-icon :name="item.type === 'agent' ? 'bot' : 'tool'" :size="36" :stroke="1.6" />
      </div>
      <span class="mcard__type">{{ item.type === 'agent' ? '智能体' : '工具' }}</span>
    </div>
    <div class="mcard__body">
      <h3 class="mcard__title">{{ item.name }}</h3>
      <div class="mcard__foot">
        <span class="mcard__author">{{ item.author }}</span>
        <div class="mcard__actions">
          <button v-if="copyValue" type="button" class="mcard__btn mcard__btn--ghost" @click.stop="copy">{{ copyLabel }}</button>
          <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer" class="mcard__btn" @click.stop>
            {{ isDownload ? '下载' : '打开' }}
            <klh-icon :name="isDownload ? 'download' : 'arrowRight'" :size="14" :stroke="2.2" />
          </a>
          <span v-else class="mcard__pending">链接待补充</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
import KlhIcon from './KlhIcon.vue';
import { copyText } from './prompt-block.vue';
import { assetUrl, copyContent, resourceUrl } from '../utils/resources';

export default {
  name: 'MatrixCard',
  components: { KlhIcon },
  props: {
    item: { type: Object, required: true }
  },
  computed: {
    url() { return resourceUrl(this.item); },
    shot() { return assetUrl(this.item.shot); },
    isDownload() { return Boolean(this.item.asset && this.item.asset.endsWith('.ggb')); },
    copyValue() { return copyContent(this.item); },
    copyLabel() { return this.item.type === 'agent' ? '复制人设' : '复制提示词'; }
  },
  methods: {
    open() {
      this.$router.push(`/kelihua/resource/${this.item.id}`);
    },
    async copy() {
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
/* 资源类型色：橙 = 工具，蓝 = 智能体（全平台统一约定） */
.mcard {
  --accent: var(--klh-orange);
  --accent-tint: var(--klh-orange-tint);
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: var(--klh-white);
  box-shadow: 0 0 0 1px var(--klh-line), var(--klh-shadow);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 0 1.5px var(--accent), 0 18px 32px -22px var(--accent);
  }
  &:hover img { transform: scale(1.03); }

  &--agent { --accent: var(--klh-blue); --accent-tint: var(--klh-blue-tint); }
}

.mcard__hit {
  position: absolute;
  inset: 0;
  z-index: 1;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.mcard__shot {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--klh-paper);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    transition: transform 0.4s;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: var(--accent);
  }
}

.mcard__cover {
  display: grid;
  place-items: center;
  height: 100%;
  background: var(--accent-tint);
  color: var(--accent);
}

.mcard__type {
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--klh-white);
  box-shadow: 0 2px 8px rgba(23, 32, 58, 0.12);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
  }
}

.mcard__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px 16px;
}

.mcard__title {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  color: var(--klh-ink);
  text-wrap: pretty;
}

.mcard__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
}

.mcard__author {
  font-size: 14px;
  color: var(--klh-muted);
}

.mcard__actions {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mcard__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--klh-white);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:hover { filter: brightness(0.92); }

  &--ghost {
    background: var(--accent-tint);
    color: var(--accent);
  }
}

.mcard__pending {
  font-size: 14px;
  color: var(--klh-faint);
}
</style>

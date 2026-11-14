<template>
  <figure class="prompt-block">
    <figcaption class="prompt-block__bar">
      <span class="prompt-block__label">
        <klh-icon name="prompt" :size="14" :stroke="2.2" />
        {{ title }}
      </span>
      <button type="button" class="prompt-block__copy" @click="copy">
        <klh-icon :name="copied ? 'check' : 'copy'" :size="14" />
        {{ copied ? '已复制' : '复制' }}
      </button>
    </figcaption>
    <pre :class="['prompt-block__text', { 'is-clamped': clamp && !expanded }]">{{ text }}</pre>
    <button v-if="clamp && lineCount > 8" type="button" class="prompt-block__more" @click="expanded = !expanded">
      {{ expanded ? '收起' : '展开全部' }}
    </button>
  </figure>
</template>

<script>
import KlhIcon from './KlhIcon.vue';

export function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

export default {
  name: 'PromptBlock',
  components: { KlhIcon },
  props: {
    text: { type: String, required: true },
    title: { type: String, default: '提示词' },
    clamp: { type: Boolean, default: false }
  },
  data() {
    return { copied: false, expanded: false, timer: null };
  },
  computed: {
    lineCount() {
      return this.text.split('\n').length;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  methods: {
    async copy() {
      try {
        await copyText(this.text);
        this.copied = true;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => { this.copied = false; }, 1600);
        this.$emit('copied');
      } catch (e) {
        this.$message({ message: '复制失败，请手动选择文本复制', type: 'warning', customClass: 'klh-popper' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.prompt-block {
  margin: 0;
  border-radius: 12px;
  background: var(--klh-ink);
  color: rgba(255, 255, 255, 0.92);
  overflow: hidden;
}

.prompt-block__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.prompt-block__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.7);
}

.prompt-block__copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: var(--klh-white);
  font-size: 12px;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.08); }
}

.prompt-block__text {
  margin: 0;
  padding: 14px 16px 16px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, 'PingFang SC', monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;

  &.is-clamped {
    max-height: calc(1.7em * 8 + 30px);
    overflow: hidden;
    mask-image: linear-gradient(#000 70%, transparent);
  }
}

.prompt-block__more {
  display: block;
  width: 100%;
  padding: 8px;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  cursor: pointer;
  &:hover { color: var(--klh-white); }
}
</style>

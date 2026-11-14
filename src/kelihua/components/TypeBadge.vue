<template>
  <span :class="['type-badge', `type-badge--${type}`, { 'type-badge--solid': solid }]">
    <klh-icon :name="icon" :size="13" :stroke="2" />
    {{ label }}
  </span>
</template>

<script>
import KlhIcon from './KlhIcon.vue';
import { RESOURCE_TYPES } from '../data/taxonomy';

const ICON = { agent: 'bot', tool: 'tool', prompt: 'prompt' };

export default {
  name: 'TypeBadge',
  components: { KlhIcon },
  props: {
    type: { type: String, required: true },
    solid: { type: Boolean, default: false }
  },
  computed: {
    label() {
      return (RESOURCE_TYPES[this.type] || {}).label || '';
    },
    icon() {
      return ICON[this.type] || 'file';
    }
  }
};
</script>

<style lang="scss" scoped>
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &--agent { background: var(--klh-blue-tint); color: var(--klh-blue); }
  &--tool { background: var(--klh-orange-tint); color: #b85a08; }
  &--prompt { background: var(--klh-ink-tint); color: var(--klh-ink); }

  &--solid.type-badge--agent { background: var(--klh-blue); color: var(--klh-white); }
  &--solid.type-badge--tool { background: var(--klh-orange); color: var(--klh-white); }
  &--solid.type-badge--prompt { background: var(--klh-ink); color: var(--klh-white); }
}
</style>

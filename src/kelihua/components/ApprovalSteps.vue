<template>
  <ol class="ap-steps" :aria-label="`审批进度：${statusText}`">
    <li
      v-for="(s, i) in stages"
      :key="s.key"
      :class="['ap-step', `is-${stepState(i)}`]"
    >
      <span class="ap-step__dot" aria-hidden="true">
        <klh-icon v-if="stepState(i) === 'done'" name="check" :size="12" :stroke="3" />
        <klh-icon v-else-if="stepState(i) === 'rejected'" name="x" :size="12" :stroke="3" />
      </span>
      <span class="ap-step__label">{{ s.label }}</span>
    </li>
  </ol>
</template>

<script>
import KlhIcon from './KlhIcon.vue';
import { APPROVAL_STAGES } from '../store';

export default {
  name: 'ApprovalSteps',
  components: { KlhIcon },
  props: {
    item: { type: Object, required: true }
  },
  data() {
    return { stages: APPROVAL_STAGES };
  },
  computed: {
    statusText() {
      const s = this.item;
      if (s.status === 'published') return '已发布';
      if (s.status === 'rejected') return '已退回';
      return s.stage === 1 ? '待教研组初审' : '待管理员终审';
    }
  },
  methods: {
    /** stage：1=初审中，2=终审中，3=已发布；退回时停在当前审批节点 */
    stepState(i) {
      const { status, stage } = this.item;
      if (status === 'published') return 'done';
      if (i === 0) return 'done';
      if (status === 'rejected') {
        if (i < stage) return 'done';
        return i === stage ? 'rejected' : 'todo';
      }
      if (i < stage) return 'done';
      return i === stage ? 'current' : 'todo';
    }
  }
};
</script>

<style lang="scss" scoped>
.ap-steps {
  display: flex;
  list-style: none;
  padding: 0;
}

.ap-step {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 9px;
    left: calc(50% + 14px);
    right: calc(-50% + 14px);
    height: 2px;
    border-radius: 2px;
    background: var(--klh-line-strong);
  }
  &.is-done:not(:last-child)::after { background: var(--klh-blue); }
}

.ap-step__dot {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--klh-line-strong);
  background: var(--klh-white);
  color: var(--klh-white);

  .is-done & { background: var(--klh-blue); border-color: var(--klh-blue); }
  .is-current & { border-color: var(--klh-orange); box-shadow: 0 0 0 4px var(--klh-orange-tint); }
  .is-rejected & { background: var(--klh-orange); border-color: var(--klh-orange); }
}

.ap-step__label {
  font-size: 12px;
  color: var(--klh-faint);
  white-space: nowrap;

  .is-done & { color: var(--klh-ink); }
  .is-current & { color: #b85a08; font-weight: 700; }
  .is-rejected & { color: #b85a08; font-weight: 700; }
}
</style>

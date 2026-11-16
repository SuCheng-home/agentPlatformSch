<template>
  <header class="page-head">
    <div class="page-head__text">
      <p class="page-head__eyebrow">
        <span class="klh-brush page-head__glyph" aria-hidden="true">{{ glyph }}</span>
        {{ eyebrow }}
      </p>
      <h1 class="page-head__title">{{ title }}</h1>
      <p v-if="desc" class="page-head__desc">{{ desc }}</p>
    </div>
    <div v-if="$slots.default" class="page-head__side">
      <slot />
    </div>
  </header>
</template>

<script>
export default {
  name: 'PageHead',
  props: {
    title: { type: String, required: true },
    eyebrow: { type: String, default: '' },
    desc: { type: String, default: '' },
    glyph: { type: String, default: '科' }
  }
};
</script>

<style lang="scss" scoped>
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-head__eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--klh-blue-deep);
}

.page-head__glyph {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--klh-blue);
  color: var(--klh-white);
  font-size: 20px;
  letter-spacing: 0;
  line-height: 1;
}

.page-head__title {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-wrap: balance;
}

.page-head__desc {
  margin-top: 8px;
  max-width: 680px;
  font-size: 15px;
  color: var(--klh-muted);
  text-wrap: pretty;
}

.page-head__side {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .page-head { flex-direction: column; align-items: flex-start; }
  .page-head__title { font-size: 24px; }
}
</style>

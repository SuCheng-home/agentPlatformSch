<template>
  <div class="klh-page">
    <page-head
      glyph="建"
      eyebrow="共建中心"
      title="把好用的 AI 应用，分享给全校老师"
      desc="提交你配置好的智能体、常用工具或打磨过的提示词。经教研组初审、平台管理员终审后，将自动编号并发布到对应矩阵。"
    />

    <ol class="flow" aria-label="发布流程">
      <li v-for="(s, i) in flow" :key="s.t">
        <span class="flow__idx">{{ i + 1 }}</span>
        <div>
          <strong>{{ s.t }}</strong>
          <small>{{ s.d }}</small>
        </div>
      </li>
    </ol>

    <div class="build">
      <section class="build__form klh-panel" aria-labelledby="build-form-title">
        <h2 id="build-form-title" class="panel-title">
          {{ editing ? `修改：${editing.name}` : '提交新资源' }}
        </h2>
        <p v-if="editing && lastNote" class="reject-note">
          <strong>退回意见</strong>{{ lastNote }}
        </p>
        <submit-form :initial="editing" @submit="onSubmit" @cancel="editingId = null" />
      </section>

      <section class="build__mine" aria-labelledby="build-mine-title">
        <h2 id="build-mine-title" class="panel-title">
          我的提交
          <span>{{ mine.length }}</span>
        </h2>
        <ul v-if="mine.length" class="mine">
          <li v-for="s in mine" :key="s.id" :class="['mine__item', { 'is-editing': editingId === s.id }]">
            <div class="mine__top">
              <type-badge :type="s.type" />
              <strong class="mine__name">{{ s.name }}</strong>
              <span :class="['status', `status--${s.status}`]">{{ statusText(s) }}</span>
            </div>
            <p class="mine__time">提交于 {{ s.submittedAt }}<template v-if="s.publishedCode"> · 编号 {{ s.publishedCode }}</template></p>
            <approval-steps :item="s" class="mine__steps" />
            <p v-if="latest(s).note" class="mine__note">
              <strong>{{ latest(s).who }}：</strong>{{ latest(s).note }}
            </p>
            <div class="mine__actions">
              <button v-if="s.status === 'rejected'" type="button" class="klh-btn klh-btn--sm klh-btn--orange" @click="edit(s)">
                <klh-icon name="edit" :size="14" />
                修改后重新提交
              </button>
              <button v-if="s.status === 'published' && s.publishedId" type="button" class="klh-btn klh-btn--sm" @click="view(s)">
                查看已发布
              </button>
            </div>
          </li>
        </ul>
        <div v-else class="klh-empty">
          <klh-icon name="upload" :size="26" />
          <p>你还没有提交过资源。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import PageHead from '../components/PageHead.vue';
import SubmitForm from '../components/SubmitForm.vue';
import ApprovalSteps from '../components/ApprovalSteps.vue';
import TypeBadge from '../components/TypeBadge.vue';
import KlhIcon from '../components/KlhIcon.vue';
import state, { actions, getters } from '../store';

export default {
  name: 'KlhBuildCenter',
  components: { PageHead, SubmitForm, ApprovalSteps, TypeBadge, KlhIcon },
  data() {
    return {
      state,
      editingId: null,
      flow: [
        { t: '教师提交', d: '填写资源信息与提示词' },
        { t: '教研组初审', d: '学科组长 / 部门负责人' },
        { t: '管理员终审', d: '信息中心审核规范与安全' },
        { t: '编号发布', d: '自动编号并上架到矩阵' }
      ]
    };
  },
  computed: {
    mine() {
      return getters.mySubmissions();
    },
    editing() {
      return this.mine.find((s) => s.id === this.editingId) || null;
    },
    lastNote() {
      return this.editing ? this.latest(this.editing).note : '';
    }
  },
  watch: {
    'state.session.role'() {
      this.editingId = null;
    }
  },
  methods: {
    latest(s) {
      return s.history[s.history.length - 1] || {};
    },
    statusText(s) {
      if (s.status === 'published') return '已发布';
      if (s.status === 'rejected') return '已退回';
      return s.stage === 1 ? '待初审' : '待终审';
    },
    edit(s) {
      this.editingId = s.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    view(s) {
      this.$router.push(`/kelihua/resource/${s.publishedId}`);
    },
    onSubmit(payload) {
      if (this.editing) {
        actions.resubmit(this.editing.id, payload);
        this.editingId = null;
        this.$message({ message: '已重新提交，等待教研组初审', type: 'success', customClass: 'klh-popper' });
        return;
      }
      actions.submit(payload);
      this.$message({ message: '提交成功，等待教研组初审', type: 'success', customClass: 'klh-popper' });
    }
  }
};
</script>

<style lang="scss" scoped>
.flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 24px;
  list-style: none;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--klh-white);
    border: 1px solid var(--klh-line);
  }
  strong { display: block; font-size: 14px; }
  small { font-size: 12px; color: var(--klh-muted); }
}

.flow__idx {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--klh-ink);
  color: var(--klh-white);
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;

  li:last-child & { background: var(--klh-orange); }
}

.build {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.build__form {
  padding: 24px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 800;

  span {
    padding: 0 8px;
    border-radius: 10px;
    background: var(--klh-ink-tint);
    font-size: 13px;
    line-height: 22px;
  }
}

.reject-note {
  margin: -6px 0 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--klh-orange-tint);
  font-size: 14px;
  strong { margin-right: 8px; color: #b85a08; }
}

.mine {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;
}

.mine__item {
  padding: 16px 18px;
  border-radius: var(--klh-radius);
  background: var(--klh-white);
  border: 1px solid var(--klh-line);

  &.is-editing { border-color: var(--klh-orange); box-shadow: 0 0 0 3px var(--klh-orange-tint); }
}

.mine__top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mine__name {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;

  &--pending { background: var(--klh-ink-tint); color: var(--klh-ink); }
  &--rejected { background: var(--klh-orange-tint); color: #b85a08; }
  &--published { background: var(--klh-blue-tint); color: var(--klh-blue); }
}

.mine__time {
  margin-top: 4px;
  font-size: 12px;
  color: var(--klh-faint);
}

.mine__steps {
  margin-top: 14px;
}

.mine__note {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--klh-paper);
  font-size: 13px;
  color: var(--klh-muted);
  strong { color: var(--klh-ink); }
}

.mine__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  &:empty { display: none; }
}

@media (max-width: 1000px) {
  .build { grid-template-columns: 1fr; }
  .flow { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>

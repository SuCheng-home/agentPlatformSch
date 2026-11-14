<template>
  <div class="klh-page">
    <page-head
      glyph="审"
      eyebrow="审核发布"
      :title="role === 'admin' ? '终审与发布' : '教研组初审'"
      :desc="role === 'admin'
        ? '管理员可处理全部待审资源；终审通过后系统按分类自动编号并发布上架。'
        : '请审核本组老师提交的资源：内容是否准确、提示词是否规范、是否适合本校使用。'"
    />

    <div class="rv-tabs" role="tablist" aria-label="审核列表">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        role="tab"
        :aria-selected="String(tab === t.key)"
        :class="['rv-tab', { 'is-active': tab === t.key }]"
        @click="tab = t.key"
      >
        {{ t.label }} <em>{{ t.count }}</em>
      </button>
    </div>

    <div class="rv">
      <ul class="rv__queue" aria-label="提交列表">
        <li v-for="s in list" :key="s.id">
          <button
            type="button"
            :class="['q', { 'is-active': current && current.id === s.id }]"
            :aria-current="current && current.id === s.id ? 'true' : null"
            @click="selectedId = s.id"
          >
            <span class="q__top">
              <type-badge :type="s.type" />
              <span :class="['q__state', `q__state--${stateKey(s)}`]">{{ stateText(s) }}</span>
            </span>
            <strong>{{ s.name }}</strong>
            <small>{{ s.author }} · {{ s.submittedAt }}</small>
          </button>
        </li>
        <li v-if="!list.length" class="klh-empty">
          <klh-icon name="check" :size="26" />
          <p>暂无需要处理的提交</p>
        </li>
      </ul>

      <section v-if="current" class="rv__detail klh-panel" aria-live="polite">
        <header class="rv__head">
          <div class="rv__title">
            <type-badge :type="current.type" solid />
            <h2>{{ current.name }}</h2>
          </div>
          <p class="rv__desc">{{ current.desc }}</p>
          <approval-steps :item="current" class="rv__steps" />
        </header>

        <dl class="rv__facts">
          <div><dt>归属</dt><dd>{{ placeOf(current) }}</dd></div>
          <div><dt>提交人</dt><dd>{{ current.author }} · {{ current.dept }}</dd></div>
          <div v-if="current.url"><dt>访问地址</dt><dd class="mono">{{ current.url }}</dd></div>
          <div v-if="current.grades && current.grades.length"><dt>适用年级</dt><dd>{{ current.grades.join('、') }}</dd></div>
          <div><dt>预计编号</dt><dd class="mono">{{ current.publishedCode || previewCode }}</dd></div>
        </dl>

        <div v-if="current.prompt" class="rv__block">
          <h3>{{ current.type === 'agent' ? '智能体提示词说明' : '提示词内容' }}</h3>
          <prompt-block :text="current.prompt" />
        </div>

        <div class="rv__block">
          <h3>审批记录</h3>
          <ol class="timeline">
            <li v-for="(h, i) in current.history" :key="i">
              <span class="timeline__dot" aria-hidden="true" />
              <div>
                <p><strong>{{ h.action }}</strong> · {{ h.who }}</p>
                <small>{{ h.at }}</small>
                <p v-if="h.note" class="timeline__note">{{ h.note }}</p>
              </div>
            </li>
          </ol>
        </div>

        <div v-if="canAct" class="rv__act">
          <label for="rv-note" class="rv__label">审核意见</label>
          <el-input
            id="rv-note"
            v-model="note"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            maxlength="200"
            show-word-limit
            placeholder="通过时可选填；退回时请写明修改要求"
          />
          <div class="rv__btns">
            <button type="button" class="klh-btn" @click="reject">退回修改</button>
            <button type="button" class="klh-btn klh-btn--primary" @click="approve">
              <klh-icon name="stamp" :size="16" />
              {{ current.stage === 1 ? '初审通过' : '终审通过并发布' }}
            </button>
          </div>
        </div>
        <p v-else-if="current.status === 'pending'" class="rv__wait">该资源已进入终审环节，等待平台管理员处理。</p>
      </section>
    </div>
  </div>
</template>

<script>
import PageHead from '../components/PageHead.vue';
import ApprovalSteps from '../components/ApprovalSteps.vue';
import PromptBlock from '../components/PromptBlock.vue';
import TypeBadge from '../components/TypeBadge.vue';
import KlhIcon from '../components/KlhIcon.vue';
import state, { actions, getters } from '../store';

export default {
  name: 'KlhReviewCenter',
  components: { PageHead, ApprovalSteps, PromptBlock, TypeBadge, KlhIcon },
  data() {
    return { state, tab: 'todo', selectedId: null, note: '' };
  },
  computed: {
    role() {
      return state.session.role;
    },
    todo() {
      return getters.pendingForMe();
    },
    tabs() {
      return [
        { key: 'todo', label: '待我审核', count: this.todo.length },
        { key: 'all', label: '全部记录', count: state.submissions.length }
      ];
    },
    list() {
      return this.tab === 'todo' ? this.todo : state.submissions;
    },
    current() {
      return this.list.find((s) => s.id === this.selectedId) || this.list[0] || null;
    },
    canAct() {
      return this.current && this.todo.some((s) => s.id === this.current.id);
    },
    previewCode() {
      const s = this.current;
      if (s.matrix === 'subject') {
        const sub = state.subjects.find((x) => x.key === s.subject);
        return `XK-${sub ? sub.code : 'QT'}-***`;
      }
      if (s.matrix === 'education') {
        const d = state.domains.find((x) => x.key === s.domain);
        return `YR-${d ? d.code : 'QT'}-***`;
      }
      return 'TS-***';
    }
  },
  watch: {
    'current.id'() {
      this.note = '';
    }
  },
  methods: {
    stateKey(s) {
      if (s.status !== 'pending') return s.status;
      return s.stage === 1 ? 'first' : 'final';
    },
    stateText(s) {
      return { published: '已发布', rejected: '已退回', first: '待初审', final: '待终审' }[this.stateKey(s)];
    },
    placeOf(s) {
      if (s.matrix === 'subject') return `学科 AI 矩阵 · ${getters.subjectLabel(s.subject)} · ${getters.sceneLabel(s.scene)}`;
      if (s.matrix === 'education') return `育人管理矩阵 · ${getters.domainLabel(s.domain)}`;
      return `提示词库 · ${s.category}`;
    },
    approve() {
      const id = this.current.id;
      const published = actions.approve(id, this.note.trim());
      this.note = '';
      this.$message({
        message: published ? `已发布，编号 ${published.code}` : '初审通过，已转交管理员终审',
        type: 'success',
        customClass: 'klh-popper'
      });
    },
    reject() {
      if (!this.note.trim()) {
        this.$message({ message: '退回时请填写修改意见', type: 'warning', customClass: 'klh-popper' });
        return;
      }
      actions.reject(this.current.id, this.note.trim());
      this.note = '';
      this.$message({ message: '已退回给提交人', customClass: 'klh-popper' });
    }
  }
};
</script>

<style lang="scss" scoped>
.rv-tabs {
  display: inline-flex;
  gap: 4px;
  margin-bottom: 16px;
  padding: 4px;
  border-radius: 999px;
  background: var(--klh-white);
  border: 1px solid var(--klh-line);
}

.rv-tab {
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--klh-muted);
  cursor: pointer;

  em { font-style: normal; margin-left: 4px; font-variant-numeric: tabular-nums; }
  &.is-active { background: var(--klh-ink); color: var(--klh-white); }
}

.rv {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.rv__queue {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
}

.q {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  font: inherit;
  text-align: left;
  color: var(--klh-ink);
  cursor: pointer;

  strong { font-size: 15px; }
  small { font-size: 12px; color: var(--klh-faint); }
  &:hover { border-color: var(--klh-line-strong); }
  &.is-active { border-color: var(--klh-ink); box-shadow: 0 0 0 3px var(--klh-ink-tint); }
}

.q__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.q__state {
  font-size: 12px;
  font-weight: 700;
  &--first, &--final { color: #b85a08; }
  &--rejected { color: var(--klh-faint); }
  &--published { color: var(--klh-blue); }
}

.rv__detail {
  padding: 24px 26px;
}

.rv__title {
  display: flex;
  align-items: center;
  gap: 10px;
  h2 { font-size: 22px; font-weight: 800; }
}

.rv__desc {
  margin-top: 6px;
  font-size: 14px;
  color: var(--klh-muted);
}

.rv__steps {
  margin-top: 20px;
  padding: 16px 0 4px;
  border-top: 1px solid var(--klh-line);
}

.rv__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 12px;
  background: var(--klh-paper);

  dt { font-size: 12px; color: var(--klh-faint); }
  dd { margin: 2px 0 0; font-size: 14px; font-weight: 600; word-break: break-all; }
  .mono { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-weight: 500; }
}

.rv__block {
  margin-top: 22px;
  h3 { margin-bottom: 10px; font-size: 15px; font-weight: 700; }
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
  list-style: none;
  padding: 0;

  li { position: relative; display: flex; gap: 12px; }
  li:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 16px;
    bottom: -14px;
    width: 2px;
    background: var(--klh-line);
  }
  p { font-size: 14px; }
  small { font-size: 12px; color: var(--klh-faint); }
}

.timeline__dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  margin-top: 5px;
  border-radius: 50%;
  border: 2px solid var(--klh-blue);
  background: var(--klh-white);
}

.timeline__note {
  margin-top: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--klh-paper);
  color: var(--klh-muted);
}

.rv__act {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--klh-line);
}

.rv__label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
}

.rv__btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
  .klh-btn { height: 40px; padding: 0 20px; }
}

.rv__wait {
  margin-top: 22px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--klh-ink-tint);
  font-size: 14px;
  color: var(--klh-muted);
}

@media (max-width: 900px) {
  .rv { grid-template-columns: 1fr; }
  .rv__facts { grid-template-columns: 1fr; }
}
</style>

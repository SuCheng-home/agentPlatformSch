<template>
  <el-form ref="form" :model="form" :rules="rules" label-position="top" class="submit-form" @submit.native.prevent="onSubmit">
    <el-form-item label="资源类型" prop="type">
      <div class="type-pick" role="radiogroup" aria-label="资源类型">
        <button
          v-for="t in types"
          :key="t.key"
          type="button"
          role="radio"
          :aria-checked="String(form.type === t.key)"
          :class="['type-pick__item', `type-pick__item--${t.key}`, { 'is-active': form.type === t.key }]"
          @click="setType(t.key)"
        >
          <klh-icon :name="t.icon" :size="20" />
          <strong>{{ t.label }}</strong>
          <small>{{ t.hint }}</small>
        </button>
      </div>
    </el-form-item>

    <el-form-item label="名称" prop="name">
      <el-input v-model.trim="form.name" maxlength="24" show-word-limit placeholder="如：古诗文情境朗读" />
    </el-form-item>
    <el-form-item label="一句话简介" prop="desc">
      <el-input v-model.trim="form.desc" maxlength="60" show-word-limit placeholder="说明它能帮老师做什么" />
    </el-form-item>

    <el-form-item v-if="form.type !== 'prompt'" label="归属矩阵" prop="matrix">
      <el-radio-group v-model="form.matrix">
        <el-radio-button label="subject">学科 AI 矩阵</el-radio-button>
        <el-radio-button label="education">育人管理矩阵</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <div v-if="form.type !== 'prompt' && form.matrix === 'subject'" class="grid-2">
      <el-form-item label="学科" prop="subject">
        <el-select v-model="form.subject" placeholder="选择学科" popper-class="klh-popper">
          <el-option v-for="s in state.subjects" :key="s.key" :label="s.label" :value="s.key" />
        </el-select>
      </el-form-item>
      <el-form-item label="应用场景" prop="scene">
        <el-select v-model="form.scene" placeholder="选择场景" popper-class="klh-popper">
          <el-option v-for="s in state.scenes" :key="s.key" :label="s.label" :value="s.key" />
        </el-select>
      </el-form-item>
    </div>
    <el-form-item v-if="form.type !== 'prompt' && form.matrix === 'subject'" label="适用年级" prop="grades">
      <el-checkbox-group v-model="form.grades">
        <el-checkbox v-for="g in state.grades" :key="g" :label="g" />
      </el-checkbox-group>
    </el-form-item>

    <el-form-item v-if="form.type !== 'prompt' && form.matrix === 'education'" label="育人领域" prop="domain">
      <el-select v-model="form.domain" placeholder="选择领域" popper-class="klh-popper">
        <el-option v-for="d in state.domains" :key="d.key" :label="d.label" :value="d.key" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="form.type === 'prompt'" label="提示词分类" prop="category">
      <el-select v-model="form.category" placeholder="选择分类" popper-class="klh-popper">
        <el-option v-for="c in state.promptCategories" :key="c" :label="c" :value="c" />
      </el-select>
    </el-form-item>

    <el-form-item v-if="form.type !== 'prompt'" label="访问地址" prop="url">
      <el-input v-model.trim="form.url" placeholder="https://（智能体或工具的使用链接）" />
    </el-form-item>

    <el-form-item v-if="form.type !== 'tool'" :label="form.type === 'agent' ? '智能体提示词说明' : '提示词内容'" prop="prompt">
      <el-input
        v-model="form.prompt"
        type="textarea"
        :autosize="{ minRows: 6, maxRows: 14 }"
        :placeholder="form.type === 'agent'
          ? '# 角色\n# 任务\n# 要求\n# 输出格式'
          : '可用 {课题}、{年级} 等花括号标注需要替换的内容'"
      />
    </el-form-item>

    <div class="submit-form__foot">
      <button v-if="editing" type="button" class="klh-btn" @click="$emit('cancel')">取消修改</button>
      <button type="submit" class="klh-btn klh-btn--primary">
        <klh-icon name="upload" :size="16" />
        {{ editing ? '修改后重新提交' : '提交审核' }}
      </button>
    </div>
  </el-form>
</template>

<script>
import KlhIcon from './KlhIcon.vue';
import state from '../store';

const blank = () => ({
  type: 'agent', name: '', desc: '', matrix: 'subject', subject: '', scene: '', grades: [],
  domain: '', category: '', url: '', prompt: ''
});

export default {
  name: 'SubmitForm',
  components: { KlhIcon },
  props: {
    initial: { type: Object, default: null }
  },
  data() {
    const required = (msg) => ({ required: true, message: msg, trigger: ['blur', 'change'] });
    return {
      state,
      form: blank(),
      types: [
        { key: 'agent', label: '智能体', icon: 'bot', hint: '可对话的 AI 助手' },
        { key: 'tool', label: '工具', icon: 'tool', hint: '完成特定任务的应用' },
        { key: 'prompt', label: '提示词', icon: 'prompt', hint: '可复用的指令模板' }
      ],
      rules: {
        name: [required('请填写名称')],
        desc: [required('请填写简介')],
        subject: [required('请选择学科')],
        scene: [required('请选择场景')],
        grades: [{ type: 'array', required: true, message: '至少选择一个年级', trigger: 'change' }],
        domain: [required('请选择育人领域')],
        category: [required('请选择分类')],
        url: [
          required('请填写访问地址'),
          { pattern: /^https?:\/\/\S+$/, message: '请填写以 http(s):// 开头的地址', trigger: 'blur' }
        ],
        prompt: [required('请填写提示词'), { min: 20, message: '提示词至少 20 个字', trigger: 'blur' }]
      }
    };
  },
  computed: {
    editing() {
      return !!this.initial;
    }
  },
  watch: {
    initial: {
      immediate: true,
      handler(val) {
        this.form = val ? { ...blank(), ...JSON.parse(JSON.stringify(val)) } : blank();
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      }
    }
  },
  methods: {
    setType(t) {
      this.form.type = t;
      this.$nextTick(() => this.$refs.form.clearValidate());
    },
    payload() {
      const f = this.form;
      const base = { type: f.type, name: f.name, desc: f.desc };
      if (f.type === 'prompt') return { ...base, matrix: 'prompt', category: f.category, prompt: f.prompt };
      const extra = f.matrix === 'subject'
        ? { subject: f.subject, scene: f.scene, grades: f.grades }
        : { domain: f.domain };
      return { ...base, matrix: f.matrix, url: f.url, ...extra, ...(f.type === 'agent' ? { prompt: f.prompt } : {}) };
    },
    onSubmit() {
      this.$refs.form.validate((ok) => {
        if (!ok) return;
        this.$emit('submit', this.payload());
        if (!this.editing) {
          this.form = blank();
          this.$nextTick(() => this.$refs.form.clearValidate());
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.submit-form {
  ::v-deep .el-form-item { margin-bottom: 18px; }
  ::v-deep .el-form-item__label { padding-bottom: 4px; font-weight: 700; color: var(--klh-ink); line-height: 1.6; }
  ::v-deep .el-select { width: 100%; }
}

.type-pick {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}

.type-pick__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--klh-line-strong);
  background: var(--klh-white);
  font: inherit;
  text-align: left;
  color: var(--klh-ink);
  cursor: pointer;
  line-height: 1.4;

  .klh-icon { margin-bottom: 4px; color: var(--klh-faint); }
  strong { font-size: 14px; }
  small { font-size: 12px; color: var(--klh-muted); }

  &.is-active.type-pick__item--agent { border-color: var(--klh-blue); background: var(--klh-blue-tint); .klh-icon { color: var(--klh-blue); } }
  &.is-active.type-pick__item--tool { border-color: var(--klh-orange); background: var(--klh-orange-tint); .klh-icon { color: var(--klh-orange); } }
  &.is-active.type-pick__item--prompt { border-color: var(--klh-ink); background: var(--klh-ink-tint); .klh-icon { color: var(--klh-ink); } }
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 14px;
}

.submit-form__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 6px;

  .klh-btn { height: 42px; padding: 0 22px; }
}

@media (max-width: 560px) {
  .type-pick { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
}
</style>

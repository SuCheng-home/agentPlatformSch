<template>
  <div class="klh-page">
    <page-head
      glyph="录"
      eyebrow="目录管理"
      title="分类、编号与排序"
      desc="支持直接输入排序号、修改自定义编号及按编号排序。设置保存在当前浏览器；服务端同步接口未提供。"
    />

    <p v-if="state.catalogStorageError" role="alert">{{ state.catalogStorageError }}</p>
    <div class="cm-tabs" role="tablist" aria-label="管理视图">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        role="tab"
        :aria-selected="String(tab === t.key)"
        :class="['cm-tab', { 'is-active': tab === t.key }]"
        @click="tab = t.key"
      >{{ t.label }}</button>
    </div>

    <!-- 资源编排 -->
    <section v-if="tab === 'order'" class="klh-panel cm-order">
      <div class="cm-toolbar">
        <el-radio-group v-model="matrix" size="small" @change="onMatrix">
          <el-radio-button label="subject">学科应用矩阵</el-radio-button>
          <el-radio-button label="education">育人管理矩阵</el-radio-button>
          <el-radio-button label="prompt">提示词库</el-radio-button>
        </el-radio-group>
        <el-select v-model="group" size="small" class="cm-group" popper-class="klh-popper" aria-label="分组">
          <el-option v-for="g in groupOptions" :key="g.key" :label="`${g.label}（${g.count}）`" :value="g.key" />
        </el-select>
        <button type="button" class="klh-btn klh-btn--sm" :disabled="!rows.length" @click="sortByCode">按编号排序</button>
        <button type="button" class="klh-btn klh-btn--sm cm-renumber" :disabled="!rows.length" @click="renumber">
          <klh-icon name="hash" :size="14" />
          按当前顺序重新编号
        </button>
      </div>

      <p class="cm-storage-note">排序号越小越靠前；相同排序号按编号自然排序。人设、回复与提示词可在「编辑」中补充。</p>
      <div class="cm-table-wrap">
        <table class="cm-table">
          <thead>
            <tr>
              <th scope="col" class="w-order">顺序</th>
              <th scope="col" class="w-code">编号</th>
              <th scope="col">名称</th>
              <th scope="col" class="w-type">类型</th>
              <th scope="col" class="w-status">状态</th>
              <th scope="col" class="w-act">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rows" :key="r.id" :class="{ 'is-off': r.status === 'offline' }">
              <td class="w-order"><input class="order-input" type="number" min="1" max="999999" step="1" :value="r.order" :aria-label="`${r.name} 排序号`" @change="setOrder(r, $event)" @blur="setOrder(r, $event)" @keydown.enter="setOrder(r, $event)" /></td>
              <td class="w-code">
                <input
                  class="code-input"
                  :value="r.code"
                  :aria-label="`${r.name} 编号`"
                  @change="setCode(r, $event)"
                  @blur="setCode(r, $event)"
                  @keydown.enter="setCode(r, $event)"
                />
              </td>
              <td>
                <strong class="name">{{ r.name }}</strong>
                <small class="desc">{{ r.desc }}</small>
              </td>
              <td class="w-type"><type-badge :type="r.type" /></td>
              <td class="w-status">
                <el-switch
                  :value="r.status === 'published'"
                  active-color="#1638b0"
                  :aria-label="`${r.name} 上架状态`"
                  @change="(v) => toggle(r, v)"
                />
                <span class="status-text">{{ r.status === 'published' ? '上架' : '下架' }}</span>
              </td>
              <td class="w-act">
                <button type="button" class="icon-btn" :disabled="i === 0 || r.status !== 'published'" :aria-label="`上移 ${r.name}`" @click="move(r, -1)">
                  <klh-icon name="arrowUp" :size="15" />
                </button>
                <button type="button" class="icon-btn" :disabled="!canDown(r, i)" :aria-label="`下移 ${r.name}`" @click="move(r, 1)">
                  <klh-icon name="arrowDown" :size="15" />
                </button>
                <button type="button" class="icon-btn" :aria-label="`编辑 ${r.name}`" @click="openEdit(r)">
                  <klh-icon name="edit" :size="15" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!rows.length" class="klh-empty cm-empty">该分组暂无资源</div>
      </div>
    </section>

    <!-- 分类维护 -->
    <section v-else class="cm-cats">
      <div v-for="col in catColumns" :key="col.kind" class="klh-panel cm-cat">
        <h2>{{ col.title }}</h2>
        <p class="cm-cat__hint">{{ col.hint }}</p>
        <ul>
          <li v-for="c in col.items" :key="c.key">
            <input
              class="cat-input"
              :value="c.label"
              :aria-label="`${col.title}名称`"
              @change="rename(col.kind, c.key, $event.target.value)"
            />
            <input
              v-if="col.kind !== 'category'"
              class="cat-code"
              :value="c.code"
              maxlength="4"
              :aria-label="`${c.label} 编号前缀`"
              @change="setPrefix(col.kind, c.key, $event.target.value)"
            />
            <span class="cat-count">{{ c.count }}</span>
          </li>
        </ul>
        <form class="cm-cat__add" @submit.prevent="add(col.kind)">
          <input v-model="newCat[col.kind]" :placeholder="`新增${col.title}`" :aria-label="`新增${col.title}`" />
          <button type="submit" class="klh-btn klh-btn--sm">
            <klh-icon name="plus" :size="14" />
            添加
          </button>
        </form>
      </div>
      <aside class="klh-panel cm-rule">
        <h2>编号规则</h2>
        <ul>
          <li><code>XK-YW-001</code>学科矩阵 · 学科前缀 · 序号</li>
          <li><code>YR-BZR-001</code>育人矩阵 · 领域前缀 · 序号</li>
          <li><code>TS-001</code>提示词库 · 序号</li>
        </ul>
        <p>终审发布时自动生成下一个可用序号；调整分类后会按新分组重新取号。</p>
      </aside>
    </section>

    <el-dialog :visible.sync="edit.open" title="编辑资源" width="520px" custom-class="klh klh-dialog" append-to-body>
      <el-form v-if="edit.form" label-position="top" class="edit-form">
        <el-form-item label="名称">
          <el-input v-model.trim="edit.form.name" maxlength="120" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model.trim="edit.form.desc" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" maxlength="500" />
        </el-form-item>
        <el-form-item v-if="edit.form.matrix === 'subject'" label="学科 / 场景">
          <div class="grid-2">
            <el-select v-model="edit.form.subject" popper-class="klh-popper">
              <el-option v-for="s in state.subjects" :key="s.key" :label="s.label" :value="s.key" />
            </el-select>
            <el-select v-model="edit.form.scene" popper-class="klh-popper">
              <el-option v-for="s in state.scenes" :key="s.key" :label="s.label" :value="s.key" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item v-if="edit.form.matrix === 'education'" label="育人领域">
          <el-select v-model="edit.form.domain" popper-class="klh-popper">
            <el-option v-for="d in state.domains" :key="d.key" :label="d.label" :value="d.key" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="edit.form.matrix === 'prompt'" label="提示词分类">
          <el-select v-model="edit.form.category" popper-class="klh-popper">
            <el-option v-for="c in state.promptCategories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="edit.form.matrix === 'subject'" label="大单元">
          <el-select v-model="edit.form.unitId" popper-class="klh-popper">
            <el-option v-for="unit in editableUnits" :key="unit.id" :label="unit.title" :value="unit.id" />
          </el-select>
        </el-form-item>
        <template v-if="edit.form.type === 'agent'">
          <el-form-item label="人设（填写作者提供的原文）"><el-input v-model="edit.form.persona" type="textarea" :rows="5" /></el-form-item>
          <el-form-item label="回复设定（填写作者提供的原文）"><el-input v-model="edit.form.reply" type="textarea" :rows="4" /></el-form-item>
        </template>
        <el-form-item v-else label="提示词（填写作者提供的原文）"><el-input v-model="edit.form.prompt" type="textarea" :rows="6" /></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-foot">
        <button type="button" class="klh-btn" @click="edit.open = false">取消</button>
        <button type="button" class="klh-btn klh-btn--primary" @click="saveEdit">保存</button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PageHead from '../components/PageHead.vue';
import TypeBadge from '../components/TypeBadge.vue';
import KlhIcon from '../components/KlhIcon.vue';
import state, { actions, groupKey } from '../store';

export default {
  name: 'KlhCatalogManage',
  components: { PageHead, TypeBadge, KlhIcon },
  data() {
    return {
      state,
      tab: 'order',
      tabs: [
        { key: 'order', label: '资源编排' },
        { key: 'cats', label: '分类维护' }
      ],
      matrix: 'subject',
      group: 'subject:wl',
      newCat: { subject: '', domain: '', category: '' },
      edit: { open: false, id: null, form: null }
    };
  },
  computed: {
    editableUnits() {
      return this.edit.form ? state.units.filter((unit) => unit.subject === this.edit.form.subject) : [];
    },
    managed() {
      return state.resources.filter((r) => r.status === 'published' || r.status === 'offline');
    },
    groupOptions() {
      const count = (key) => this.managed.filter((r) => groupKey(r) === key).length;
      if (this.matrix === 'subject') return state.subjects.map((s) => ({ key: `subject:${s.key}`, label: s.label, count: count(`subject:${s.key}`) }));
      if (this.matrix === 'education') return state.domains.map((d) => ({ key: `education:${d.key}`, label: d.label, count: count(`education:${d.key}`) }));
      return state.promptCategories.map((c) => ({ key: `prompt:${c}`, label: c, count: count(`prompt:${c}`) }));
    },
    rows() {
      const list = this.managed.filter((r) => groupKey(r) === this.group);
      return [
        ...list.filter((r) => r.status === 'published').sort((a, b) => a.order - b.order || a.code.localeCompare(b.code, 'zh-CN', { numeric: true })),
        ...list.filter((r) => r.status === 'offline').sort((a, b) => a.order - b.order || a.code.localeCompare(b.code, 'zh-CN', { numeric: true }))
      ];
    },
    catColumns() {
      const cnt = (fn) => this.managed.filter(fn).length;
      return [
        {
          kind: 'subject', title: '学科', hint: '名称与编号前缀',
          items: state.subjects.map((s) => ({ ...s, count: cnt((r) => r.matrix === 'subject' && r.subject === s.key) }))
        },
        {
          kind: 'domain', title: '育人领域', hint: '名称与编号前缀',
          items: state.domains.map((d) => ({ ...d, count: cnt((r) => r.matrix === 'education' && r.domain === d.key) }))
        },
        {
          kind: 'category', title: '提示词分类', hint: '分类名称',
          items: state.promptCategories.map((c) => ({ key: c, label: c, count: cnt((r) => r.type === 'prompt' && r.category === c) }))
        }
      ];
    }
  },
  methods: {
    setOrder(resource, event) {
      const order = Number(event.target.value);
      if (!actions.setOrder(resource.id, order)) {
        event.target.value = resource.order;
        this.$message({ message: '请输入 1 至 999999 的整数排序号', type: 'warning', customClass: 'klh-popper' });
      }
    },
    sortByCode() {
      actions.sortByCode(this.group);
      this.$message({ message: state.catalogStorageError || '已按自定义编号排序并保存到本机', type: state.catalogStorageError ? 'warning' : 'success', customClass: 'klh-popper' });
    },
    onMatrix() {
      this.group = this.groupOptions[0] ? this.groupOptions[0].key : '';
    },
    canDown(r, i) {
      if (r.status !== 'published') return false;
      const next = this.rows[i + 1];
      return !!next && next.status === 'published';
    },
    move(r, dir) {
      actions.move(r.id, dir);
    },
    toggle(r, on) {
      actions.setOffline(r.id, !on);
    },
    setCode(r, e) {
      const code = e.target.value.trim().toUpperCase();
      const taken = state.resources.some((x) => x.id !== r.id && x.code === code);
      if (!code || taken) {
        if (taken) this.$message({ message: `编号 ${code} 已被使用`, type: 'warning', customClass: 'klh-popper' });
        e.target.value = r.code;
        return;
      }
      actions.updateResource(r.id, { code });
    },
    renumber() {
      actions.renumberGroup(this.group);
      this.$message({ message: '已按当前顺序重新编号', type: 'success', customClass: 'klh-popper' });
    },
    openEdit(r) {
      this.edit = {
        open: true,
        id: r.id,
        form: { name: r.name, desc: r.desc, matrix: r.matrix, subject: r.subject, scene: r.scene, domain: r.domain, category: r.category, type: r.type, unitId: r.unitId, persona: r.persona || r.prompt || '', reply: r.reply || '', prompt: r.prompt || '' }
      };
    },
    saveEdit() {
      const f = this.edit.form;
      if (!f.name) {
        this.$message({ message: '名称不能为空', type: 'warning', customClass: 'klh-popper' });
        return;
      }
      const unit = state.units.find((item) => item.id === f.unitId && item.subject === f.subject);
      if (f.matrix === 'subject' && !unit) {
        this.$message({ message: '请选择当前学科的大单元', type: 'warning', customClass: 'klh-popper' });
        return;
      }
      const patch = { name: f.name, desc: f.desc, persona: f.persona, reply: f.reply, prompt: f.prompt };
      if (unit) {
        Object.assign(patch, { unitId: unit.id, unitTitle: unit.title });
      }
      if (f.matrix === 'subject') Object.assign(patch, { subject: f.subject, scene: f.scene });
      if (f.matrix === 'education') patch.domain = f.domain;
      if (f.matrix === 'prompt') patch.category = f.category;
      actions.updateResource(this.edit.id, patch);
      this.edit.open = false;
      this.$message({ message: state.catalogStorageError || '已保存到当前浏览器', type: state.catalogStorageError ? 'warning' : 'success', customClass: 'klh-popper' });
    },
    rename(kind, key, val) {
      actions.renameCategory(kind, key, val);
      if (kind === 'category' && this.group === `prompt:${key}`) this.group = `prompt:${val.trim()}`;
    },
    setPrefix(kind, key, val) {
      actions.setCategoryCode(kind, key, val);
    },
    add(kind) {
      const ok = actions.addCategory(kind, this.newCat[kind] || '');
      if (!ok) {
        this.$message({ message: '名称为空或已存在', type: 'warning', customClass: 'klh-popper' });
        return;
      }
      this.newCat[kind] = '';
    }
  }
};
</script>

<style lang="scss" scoped>
.cm-storage-note { margin: 0 0 16px; font-size: 13px; color: var(--klh-muted); }
.order-input { width: 80px; padding: 7px; border: 1px solid var(--klh-line); border-radius: 6px; color: var(--klh-ink); background: var(--klh-paper); }
.cm-tabs {
  display: inline-flex;
  gap: 4px;
  margin-bottom: 16px;
  padding: 4px;
  border-radius: 999px;
  background: var(--klh-white);
  border: 1px solid var(--klh-line);
}

.cm-tab {
  height: 34px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--klh-muted);
  cursor: pointer;
  &.is-active { background: var(--klh-ink); color: var(--klh-white); }
}

.cm-order {
  padding: 18px 20px 8px;
}

.cm-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.cm-group {
  width: 200px;
}

.cm-renumber {
  margin-left: auto;
}

.cm-table-wrap {
  overflow-x: auto;
}

.cm-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;

  th {
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 600;
    text-align: left;
    color: var(--klh-faint);
    border-bottom: 1px solid var(--klh-line);
  }
  td {
    padding: 12px;
    border-bottom: 1px solid var(--klh-line);
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: 0; }
  tr.is-off td { opacity: 0.5; }
  tr.is-off td.w-status, tr.is-off td.w-act { opacity: 1; }

  .w-order { width: 64px; }
  .w-code { width: 150px; }
  .w-type { width: 96px; }
  .w-status { width: 120px; white-space: nowrap; }
  .w-act { width: 128px; white-space: nowrap; }
}

.code-input {
  width: 130px;
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: var(--klh-paper);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  color: var(--klh-ink);
  &:hover { border-color: var(--klh-line-strong); }
  &:focus { outline: 0; border-color: var(--klh-blue); background: var(--klh-white); }
}

.name {
  display: block;
  font-size: 14px;
}

.desc {
  display: block;
  max-width: 380px;
  font-size: 12px;
  color: var(--klh-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-text {
  margin-left: 8px;
  font-size: 12px;
  color: var(--klh-muted);
}

.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-right: 4px;
  border-radius: 8px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  color: var(--klh-ink);
  cursor: pointer;
  &:hover:not(:disabled) { border-color: var(--klh-blue); color: var(--klh-blue); }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

.cm-empty {
  margin: 8px 0 12px;
}

.cm-cats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) 260px;
  gap: 16px;
  align-items: start;
}

.cm-cat {
  padding: 18px;

  h2 { font-size: 16px; font-weight: 800; }
  ul { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; list-style: none; padding: 0; }
  li { display: flex; align-items: center; gap: 6px; }
}

.cm-cat__hint {
  font-size: 12px;
  color: var(--klh-faint);
}

.cat-input, .cat-code, .cm-cat__add input {
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  font: inherit;
  font-size: 14px;
  color: var(--klh-ink);
  &:focus { outline: 0; border-color: var(--klh-blue); }
}

.cat-input { flex: 1; min-width: 0; }
.cat-code { width: 64px; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: 12px; text-transform: uppercase; }

.cat-count {
  width: 28px;
  font-size: 12px;
  color: var(--klh-faint);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.cm-cat__add {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--klh-line);
  input { flex: 1; min-width: 0; }
}

.cm-rule {
  padding: 18px;
  background: var(--klh-ink);
  color: var(--klh-white);
  border-color: var(--klh-ink);

  h2 { font-size: 16px; font-weight: 800; }
  ul { display: flex; flex-direction: column; gap: 10px; margin: 14px 0; list-style: none; padding: 0; }
  li { display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: rgba(255, 255, 255, 0.72); }
  code { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: 13px; color: var(--klh-white); }
  p { font-size: 12px; color: rgba(255, 255, 255, 0.6); }
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}

.edit-form ::v-deep .el-select { width: 100%; }

.dialog-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1200px) {
  .cm-cats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .cm-cats { grid-template-columns: 1fr; }
  .cm-renumber { margin-left: 0; }
}
</style>

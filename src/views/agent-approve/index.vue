<template>
  <div class="agent-approve">
    <!-- 页面标题 + 待审批 / 已审批 切换（同一行，分段器样式） -->
    <div class="manage-head">
      <h1 class="manage-title">智能体审批</h1>
      <el-tabs v-model="activeTab" class="approve-tabs" @tab-click="handleTabChange">
        <el-tab-pane :label="`待审批 (${pendingTotal})`" name="pending" />
        <el-tab-pane :label="`已审批 (${approvedTotal})`" name="approved" />
      </el-tabs>
    </div>

    <!-- 搜索条件区 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="query" class="filter-form" size="small" @submit.native.prevent>
        <el-form-item label="智能体名称">
          <el-input
            v-model="query.name"
            placeholder="请输入智能体名称"
            clearable
            style="width: 200px"
            @keyup.enter.native="handleSearch"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="query.agentType" placeholder="全部" clearable style="width: 140px" @change="handleSearch">
            <el-option label="智能体" :value="1" />
            <el-option label="实用工具" :value="2" />
            <el-option label="教学资源" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="学科">
          <el-select v-model="query.subjectCode" placeholder="全部" clearable style="width: 140px" @change="handleSubjectChange">
            <el-option v-for="item in subjectList" :key="item.id" :label="item.atlasName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="期次">
          <el-select
            v-model="query.materialId"
            placeholder="全部"
            clearable
            :disabled="!query.subjectCode"
            style="width: 140px"
            @change="handleMaterialChange"
          >
            <el-option v-for="item in materialList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="章节">
          <el-select
            v-model="query.chapterId"
            placeholder="全部"
            clearable
            :disabled="!query.materialId"
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option v-for="item in unitOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isPendingTab" label="审批状态">
          <el-select v-model="query.approvalResult" placeholder="全部" clearable style="width: 140px" @change="handleSearch">
            <el-option label="审批通过" :value="APPROVE_PASS" />
            <el-option label="已退回" :value="APPROVE_REJECT" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrap">
      <el-table
        v-loading="loading"
        :data="list"
        border
        stripe
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        empty-text="暂无数据"
      >
        <el-table-column prop="name" label="名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="110" align="center">
          <template slot-scope="{ row }">
            <span class="type-tag" :style="{ background: agentTypeColor(row.agentType) }">
              {{ agentTypeLabel(row.agentType) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="创建者" width="120" show-overflow-tooltip />
        <el-table-column label="学科/期次/章节" min-width="220" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span>{{ row.subjectNames || '-' }}</span>
            <span v-if="row.materialNames" class="text-muted"> / {{ row.materialNames }}</span>
            <span v-if="row.chapterNames" class="text-muted"> / {{ row.chapterNames }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template slot-scope="{ row }">{{ formatTime(row.createTime || row.created) }}</template>
        </el-table-column>
        <!-- 已审批列表：审批结果状态列，退回可点击查看原因 -->
        <el-table-column v-if="!isPendingTab" label="审批状态" width="120" align="center">
          <template slot-scope="{ row }">
            <span
              class="approve-status-tag"
              :class="row.approvalStatus === APPROVE_REJECT ? 'is-rejected' : 'is-passed'"
              @click="handleStatusClick(row)"
            >
              {{ row.approvalStatus === APPROVE_REJECT ? '已退回' : '已通过' }}
              <svg
                v-if="row.approvalStatus === APPROVE_REJECT"
                class="approve-status-hint"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="查看退回原因"
                title="查看退回原因"
              >
                <circle cx="12" cy="12" r="9" stroke-width="2" />
                <path stroke-linecap="round" stroke-width="2" d="M12 8v4" />
                <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="isPendingTab ? 220 : 100" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="handlePreview(row)">查看</el-button>
            <!-- 待审批：可通过 / 退回 -->
            <template v-if="isPendingTab">
              <el-button
                type="text"
                size="small"
                class="btn-success"
                @click="handleAudit(row, APPROVE_PASS)"
              >通过</el-button>
              <el-button
                type="text"
                size="small"
                class="btn-danger"
                @click="handleAudit(row, APPROVE_REJECT)"
              >退回</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页（无数据时保持展示，避免列表高度跳变） -->
      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="query.pageNo"
          :page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 详情预览（复用 app-preview） -->
    <AppPreview ref="preview" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AppPreview from '@/components/app-preview.vue';
import { getAdminAgentList, auditAgent } from '@/api/agent';
import { pageByOrg, materialChapterTree } from '@/api/common';
import {
  APPROVE_PASS,
  APPROVE_REJECT,
  APPROVAL_STATUS_PENDING,
  APPROVAL_STATUS_APPROVED,
  formatTime
} from '@/constants/agentStatus';

// approvalStatus 查询参数：待审批 / 已审批
const APPROVAL_QUERY_MAP = {
  pending: APPROVAL_STATUS_PENDING,
  approved: APPROVAL_STATUS_APPROVED
};

// 智能体类型编码：1 智能体，2 实用工具，3 课件资源；配色与 agent-card.vue 徽标保持一致
const AGENT_TYPE_LABEL_MAP = { 1: '智能体', 2: '实用工具', 3: '课件资源' };
const AGENT_TYPE_COLOR_MAP = { 1: '#8b5cf6', 2: '#2f6bed', 3: '#e07b39' };
const AGENT_TYPE_DEFAULT_LABEL = '实用工具';
const AGENT_TYPE_DEFAULT_COLOR = '#2f6bed';

/** 构造默认查询参数 */
function createQuery() {
  return {
    name: '',
    agentType: '',
    approvalResult: '',
    subjectCode: '',
    materialId: '',
    chapterId: '',
    pageNo: 1,
    pageSize: 10
  };
}

export default {
  name: 'AgentApprove',
  components: {
    AppPreview
  },
  data() {
    return {
      APPROVE_PASS,
      APPROVE_REJECT,
      activeTab: 'pending',
      materialList: [],
      unitOptions: [],
      loading: false,
      list: [],
      total: 0,
      // 顶部 Tab 徽章计数：待审批 / 已审批 全量总数（不受列表筛选影响）
      pendingTotal: 0,
      approvedTotal: 0,
      query: createQuery(),
      headerCellStyle: {
        background: '#f5f7fa',
        color: '#303133',
        fontWeight: '600'
      }
    };
  },
  computed: {
    ...mapGetters('agent', ['subjectList']),
    /** 当前是否处于「待审批」标签页 */
    isPendingTab() {
      return this.activeTab === 'pending';
    }
  },
  mounted() {
    // 学科列表由 store 统一初始化（loadSubjectList），此处兜底触发一次
    if (!this.subjectList || !this.subjectList.length) {
      this.$store.dispatch('agent/loadSubjectList');
    }
    this.fetchList();
    // 首次加载同时拉取两个 Tab 的全量总数，用于展示待审批/已审批徽章
    this.fetchTabTotals();
  },
  methods: {
    formatTime,
    /** 智能体类型文本：与 agent-card.vue 徽标文案保持一致 */
    agentTypeLabel(type) {
      return AGENT_TYPE_LABEL_MAP[type] || AGENT_TYPE_DEFAULT_LABEL;
    },
    /** 智能体类型底色：与 agent-card.vue 徽标配色保持一致 */
    agentTypeColor(type) {
      return AGENT_TYPE_COLOR_MAP[type] || AGENT_TYPE_DEFAULT_COLOR;
    },
    /** 获取期次（教材）列表：按所选学科 atlasId 拉取 */
    loadMaterials() {
      if (!this.query.subjectCode) {
        this.materialList = [];
        return;
      }
      pageByOrg(this.query.subjectCode)
        .then((res) => {
          this.materialList = res.data || [];
        })
        .catch((error) => {
          console.warn('[AgentApprove] 获取期次列表失败：', error);
        });
    },
    /** 获取章节树：按所选期次教材 ID 拉取首节点子集 */
    loadUnitTree() {
      if (!this.query.materialId) {
        this.unitOptions = [];
        return;
      }
      materialChapterTree(this.query.materialId)
        .then((res) => {
          const materialObj = (res.data && res.data[0]) || {};
          this.unitOptions = materialObj.childrenList || [];
        })
        .catch((error) => {
          console.warn('[AgentApprove] 获取章节树失败：', error);
        });
    },
    /** 学科变化：重置期次/章节并重新加载期次列表 */
    handleSubjectChange() {
      this.query.materialId = '';
      this.query.chapterId = '';
      this.materialList = [];
      this.unitOptions = [];
      this.loadMaterials();
      this.handleSearch();
    },
    /** 期次变化：重置章节并重新加载章节树 */
    handleMaterialChange() {
      this.query.chapterId = '';
      this.unitOptions = [];
      this.loadUnitTree();
      this.handleSearch();
    },
    /** 拉取列表：通过 activeTab 映射 approvalStatus 查询参数 */
    async fetchList() {
      this.loading = true;
      try {
        const params = {
          ...this.query,
          approvalStatus: APPROVAL_QUERY_MAP[this.activeTab]
        };
        // 已审批 Tab 下选择具体状态（1 通过 / 2 退回）时，覆盖已审批聚合查询值 99
        if (params.approvalResult) {
          params.approvalStatus = params.approvalResult;
        }
        delete params.approvalResult;
        // 清除空值字段，避免后端把空字符串当作筛选条件
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });
        const res = await getAdminAgentList(params);
        const data = res.data || {};
        this.list = data.dataList
        this.total = data.pagination.total
      } catch (error) {
        console.warn('[AgentApprove] 获取智能体列表失败：', error);
        this.list = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },
    /** 并行拉取待审批 / 已审批 两个列表的全量总数，仅用于 Tab 徽章展示 */
    async fetchTabTotals() {
      try {
        const [pendingRes, approvedRes] = await Promise.all([
          getAdminAgentList({
            approvalStatus: APPROVAL_STATUS_PENDING,
            pageNo: 1,
            pageSize: 1
          }),
          getAdminAgentList({
            approvalStatus: APPROVAL_STATUS_APPROVED,
            pageNo: 1,
            pageSize: 1
          })
        ]);
        this.pendingTotal = (pendingRes && pendingRes.data && pendingRes.data.pagination && pendingRes.data.pagination.total) || 0;
        this.approvedTotal = (approvedRes && approvedRes.data && approvedRes.data.pagination && approvedRes.data.pagination.total) || 0;
      } catch (error) {
        console.warn('[AgentApprove] 获取审批 Tab 总数失败：', error);
      }
    },
    /** 切换待审批 / 已审批：重置查询条件并加载 */
    handleTabChange() {
      this.query = createQuery();
      this.materialList = [];
      this.unitOptions = [];
      this.total = 0;
      this.list = [];
      this.fetchList();
    },
    handleSearch() {
      this.query.pageNo = 1;
      this.fetchList();
    },
    handleReset() {
      this.query = createQuery();
      this.fetchList();
    },
    handlePageChange(page) {
      this.query.pageNo = page;
      this.fetchList();
    },
    handleSizeChange(size) {
      this.query.pageSize = size;
      this.query.pageNo = 1;
      this.fetchList();
    },
    /** 详情预览：复用 app-preview 组件 */
    handlePreview(row) {
      this.$refs.preview.open(row);
    },
    /** 点击状态标签：仅退回状态展示退回原因（交互与 agent-card.vue 保持一致） */
    handleStatusClick(row) {
      if (row.approvalStatus !== APPROVE_REJECT) {
        return;
      }
      this.$alert(row.reviewComment || '暂无退回说明', '退回原因', {
        confirmButtonText: '知道了',
        type: 'warning'
      }).catch(() => {});
    },
    /** 审批：通过 / 驳回（提交参数对齐后端 ApproveParams：id + approvalStatus + reviewComment） */
    handleAudit(row, approvalStatus) {
      const isReject = approvalStatus === APPROVE_REJECT;
      const actionText = isReject ? '退回' : '通过';
      const tip = isReject
        ? `确定要驳回「${row.name}」吗？可填写驳回理由。`
        : `确定要通过「${row.name}」的审批吗？`;
      this.$confirm(tip, `审核${actionText}`, {
        confirmButtonText: `确定${actionText}`,
        cancelButtonText: '取消',
        type: isReject ? 'warning' : 'info',
        showInput: isReject,
        inputPlaceholder: '请输入驳回理由（选填）',
        inputValidator: () => true
      }).then(async ({ value }) => {
        try {
          await auditAgent({
            id: row.id,
            approvalStatus,
            reviewComment: value || ''
          });
          this.$message({ type: 'success', message: `${actionText}成功` });
          this.fetchList();
          // 审批后同步刷新两个 Tab 的全量总数，保证徽章展示不脱节
          this.fetchTabTotals();
          // 同步刷新侧边栏“智能体审批”菜单的待审批角标
          this.$store.dispatch('agent/loadPendingApprovalCount');
        } catch (error) {
          console.warn('[AgentApprove] 审核智能体失败：', error);
        }
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.agent-approve {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 页面标题 + Tab 同行展示 */
.manage-head {
  display: flex;
  align-items: center;
  gap: 20px;
}

.manage-title {
  font-size: 24px;
  margin: 0;
  color: var(--ink);
}

/* 待审批 / 已审批 Tab：紧凑分段器样式，与标题同基线 */
.approve-tabs {
  flex-shrink: 0;
}

.approve-tabs :deep(.el-tabs__header) {
  margin: 0;
}

/* 去掉页级 Tab 的底部横线与滑块 */
.approve-tabs :deep(.el-tabs__nav-wrap) {
  overflow: visible;
  margin-bottom: 0;
}

.approve-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.approve-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.approve-tabs :deep(.el-tabs__nav-scroll) {
  overflow: visible;
}

/* 分段容器：浅背景 + 圆角包裹两个选项 */
.approve-tabs :deep(.el-tabs__nav) {
  display: flex;
  float: none;
  padding: 3px;
  background: var(--soft);
  border: none;
  border-radius: 9px;
}

.approve-tabs :deep(.el-tabs__item) {
  float: none;
  height: 30px;
  line-height: 30px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  border-radius: 7px;
  transition: color .2s, background-color .2s, box-shadow .2s;
}

/* Element 默认会清除首尾项内边距，分段器需恢复 */
.approve-tabs :deep(.el-tabs__item.is-top:nth-child(2)),
.approve-tabs :deep(.el-tabs__item.is-top:last-child) {
  padding: 0 18px;
}

.approve-tabs :deep(.el-tabs__item:hover) {
  color: var(--primary);
}

.approve-tabs :deep(.el-tabs__item.is-active) {
  background: var(--surface);
  color: var(--primary);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(44, 76, 139, .12);
}

/* 搜索区卡片 */
.filter-bar {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px 4px;
  box-shadow: 0 2px 12px rgba(44, 76, 139, .04);
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 14px;
  margin-right: 18px;
}

.filter-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--ink);
}

/* 表格区卡片 */
.table-wrap {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px 20px;
  box-shadow: 0 2px 12px rgba(44, 76, 139, .04);
}

.text-muted {
  color: var(--muted);
  font-size: 12px;
}

/* 智能体类型徽标：配色与 agent-card.vue 的 .cc-badge 保持一致 */
.type-tag {
  display: inline-block;
  height: 22px;
  line-height: 22px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  font-weight: 500;
}

/* 审批状态胶囊：配色与 agent-card.vue 的 .cc-status 保持一致 */
.approve-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.approve-status-tag.is-passed {
  background: rgba(22, 163, 74, .95);
}

.approve-status-tag.is-rejected {
  background: rgba(220, 38, 38, .95);
  cursor: pointer;
}

.approve-status-hint {
  flex-shrink: 0;
}

.btn-success {
  color: #16a34a;
}

.btn-success:hover {
  color: #15803d;
}

.btn-danger {
  color: #dc2626;
}

.btn-danger:hover {
  color: #b91c1c;
}

/* 分页容器 */
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.pagination-wrap :deep(.el-pagination) {
  padding: 6px 0;
}

.pagination-wrap :deep(.el-pagination__total) {
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 1200px) {
  .filter-form :deep(.el-form-item) {
    margin-right: 12px;
  }
}
</style>

<template>
  <div class="agent-manage">
    <!-- 页面标题 -->
    <div class="manage-head">
      <h1 class="manage-title">智能体管理</h1>
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
        <el-form-item label="发布状态">
          <el-select v-model="query.publishStatus" placeholder="全部" clearable style="width: 140px" @change="handleSearch">
            <el-option label="已上架" :value="1" />
            <el-option label="未上架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select
            v-model="query.orderBy"
            placeholder="默认按创建时间"
            clearable
            style="width: 180px"
            @change="handleSearch"
          >
            <el-option v-for="item in sortOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-table-column label="上下架状态" width="110" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="Number(row.publishStatus) === 1 ? 'success' : 'info'" size="small">
              {{ Number(row.publishStatus) === 1 ? '已上架' : '未上架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template slot-scope="{ row }">{{ formatTime(row.createTime || row.created) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="handlePreview(row)">查看</el-button>
            <el-button type="text" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.publishStatus === 1"
              type="text"
              size="small"
              class="btn-danger"
              @click="handleToggleStatus(row, 0)"
            >下架</el-button>
            <el-button
              v-else-if="row.publishStatus === 0"
              type="text"
              size="small"
              class="btn-success"
              @click="handleToggleStatus(row, 1)"
            >上架</el-button>
            <el-button type="text" size="small" class="btn-danger" @click="handleDelete(row)">删除</el-button>
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
    <AppPreview floatingToolbar ref="preview" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AppPreview from '@/components/app-preview.vue';
import { getAdminAgentList, deleteAgent, updateAgentStatus } from '@/api/agent';
import { pageByOrg, materialChapterTree } from '@/api/common';
import {
  APPROVAL_STATUS_MANAGE,
  formatTime
} from '@/constants/agentStatus';

// 排序方式选项：value 为后端 orderBy 字段，与 store 中 SORT_TYPE_MAP 取值保持一致
const SORT_OPTIONS = [
  { label: '按收藏次数排序', value: 'favoriteCount' },
  { label: '按使用次数排序', value: 'useCount' }
];

// 智能体类型编码：1 智能体，2 实用工具，3 课件资源；配色与 agent-card.vue 徽标保持一致
const AGENT_TYPE_LABEL_MAP = { 1: '智能体', 2: '实用工具', 3: '课件资源' };
const AGENT_TYPE_COLOR_MAP = { 1: '#8b5cf6', 2: '#2f6bed', 3: '#e07b39' };
const AGENT_TYPE_DEFAULT_LABEL = '实用工具';
const AGENT_TYPE_DEFAULT_COLOR = '#2f6bed';

// 未选择排序时的默认后端排序字段
const DEFAULT_ORDER_BY = 'create_time';

/** 构造默认查询参数 */
function createQuery() {
  return {
    name: '',
    agentType: '',
    subjectCode: '',
    materialId: '',
    chapterId: '',
    publishStatus: '',
    orderBy: '',
    pageNo: 1,
    pageSize: 10
  };
}

export default {
  name: 'AgentManage',
  components: {
    AppPreview
  },
  data() {
    return {
      materialList: [],
      unitOptions: [],
      // 排序下拉选项
      sortOptions: SORT_OPTIONS,
      loading: false,
      list: [],
      total: 0,
      query: createQuery(),
      headerCellStyle: {
        background: '#f5f7fa',
        color: '#303133',
        fontWeight: '600'
      }
    };
  },
  computed: {
    ...mapGetters('agent', ['subjectList'])
  },
  mounted() {
    // 学科列表由 store 统一初始化（loadSubjectList），此处兜底触发一次
    if (!this.subjectList || !this.subjectList.length) {
      this.$store.dispatch('agent/loadSubjectList');
    }
    // 编辑保存后（upload-dialog 为全局组件，通过根事件总线通知）刷新列表
    this.$root.$on('agent-saved', this.fetchList);
    this.fetchList();
  },
  beforeDestroy() {
    this.$root.$off('agent-saved', this.fetchList);
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
          console.warn('[AgentManage] 获取期次列表失败：', error);
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
          console.warn('[AgentManage] 获取章节树失败：', error);
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
    /** 拉取列表：管理视图固定 approvalStatus=1 */
    async fetchList() {
      this.loading = true;
      try {
        const params = {
          ...this.query,
          approvalStatus: APPROVAL_STATUS_MANAGE,
          orderBy: this.query.orderBy || DEFAULT_ORDER_BY,
          orderDirection: 'desc'
        };
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
        console.warn('[AgentManage] 获取智能体列表失败：', error);
        this.list = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.query.pageNo = 1;
      this.fetchList();
    },
    handleReset() {
      this.query = createQuery();
      this.materialList = [];
      this.unitOptions = [];
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
    /** 编辑：写入 store 并打开上传弹窗（复用 upload-dialog 编辑模式，管理员编辑保持已审批状态） */
    handleEdit(row) {
      this.$store.commit('agent/SET_EDIT_AGENT', row);
      this.$store.commit('agent/SET_ADMIN_EDIT', true);
      this.$store.commit('agent/SET_UPLOAD_VISIBLE', true);
    },
    /** 删除：二次确认后调用接口 */
    handleDelete(row) {
      this.$confirm(`确定要删除「${row.name}」吗？删除后不可恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteAgent(row.id);
          this.$message({ type: 'success', message: '删除成功' });
          this.fetchList();
        } catch (error) {
          console.warn('[AgentManage] 删除智能体失败：', error);
        }
      }).catch(() => {});
    },
    /** 上 / 下架 */
    handleToggleStatus(row, publishStatus) {
      const actionText = publishStatus === 1 ? '上架' : '下架';
      this.$confirm(`确定要${actionText}「${row.name}」吗？`, `${actionText}确认`, {
        confirmButtonText: `确定${actionText}`,
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await updateAgentStatus({ id: row.id, publishStatus });
          this.$message({ type: 'success', message: `${actionText}成功` });
          this.fetchList();
        } catch (error) {
          console.warn('[AgentManage] 切换状态失败：', error);
        }
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.agent-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 页面标题 */
.manage-head {
  display: flex;
  align-items: center;
}

.manage-title {
  font-size: 24px;
  margin: 0;
  color: var(--ink);
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

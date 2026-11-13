<template>
  <div class="banner-manage">
    <!-- 搜索条件区 + 新增入口 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="query" class="filter-form" size="small" @submit.native.prevent>
        <el-form-item label="Banner主题">
          <el-input
            v-model="query.bannerTitle"
            placeholder="请输入主题名称"
            clearable
            style="width: 220px"
            @keyup.enter.native="handleSearch"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" icon="el-icon-plus" class="add-btn" @click="handleCreate">新增 Banner</el-button>
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
        <el-table-column label="背景图" width="180" align="center">
          <template slot-scope="{ row }">
            <el-image
              v-if="row.bannerLogo"
              :src="row.bannerLogo"
              :preview-src-list="[row.bannerLogo]"
              :alt="row.bannerTitle"
              fit="cover"
              class="table-banner"
            />
            <div v-else class="table-banner table-banner-ph">-</div>
          </template>
        </el-table-column>
        <el-table-column prop="bannerTitle" label="Banner主题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="bannerLink" label="跳转地址" min-width="220" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.bannerLink || '-' }}</template>
        </el-table-column>
        <el-table-column prop="sortNo" label="排序号" width="90" align="center">
          <template slot-scope="{ row }">{{ row.sortNo || 0 }}</template>
        </el-table-column>
        <el-table-column prop="createUserName" label="创建人" width="120" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.createUserName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170">
          <template slot-scope="{ row }">{{ row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" size="small" class="btn-danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-wrap">
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

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      :title="dialogMode === 'edit' ? '编辑 Banner' : '新增 Banner'"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form ref="bannerForm" :model="form" :rules="formRules" label-width="110px" size="small">
        <el-form-item label="Banner主题" prop="bannerTitle">
          <el-input v-model="form.bannerTitle" placeholder="请输入 Banner 主题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="背景图" prop="logoFiles">
          <ImageUploader
            v-model="form.logoFiles"
            mode="image"
            :max-size="10"
            :max-count="1"
            tip="Banner 背景图，支持 JPG/PNG，最大 10MB"
            @change="validateFormField('logoFiles')"
          />
        </el-form-item>
        <el-form-item label="跳转地址" prop="bannerLink">
          <el-input v-model="form.bannerLink" placeholder="选填，点击 Banner 跳转的链接" maxlength="500" />
        </el-form-item>
        <el-form-item label="排序号" prop="sortNo">
          <el-input-number v-model="form.sortNo" :min="0" :step="1" controls-position="right" />
          <span class="form-hint">数值越小越靠前</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" :loading="submitting" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { store as authStore } from 'auth-layout-wxj';
import ImageUploader from '@/components/image-uploader.vue';
import { getBannerPageList, addBanner, updateBanner, deleteBanner } from '@/api/banner';

/** 构造默认查询参数 */
function createQuery() {
  return {
    bannerTitle: '',
    pageNo: 1,
    pageSize: 10
  };
}

/** 构造空表单 */
function createEmptyForm() {
  return {
    id: '',
    bannerTitle: '',
    bannerLink: '',
    sortNo: 0,
    logoFiles: []
  };
}

export default {
  name: 'BannerManage',
  components: {
    ImageUploader
  },
  data() {
    return {
      loading: false,
      submitting: false,
      list: [],
      total: 0,
      query: createQuery(),
      headerCellStyle: {
        background: '#f5f7fa',
        color: '#303133',
        fontWeight: '600'
      },
      // 弹窗状态：mode 区分新增 / 编辑
      dialogVisible: false,
      dialogMode: 'create',
      form: createEmptyForm(),
      formRules: {
        bannerTitle: [{ required: true, message: '请输入 Banner 主题', trigger: 'blur' }],
        logoFiles: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value && value.length) {
              callback();
              return;
            }
            callback(new Error('请上传 Banner 背景图'));
          },
          trigger: 'change'
        }]
      }
    };
  },
  mounted() {
    this.fetchList();
  },
  methods: {
    /** 当前学校 ID：Banner 按学校维度隔离 */
    currentSchoolId() {
      return authStore.getters.schoolId || (authStore.state.schoolInfo && authStore.state.schoolInfo.id) || '';
    },
    /** 拉取 Banner 列表 */
    async fetchList() {
      this.loading = true;
      try {
        const params = { ...this.query };
        const schoolId = this.currentSchoolId();
        if (schoolId) {
          params.schoolId = schoolId;
        }
        // 清除空值，避免后端把空字符串当作筛选条件
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });
        const res = await getBannerPageList(params);
        const data = res.data || {};
        this.list = data.dataList || [];
        this.total = (data.pagination && data.pagination.total) ?? this.list.length;
      } catch (error) {
        console.warn('[BannerManage] 获取 Banner 列表失败：', error);
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
    /** 新增：打开空白弹窗 */
    handleCreate() {
      this.dialogMode = 'create';
      this.form = createEmptyForm();
      this.dialogVisible = true;
    },
    /** 编辑：回填当前行数据 */
    handleEdit(row) {
      this.dialogMode = 'edit';
      this.form = {
        id: row.id,
        bannerTitle: row.bannerTitle || '',
        bannerLink: row.bannerLink || '',
        sortNo: row.sortNo ?? 0,
        logoFiles: row.bannerLogo
          ? [{ attachmentKey: row.bannerLogo, fileName: row.bannerTitle || 'banner', size: 0, contentType: '' }]
          : []
      };
      this.dialogVisible = true;
    },
    /** 删除：二次确认后调用接口 */
    handleDelete(row) {
      this.$confirm(`确定要删除 Banner「${row.bannerTitle}」吗？`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteBanner(row.id);
          this.$message({ type: 'success', message: '删除成功' });
          this.fetchList();
        } catch (error) {
          console.warn('[BannerManage] 删除 Banner 失败：', error);
        }
      }).catch(() => {});
    },
    /** 触发表单项校验，用于上传组件变化后刷新校验状态 */
    validateFormField(prop) {
      if (this.$refs.bannerForm) {
        this.$refs.bannerForm.validateField(prop);
      }
    },
    /** 提交新增 / 编辑 */
    handleSubmit() {
      this.$refs.bannerForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const payload = {
          bannerTitle: this.form.bannerTitle.trim(),
          bannerLogo: (this.form.logoFiles[0] && this.form.logoFiles[0].attachmentKey) || '',
          bannerLink: this.form.bannerLink.trim(),
          sortNo: this.form.sortNo ?? 0
        };
        this.submitting = true;
        try {
          if (this.dialogMode === 'edit') {
            await updateBanner({ id: this.form.id, ...payload });
            this.$message({ type: 'success', message: '修改成功' });
          } else {
            await addBanner(payload);
            this.$message({ type: 'success', message: '新增成功' });
          }
          this.dialogVisible = false;
          this.fetchList();
        } catch (error) {
          console.warn('[BannerManage] 提交 Banner 失败：', error);
        } finally {
          this.submitting = false;
        }
      });
    },
    /** 弹窗关闭后重置表单与校验状态 */
    handleDialogClosed() {
      this.form = createEmptyForm();
      this.dialogMode = 'create';
      this.$nextTick(() => {
        if (this.$refs.bannerForm) {
          this.$refs.bannerForm.clearValidate();
        }
      });
    }
  }
};
</script>

<style scoped>
.banner-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 搜索区卡片 */
.filter-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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

.add-btn {
  flex: none;
  margin-bottom: 14px;
}

/* 表格区卡片 */
.table-wrap {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px 20px;
  box-shadow: 0 2px 12px rgba(44, 76, 139, .04);
}

.table-banner {
  width: 150px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
  overflow: hidden;
  background: var(--canvas);
}

.table-banner-ph {
  display: grid;
  place-items: center;
  color: var(--muted);
  font-size: 14px;
}

.btn-danger {
  color: #dc2626;
}

.btn-danger:hover {
  color: #b91c1c;
}

/* 弹窗内提示 */
.form-hint {
  margin-left: 10px;
  font-size: 12px;
  color: var(--muted);
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

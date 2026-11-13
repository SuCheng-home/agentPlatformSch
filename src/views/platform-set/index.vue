<template>
  <div class="platform-set">
    <div class="page-head">
      <h2 class="page-title">平台设置</h2>
      <p class="page-desc">配置本校 AI 平台对外展示的 Logo、名称与操作手册文档，保存后门户/桌面端将同步生效。</p>
    </div>

    <div v-loading="loading" class="form-card">
      <el-form ref="setForm" :model="form" :rules="formRules" label-width="120px" size="small">
        <el-form-item label="平台名称" prop="platformName">
          <el-input
            v-model="form.platformName"
            placeholder="请输入平台名称，如：XX小学AI智能体平台"
            maxlength="50"
            show-word-limit
            style="max-width: 420px"
          />
        </el-form-item>

        <el-form-item label="平台Logo" prop="logoFiles">
          <ImageUploader layout="horizontal"
            v-model="form.logoFiles"
            mode="image"
            :max-size="5"
            :max-count="1"
            tip="平台 Logo 图片，建议正方形，支持 JPG/PNG，最大 5MB"
            @change="validateFormField('logoFiles')"
          />
        </el-form-item>

        <el-form-item label="操作手册">
          <ImageUploader
            v-model="form.docFiles"
            mode="attachment"
            :max-count="5"
            tip="平台操作手册文档，支持 PDF/Word/PPT/HTML 等，最多 5 个"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存设置</el-button>
          <el-button :disabled="submitting" @click="loadSetInfo">重新加载</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import ImageUploader from '@/components/image-uploader.vue';
import { getPlatformSetInfo, savePlatformSetInfo } from '@/api/platformSet';

/** 由图片 URL 构造 ImageUploader 需要的 FileJson 单项 */
function buildFileJson(url, fileName) {
  if (!url) return null;
  const clean = String(url).split('?')[0];
  return {
    attachmentKey: url,
    fileName: fileName || clean.slice(clean.lastIndexOf('/') + 1) || '文件',
    size: 0,
    contentType: ''
  };
}

/** 解析操作手册存储字段：兼容 JSON 数组字符串与历史单 URL 字符串 */
function parseOptDocs(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item && item.attachmentKey)
        .map((item) => ({
          attachmentKey: item.attachmentKey,
          fileName: item.fileName || '',
          size: item.size || 0,
          contentType: item.contentType || ''
        }));
    }
  } catch (error) {
    // 非 JSON：视为单个文档 URL
    return [buildFileJson(raw)].filter(Boolean);
  }
  return [];
}

export default {
  name: 'PlatformSet',
  components: {
    ImageUploader
  },
  data() {
    return {
      loading: false,
      submitting: false,
      form: {
        platformName: '',
        logoFiles: [],
        docFiles: []
      },
      formRules: {
        platformName: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
        logoFiles: [{
          required: true,
          validator: (rule, value, callback) => {
            if (value && value.length) {
              callback();
              return;
            }
            callback(new Error('请上传平台 Logo'));
          },
          trigger: 'change'
        }]
      }
    };
  },
  mounted() {
    this.loadSetInfo();
  },
  methods: {
    /** 拉取本校平台设置并回填表单（后端整行覆盖，需完整回显） */
    async loadSetInfo() {
      this.loading = true;
      try {
        const res = await getPlatformSetInfo();
        const info = (res && res.data) || null;
        this.form = {
          platformName: (info && info.platformName) || '',
          logoFiles: info && info.platformLogo ? [buildFileJson(info.platformLogo, '平台Logo')] : [],
          docFiles: info ? parseOptDocs(info.platformOptDocs) : []
        };
        this.$nextTick(() => {
          if (this.$refs.setForm) {
            this.$refs.setForm.clearValidate();
          }
        });
      } catch (error) {
        console.warn('[PlatformSet] 获取平台设置失败：', error);
      } finally {
        this.loading = false;
      }
    },
    /** 上传组件变化后刷新对应字段校验状态 */
    validateFormField(prop) {
      if (this.$refs.setForm) {
        this.$refs.setForm.validateField(prop);
      }
    },
    /** 保存：整行覆盖，未设置字段以空串提交 */
    handleSubmit() {
      this.$refs.setForm.validate(async (valid) => {
        if (!valid) return;
        const payload = {
          platformName: this.form.platformName.trim(),
          platformLogo: (this.form.logoFiles[0] && this.form.logoFiles[0].attachmentKey) || '',
          platformOptDocs: this.form.docFiles.length ? JSON.stringify(this.form.docFiles) : ''
        };
        this.submitting = true;
        try {
          await savePlatformSetInfo(payload);
          this.$message({ type: 'success', message: '保存成功' });
          // this.loadSetInfo();
          location.reload();
        } catch (error) {
          console.warn('[PlatformSet] 保存平台设置失败：', error);
        } finally {
          this.submitting = false;
        }
      });
    }
  }
};
</script>

<style scoped>
.platform-set {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(44, 76, 139, .04);
}

.page-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}

.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.form-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px 20px 8px;
  box-shadow: 0 2px 12px rgba(44, 76, 139, .04);
}

.form-card :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--ink);
}
</style>

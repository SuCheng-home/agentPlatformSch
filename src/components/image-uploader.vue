<template>
  <div class="image-uploader" :class="rootClass" :style="rootStyle">
    <!-- 上传触发区域：el-upload 承载点击选择与拖拽，默认插槽透传给宿主自定义触发 UI -->
    <el-upload
      class="uploader-core"
      action="#"
      :file-list="internalFileList"
      :multiple="multiple"
      :limit="maxCount"
      :accept="acceptStr"
      :disabled="disabled || !cos"
      :show-file-list="false"
      :http-request="handleUpload"
      :before-upload="beforeUpload"
      :on-remove="handleRemoveFromUpload"
      :on-exceed="handleExceed"
    >
      <div class="upload-trigger">
        <slot>
          <div class="default-trigger">
            <i class="el-icon-plus"></i>
          </div>
        </slot>
      </div>
    </el-upload>

    <!-- 已上传文件列表区（左右结构中位于触发区右侧） -->
    <div class="uploader-side">
      <!-- 图片模式=缩略图网格，附件模式=文件行 -->
      <template v-if="showFileList && files.length">
        <!-- 图片模式：缩略图网格 -->
        <div v-if="mode === 'image'" class="thumb-grid">
          <div
            v-for="file in files"
            :key="file.uid"
            class="thumb-item"
            :class="{ 'is-error': file.status === 'error' }"
          >
            <img
              v-if="previewUrl(file)"
              class="thumb-img"
              :src="previewUrl(file)"
              :alt="file.name"
              @click="handlePreview(file)"
            >
            <div v-else class="thumb-placeholder">
              <svg class="icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.image" />
              </svg>
            </div>

            <!-- 上传中遮罩 -->
            <div v-if="isUploading(file)" class="thumb-mask">
              <span class="spinner"></span>
              <span class="thumb-progress">{{ file.progress }}%</span>
            </div>
            <!-- 成功标记 -->
            <span v-else-if="file.status === 'success'" class="thumb-badge">
              <svg class="icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.checkCircle" />
              </svg>
            </span>
            <!-- 错误标记 -->
            <div v-else-if="file.status === 'error'" class="thumb-mask is-error">
              <svg class="icon" width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.alertCircle" />
              </svg>
            </div>

            <!-- 移除按钮 -->
            <button type="button" class="thumb-remove" @click.stop="handleRemove(file)">
              <svg class="icon" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.close" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 附件模式：文件行列表 -->
        <div v-else class="file-list">
          <div
            v-for="file in files"
            :key="file.uid"
            class="file-row"
            :class="{ 'is-error': file.status === 'error' }"
          >
            <div class="file-icon" :class="fileIconClass(file)">
              <span v-if="isUploading(file)" class="spinner"></span>
              <svg v-else class="icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="file.status === 'error' ? icons.alertCircle : icons.fileText" />
              </svg>
            </div>
            <div class="file-meta">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatSize(file) }}</div>
            </div>
            <div class="file-status">
              <span v-if="isUploading(file)" class="is-uploading">{{ file.progress }}%</span>
              <span v-else-if="file.status === 'success'" class="is-success">已完成</span>
              <span v-else-if="file.status === 'error'" class="is-error">失败</span>
            </div>
            <button type="button" class="file-remove" @click.stop="handleRemove(file)">
              <svg class="icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.close" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 提示信息：上下结构位于触发区与列表之间，左右结构整行换行到底部 -->
    <p v-if="tip" class="upload-tip">{{ tip }}</p>

    <!-- 图片预览弹窗：仅图片模式启用 -->
    <el-dialog :visible.sync="previewVisible" append-to-body>
      <img width="100%" :src="previewImageUrl" alt="preview">
    </el-dialog>
  </div>
</template>

<script>
import COS from 'cos-js-sdk-v5';
import { store as authStore } from 'auth-layout-wxj';
import { ICONS } from '@/constants/icons';
import { getWxCosFileSign, addWxfileInfo } from '@/api/common';
import { MOCK_DATA_ENABLED } from '@/config/local-preview';

// 图片模式默认允许的后缀
const IMAGE_EXT_LIST = ['png', 'jpeg', 'jpg', 'gif', 'svg', 'webp', 'bmp'];
// 附件模式默认允许的后缀（宽松放行，业务侧可通过 accept 收紧）
const ATTACHMENT_EXT_LIST = ['html', 'htm', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'zip', 'rar', 'txt'];
// 图片模式默认单文件大小上限（MB）
const IMAGE_MAX_SIZE = 10;
// 附件模式默认单文件大小上限（MB）
const ATTACHMENT_MAX_SIZE = 2000;

// 从文件名/URL 提取后缀（小写）
function extractExt(name) {
  if (!name) return '';
  return String(name).replace(/.+\./, '').toLowerCase();
}

// 从 URL 提取文件名（去除 query）
function extractFileName(url) {
  if (!url) return '';
  const clean = String(url).split('?')[0];
  return clean.slice(clean.lastIndexOf('/') + 1);
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * 图片/附件上传组件（基于腾讯云 COS SDK 直传，参考 xiaohuasheng-eval-pc/ImageUploader.vue）
 * - image 模式：缩略图网格展示，支持点击预览
 * - attachment 模式：文件行列表展示
 * - vertical 布局（默认）：触发区在上，提示与文件列表依次在下
 * - horizontal 布局：左侧触发区、右侧文件列表，提示语换行到底部；图片模式下两者共用
 *   同一方块尺寸（cellSize，默认 120px），保证上传按钮与缩略图宽高一致
 * - v-model 绑定 FileJson 数组：{ attachmentKey, fileName, size, contentType }
 *   其中 attachmentKey 存放 COS 完整 URL（后端上传直链，无需额外拼接）
 */
export default {
  name: 'ImageUploader',
  props: {
    // 上传模式：image=图片，attachment=附件
    mode: {
      type: String,
      default: 'attachment'
    },
    // 展示布局：vertical=上下结构，horizontal=左右结构（提示语置底）
    layout: {
      type: String,
      default: 'vertical'
    },
    // 左右结构图片模式下的统一方块尺寸（px）：上传触发区与缩略图共用，传 0 时使用默认值
    cellSize: {
      type: Number,
      default: 0
    },
    // 业务参数（bizCode/bizId），用于 COS 对象标签与后端文件登记
    params: {
      type: Object,
      default: () => ({})
    },
    // 允许的文件后缀数组（含或不含点号均可），缺省时按模式取默认值
    accept: {
      type: Array,
      default: null
    },
    // 单文件最大大小（MB），缺省时按模式取默认值
    maxSize: {
      type: Number,
      default: null
    },
    // 最大上传数量
    maxCount: {
      type: Number,
      default: 1000
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 是否展示已上传文件列表
    showFileList: {
      type: Boolean,
      default: true
    },
    // 是否禁用上传
    disabled: {
      type: Boolean,
      default: false
    },
    // 提示信息
    tip: {
      type: String,
      default: ''
    },
    // COS 存储路径前缀
    pathPrefix: {
      type: String,
      default: 'agentPlatformSch'
    },
    // 是否使用系统桶（true=sysBucket=2，false=sysBucket=1）
    useSysBucket: {
      type: Boolean,
      default: false
    },
    // v-model 绑定值：FileJson 数组
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      icons: ICONS,
      files: [],
      cos: null,
      bucket: '',
      region: 'ap-shanghai',
      previewVisible: false,
      previewImageUrl: ''
    };
  },
  computed: {
    // 布局修饰类：左右结构、图片模式（两者叠加时触发区与缩略图同尺寸）
    rootClass() {
      return {
        'is-horizontal': this.layout === 'horizontal',
        'is-image-mode': this.mode === 'image'
      };
    },

    // 统一方块尺寸变量（未指定 cellSize 时交给 CSS 默认值）
    rootStyle() {
      if (!this.cellSize) return {};
      return { '--uploader-cell-size': `${this.cellSize}px` };
    },

    // 当前学校信息：用于 COS 对象标签与后端文件登记
    schoolInfo() {
      return (authStore.state && authStore.state.schoolInfo) || {};
    },
    // 允许的文件后缀（统一去点小写）
    extList() {
      const defaults = this.mode === 'image' ? IMAGE_EXT_LIST : ATTACHMENT_EXT_LIST;
      const list = this.accept || defaults;
      return list.map((item) => String(item).replace(/^\./, '').toLowerCase());
    },
    // el-upload 的 accept 属性：以逗号分隔的 .ext 串
    acceptStr() {
      return this.extList.map((ext) => `.${ext}`).join(',');
    },
    // 生效的单文件大小上限（MB）
    effectiveMaxSize() {
      if (this.maxSize != null) return this.maxSize;
      return this.mode === 'image' ? IMAGE_MAX_SIZE : ATTACHMENT_MAX_SIZE;
    },
    // 传入 el-upload 的 file-list（受控展示由本组件 files 承担，此处仅用于 el-upload 内部计数）
    internalFileList() {
      return this.files.map((file) => ({
        uid: file.uid,
        name: file.name,
        status: file.status === 'success' ? 'success' : file.status,
        url: file.url
      }));
    }
  },
  watch: {
    // 父组件重置或回填 value 时同步内部展示列表
    value: {
      handler(newVal) {
        if (newVal === this.emittedValue) return;
        this.syncFromValue(newVal);
      },
      immediate: false
    }
  },
  created() {
    // 非响应式内部状态：不放入 data，避免 Vue 深度代理
    this.emittedValue = null;
    this.uidSeed = 0;
  },
  mounted() {
    this.initCos();
    this.syncFromValue(this.value);
  },
  methods: {
    // 拉取 COS 临时签名并初始化 SDK 实例
    initCos() {
      if (MOCK_DATA_ENABLED) {
        return;
      }
      getWxCosFileSign({ sysBucket: this.useSysBucket ? 2 : 1 })
        .then((res) => {
          if (res && res.result) {
            const pageData = JSON.parse(res.data);
            this.bucket = pageData.bucketName;
            this.cos = new COS({
              getAuthorization: (options, callback) => {
                callback({
                  TmpSecretId: pageData.credentials.tmpSecretId,
                  TmpSecretKey: pageData.credentials.tmpSecretKey,
                  XCosSecurityToken: pageData.credentials.sessionToken,
                  ExpiredTime: pageData.expiredTime
                });
              }
            });
          } else {
            this.$message.error((res && res.msg) || '获取上传签名失败');
          }
        })
        .catch(() => {
          this.$message.error('获取上传签名失败，请稍后重试');
        });
    },

    // 依据父组件传入的 value 重建内部展示列表
    syncFromValue(val) {
      const list = Array.isArray(val) ? val : [];
      this.files = list.map((fileJson) => ({
        uid: fileJson.id || fileJson.attachmentKey || this.genUid(),
        name: fileJson.fileName || extractFileName(fileJson.attachmentKey),
        size: fileJson.size || 0,
        type: fileJson.contentType || '',
        status: 'success',
        progress: 100,
        url: fileJson.attachmentKey,
        raw: null
      }));
    },

    // 生成本地唯一 uid（用于上传中的文件在展示列表中去重）
    genUid() {
      this.uidSeed += 1;
      return `local_${Date.now()}_${this.uidSeed}`;
    },

    // 上传前校验：后缀 + 大小 + COS 就绪
    beforeUpload(file) {
      if (MOCK_DATA_ENABLED) {
        this.$message.info('文件上传尚未接入本地演示，不会上传到线上。');
        return false;
      }
      const ext = extractExt(file.name);
      if (this.extList.indexOf(ext) === -1) {
        this.$message.error(`请上传后缀名为 [${this.extList.join(', ')}] 的文件`);
        return false;
      }
      if (file.size / 1024 / 1024 > this.effectiveMaxSize) {
        this.$message.error(`请上传小于 ${this.effectiveMaxSize}M 的文件`);
        return false;
      }
      if (!this.cos) {
        this.$message.error('上传组件未就绪，请稍后重试');
        return false;
      }
      if (this.files.length >= this.maxCount) {
        this.$message.warning(`最多只能上传 ${this.maxCount} 个文件`);
        return false;
      }
      // 校验通过：先占位一个 uploading 状态的行，用于展示进度
      const uid = this.genUid();
      this.files = [...this.files, {
        uid,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        url: '',
        raw: file
      }];
      // 将 uid 挂在 file 上，供 http-request 回调定位
      file.__uid = uid;
      return true;
    },

    // 超出最大上传数量
    handleExceed(exceedFiles) {
      this.$message.warning(
        `最多只能上传 ${this.maxCount} 个文件，本次已忽略超出的 ${exceedFiles.length} 个文件`
      );
    },

    // el-upload 自定义上传：走 COS SDK 直传
    handleUpload(option) {
      this.putFileToCos(option.file, {
        onProgress: option.onProgress,
        onSuccess: option.onSuccess,
        onError: option.onError
      });
    },

    // 对外暴露：以程序方式上传一个 File（如 HTML 自动生成的截图），复用同一套 COS 直传与展示同步逻辑
    uploadFile(file) {
      // 复用上传前校验（后缀/大小/COS 就绪）并插入 uploading 占位行
      if (!this.beforeUpload(file)) return;
      this.putFileToCos(file, {
        onProgress: () => {},
        onSuccess: () => {},
        onError: () => {}
      });
    },

    // 将原始文件直传 COS：上传成功后打标签、登记文件信息、同步展示列表与 v-model
    putFileToCos(file, { onProgress, onSuccess, onError }) {
      const uid = file.__uid;
      const fileExt = extractExt(file.name);
      const year = String(new Date().getFullYear());
      const timestamp = Date.now();
      const key = `/${this.pathPrefix}/${year}/${timestamp}/${timestamp}.${fileExt}`;

      this.cos.putObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: file,
          onProgress: (info) => {
            const percent = Math.round((info.percent || 0) * 100);
            onProgress({ percent });
            this.updateFile(uid, { progress: percent });
          }
        },
        (err, data) => {
          if (err) {
            this.$message.error('文件上传失败');
            this.updateFile(uid, { status: 'error' });
            onError(err);
            return;
          }
          // 打标签：便于后续按年份/学校/模块清理
          this.cos.putObjectTagging(
            {
              Bucket: this.bucket,
              Region: this.region,
              Key: key,
              Tags: [
                { Key: 'year', Value: year },
                { Key: 'school', Value: String(this.schoolInfo.id || '') },
                { Key: 'module', Value: String(this.params.bizId || '') },
                { Key: 'modulecode', Value: String(this.params.bizCode || '') }
              ]
            },
            () => {
              const fileUrl = `https://${data.Location}`;
              // 记录文件信息（异步，不阻塞 UI 更新）
              addWxfileInfo({
                fileId: '',
                fileSize: file.size,
                fileUrl,
                moduleCode: this.params.bizCode || '',
                moduleName: this.params.bizId || '',
                schoolId: (this.schoolInfo && this.schoolInfo.id) || ''
              });
              // 更新展示列表为成功状态
              this.updateFile(uid, {
                status: 'success',
                progress: 100,
                url: fileUrl
              });
              // 同步 v-model（携带原始文件，供宿主获取本地 File）
              this.emitValue(file);
              onSuccess({ url: fileUrl });
            }
          );
        }
      );
    },

    // 局部更新指定 uid 的展示项
    updateFile(uid, patch) {
      this.files = this.files.map((item) => (item.uid === uid ? { ...item, ...patch } : item));
    },

    // 由 el-upload on-remove 触发（当前 UI 使用自绘移除按钮，此回调作为兜底）
    handleRemoveFromUpload(file) {
      this.handleRemove({ uid: file.uid });
    },

    // 点击移除按钮：从展示列表移除并同步父组件；图片模式下同步删除 COS 对象
    handleRemove(file) {
      const target = this.files.find((item) => item.uid === file.uid);
      this.files = this.files.filter((item) => item.uid !== file.uid);
      this.emitValue();
      // 上传成功的文件才尝试删除 COS 对象
      if (target && target.status === 'success' && target.url && this.cos) {
        this.deleteCosObject(target.url);
      }
    },

    // 从 URL 反推 COS Key 并删除对象（参考 xiaohuasheng-eval-pc/ImageUploader.vue）
    deleteCosObject(url) {
      const path = String(url).replace(/\.picsh\./, '.cos.ap-shanghai.');
      const idx = path.indexOf('myqcloud.com');
      if (idx === -1) return;
      const key = path.slice(idx + 13);
      this.cos.deleteObject(
        {
          Bucket: this.bucket,
          Region: this.region,
          Key: window.decodeURI(key)
        },
        () => {}
      );
    },

    // 图片预览：点击图片缩略图打开弹窗
    handlePreview(file) {
      if (this.mode !== 'image') return;
      this.previewImageUrl = this.previewUrl(file);
      this.previewVisible = true;
    },

    // 向父组件同步 FileJson 列表（v-model + change）；rawFile 为本次上传成功的本地原始文件（移除时为空）
    emitValue(rawFile) {
      const list = this.files
        .filter((file) => file.status === 'success' && file.url)
        .map((file) => ({
          attachmentKey: file.url,
          fileName: file.name,
          size: file.size,
          contentType: file.type
        }));
      this.emittedValue = list;
      this.$emit('input', list);
      this.$emit('change', list);
      this.$emit('success', list[list.length - 1], list, rawFile);
    },

    // 图片预览地址：仅上传成功后使用 COS 返回的完整 URL
    previewUrl(file) {
      if (file.status === 'success' && file.url) {
        return file.url;
      }
      return '';
    },

    // 是否处于上传中
    isUploading(file) {
      return file.status === 'uploading';
    },

    // 附件行图标底色状态类
    fileIconClass(file) {
      if (file.status === 'error') return 'is-error';
      if (file.status === 'success') return 'is-success';
      return 'is-uploading';
    },

    // 文件大小展示
    formatSize(file) {
      return formatFileSize(file.size);
    }
  }
};
</script>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: 1.15;
}

.uploader-core {
  flex-shrink: 0;
}

::v-deep .el-upload {
  display: block;
}

/* 已上传文件列表区 */
.uploader-side {
  min-width: 0;
}

/* 上下结构：提示语排在触发区与文件列表之间 */
.image-uploader:not(.is-horizontal) .upload-tip {
  order: 1;
}

.image-uploader:not(.is-horizontal) .uploader-side {
  order: 2;
}

.default-trigger {
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  border: 1px dashed var(--line);
  border-radius: 10px;
  color: var(--muted);
  cursor: pointer;
  transition: border-color .2s;
}

.default-trigger:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.upload-tip {
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
}

/* 图片模式：缩略图网格 */
.thumb-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.thumb-item {
  position: relative;
  width: 80px;
  height: 80px;
  /* overflow: hidden; */
  border: 2px solid var(--line);
  border-radius: 10px;
  background: var(--canvas);
  transition: border-color .2s;
}

.thumb-item.is-error {
  border-color: #fca5a5;
  background: #fef2f2;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #cbd5e1;
}

.thumb-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(0, 0, 0, .5);
  color: #fff;
}

.thumb-mask.is-error {
  background: rgba(254, 242, 242, .85);
  color: #ef4444;
}

.thumb-progress {
  font-size: 10px;
  font-weight: 600;
}

.thumb-badge {
  position: absolute;
  right: 2px;
  bottom: 2px;
  display: grid;
  place-items: center;
  color: #22c55e;
  background: #fff;
  border-radius: 50%;
}

.thumb-remove,
.file-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity .2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .2);
}

.thumb-item:hover .thumb-remove {
  opacity: 1;
}

/* 加载动画 */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, .4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: uploader-spin .7s linear infinite;
}

@keyframes uploader-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 附件模式：文件行列表 */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  transition: border-color .2s;
}

.file-row:hover {
  border-color: var(--primary);
}

.file-row.is-error {
  border-color: #fecaca;
  background: #fef2f2;
}

.file-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
}

.file-icon.is-uploading {
  background: var(--soft);
  color: var(--primary);
}

.file-icon.is-success {
  background: #ecfdf5;
  color: #22c55e;
}

.file-icon.is-error {
  background: #fef2f2;
  color: #ef4444;
}

.file-icon .spinner {
  width: 15px;
  height: 15px;
  border-color: rgba(33, 104, 243, .3);
  border-top-color: var(--primary);
}

.file-meta {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  margin-top: 2px;
  font-size: 12px;
  color: var(--muted);
}

.file-status {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
}

.file-status .is-uploading {
  color: var(--primary);
}

.file-status .is-success {
  color: #22c55e;
}

.file-status .is-error {
  color: #ef4444;
}

.file-remove {
  position: static;
  width: 22px;
  height: 22px;
  background: transparent;
  color: var(--muted);
  box-shadow: none;
  opacity: 1;
}

.file-remove:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* ---------- 左右结构布局（layout="horizontal"）：触发区居左、文件列表居右、提示语置底 ---------- */
.image-uploader.is-horizontal {
  flex-flow: row wrap;
  align-items: stretch;
  column-gap: 14px;
  row-gap: 8px;
}

.image-uploader.is-horizontal .uploader-core {
  width: var(--uploader-cell-size, 200px);
}

.image-uploader.is-horizontal ::v-deep .el-upload {
  width: 100%;
  height: 100%;
}

.image-uploader.is-horizontal .upload-trigger {
  height: 100%;
}

/* 宿主自定义触发 UI 铺满左侧列并居中，高度跟随右侧内容 */
.image-uploader.is-horizontal ::v-deep .upload-trigger > * {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-uploader.is-horizontal .uploader-side {
  flex: 1;
}

/* 提示语独占一行，换行到触发区与列表下方 */
.image-uploader.is-horizontal .upload-tip {
  width: 100%;
}

/* ---------- 左右结构 + 图片模式：上传按钮与缩略图共用方块尺寸，宽高一致 ---------- */
.image-uploader.is-horizontal.is-image-mode .uploader-core {
  width: var(--uploader-cell-size, 120px);
  height: var(--uploader-cell-size, 120px);
  /* 多行缩略图时触发区不跟随拉高，始终锁定为一个方块 */
  align-self: flex-start;
}

.image-uploader.is-horizontal.is-image-mode .thumb-item {
  width: var(--uploader-cell-size, 120px);
  height: var(--uploader-cell-size, 120px);
}
</style>

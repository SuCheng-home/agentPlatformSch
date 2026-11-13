<template>
  <div class="cover-card" @click="open">
    <div class="cc-cover">
      <img v-if="coverSrc" class="cc-cover-img" loading="lazy" :src="coverSrc" :alt="agent.name">
      <div v-else class="cc-cover-bg" :style="coverBgStyle">
        <span class="cc-cover-letter">{{ coverLetter }}</span>
        <span class="cc-cover-subject">{{ agent.subjectNames }}</span>
      </div>
      <div class="cc-top-left">
        <span class="cc-badge" :class="badgeClass">{{ badgeText }}</span>
        <!-- 我创建的页面：类型徽章右侧展示审批状态，退回可点击查看原因 -->
        <span
          v-if="isCreated && approvalStatusInfo"
          class="cc-status"
          :class="['cc-status-' + approvalStatusInfo.class, { 'is-clickable': isRejected }]"
          @click.stop="handleStatusClick"
        >
          {{ approvalStatusInfo.text }}
          <svg
            v-if="isRejected"
            class="cc-status-hint"
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
      </div>
      <span class="cc-uses">{{ usesText }} 次使用</span>
      <!-- 我创建的页面：右上角操作按钮 -->
      <div v-if="isCreated" class="cc-actions" @click.stop>
        <button v-if="canEdit" class="cc-action-btn" type="button" title="编辑" @click="onEdit">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button v-if="canEdit" class="cc-action-btn cc-action-danger" type="button" title="删除" @click="onDelete">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    <div class="cc-body">
      <h3 class="cc-title">{{ agent.name }}</h3>
      <div class="cc-foot">
        <span class="cc-creator">
          <!-- <i class="cc-creator-avatar" :style="{ background: avatarColor }">{{ avatarText }}</i> -->
          <span style="margin-right: 7px;">{{ agent.authorName }}</span>
          <span class="cc-meta">{{ gradeLabel }}</span>
        </span>
        <!-- 底部操作区（单独一行）：分享 + 收藏状态 + 附件下载 -->
        <span class="cc-foot-actions">
          <button
            v-if="canShare"
            class="cc-share-btn"
            type="button"
            title="分享"
            @click.stop="openShareDialog"
          >
            <svg class="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.share" />
            </svg>
            分享
          </button>
          <button
            v-if="canFavorite"
            class="cc-fav-btn"
            :class="{ active: isFavorited, loading: favLoading }"
            type="button"
            :disabled="favLoading"
            :title="isFavorited ? '取消收藏' : '收藏'"
            @click.stop="onToggleFavorite"
          >
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path :d="icons.heart" />
            </svg>
            {{ isFavorited ? '已收藏' : '收藏' }}
          </button>
          <!-- 附件下载：HTML 单文件、其它文件接入方式才展示 -->
          <button
            v-if="downloadFile"
            class="cc-dl-btn"
            type="button"
            :disabled="downloading"
            @click.stop="onDownload"
          >
            <svg class="icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons.download" />
            </svg>
            {{ downloading ? '下载中…' : '下载' }}
          </button>
        </span>
      </div>
    </div>
    <!-- 分享弹框：展示非鉴权预览页链接，支持一键复制 -->
    <el-dialog
      title="分享智能体"
      :visible.sync="shareDialogVisible"
      width="480px"
      append-to-body
      @click.native.stop
    >
      <p class="share-tip">任何人可通过以下链接免登录预览「{{ agent.name }}」：</p>
      <div class="share-link-row">
        <el-input ref="shareInput" :value="shareUrl" readonly />
        <el-button type="primary" @click="copyShareLink">复制链接</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { formatUses } from '@/utils/format';
import { ICONS } from '@/constants/icons';
import { getDownloadUrlByAttachmentKey } from '@/utils/auth';
import { saveUseRecord } from '@/api/agent';
import { addFavorite, deleteFavorite } from '@/api/favourite';
import { MOCK_DATA_ENABLED } from '@/config/local-preview';

// 审批状态展示映射（approvalStatus：-1 草稿 / 0 待审批 / 1 审批通过 / 2 审批不通过）
const APPROVAL_STATUS_MAP = {
  [-1]: { text: '草稿', class: 'draft' },
  0: { text: '待审批', class: 'pending' },
  1: { text: '已通过', class: 'passed' },
  2: { text: '已退回', class: 'rejected' }
};

/** 支持附件下载的接入方式：1001 HTML 单文件、1005 其它文件 */
const DOWNLOADABLE_ACCESS_TYPES = [1001, 1005];

/** 个人收藏状态：selfIsFavorite 1 未收藏 / 2 已收藏 */
const FAVORITE_YES = 2;
const FAVORITE_NO = 1;

/** 封面渐变调色板（与桌面端应用卡片保持一致） */
const COVER_COLORS = [
  '#2b6cff', '#8b5cf6', '#e07b39', '#0e9f6e', '#ed8a20',
  '#ec6b58', '#1597c7', '#f3a62f', '#fb765b', '#3f9e6d'
];

export default {
  name: 'AgentCard',
  props: {
    agent: {
      type: Object,
      required: true
    },
    isCreated: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      icons: ICONS,
      downloading: false,
      favLoading: false,
      shareDialogVisible: false,
      shareUrl: ''
    };
  },
  computed: {
    // 无封面图时展示名称首字
    coverLetter() {
      return (this.agent.name || '?').charAt(0);
    },
    // 封面渐变色：按 id 取模选色，与桌面端 app-cover-bg 规则一致
    coverBgStyle() {
      const color = COVER_COLORS[(this.agent.id || 0) % COVER_COLORS.length];
      return { background: `linear-gradient(135deg, ${color}, ${color}88)` };
    },
    // 无 logo 时以智能体名称首字生成字母头像
    avatarText() {
      return (this.agent.name || '').charAt(0);
    },
    // 字母头像底色与类型徽标配色保持一致：智能体紫、实用工具蓝、课件资源橙
    avatarColor() {
      const colorMap = { 1: '#8b5cf6', 2: '#2f6bed', 3: '#e07b39' };
      return colorMap[this.agent.agentType] || '#2f6bed';
    },
    coverSrc() {
      const coverImg = JSON.parse(this.agent.coverImg || '[]');

      return coverImg.length > 0 ? (coverImg[0].attachmentKey || '') : '';
    },
    usesText() {
      return formatUses(this.agent.useCount);
    },
    // 智能体→紫色徽标；课件资源→橙色徽标；实用工具→蓝色徽标
    badgeClass() {
      if (this.agent.agentType === 1) {
        return 'ai';
      }
      if (this.agent.agentType === 3) {
        return 'cw';
      }
      return 'tool';
    },
    // 智能体类型编码：1 智能体，2 实用工具，3 课件资源
    badgeText() {
      const typeMap = { 1: '智能体', 3: '课件资源' };
      return typeMap[this.agent.agentType] || '实用工具';
    },
    gradeLabel() {
      const subjectNames = this.agent.subjectNames || '跨学科通用';
      const materialNames = this.agent.materialNames || '全年级·全册';
      const chapterNames = this.agent.chapterNames || '全章节适用';
      return `${subjectNames}·${materialNames}·${chapterNames}`;
    },
    // 我创建的页面：审批状态展示信息
    approvalStatusInfo() {
      if (!this.isCreated) {
        return null;
      }
      return APPROVAL_STATUS_MAP[this.agent.approvalStatus] || null;
    },
    // 是否审批不通过（可点击查看退回原因）
    isRejected() {
      return this.agent.approvalStatus === 2;
    },
    // 仅「待审批」和「已退回」的智能体允许编辑
    canEdit() {
      return this.agent.approvalStatus === 2;
    },
    // 可下载附件：接入方式为 HTML 单文件 / 其它文件时，取接入配置中首个文件
    downloadFile() {
      const { accessType, accessConfig } = this.agent;
      if (!DOWNLOADABLE_ACCESS_TYPES.includes(accessType)) {
        return null;
      }
      let fileList = null;
      try {
        fileList = JSON.parse(accessConfig || '');
      } catch (e) {
        return null;
      }
      const firstFile = Array.isArray(fileList) ? fileList[0] : null;
      const url = firstFile && getDownloadUrlByAttachmentKey(firstFile.attachmentKey);
      if (!url) {
        return null;
      }
      return { url, fileName: firstFile.fileName || '' };
    },
    // 当前用户是否已收藏该智能体
    isFavorited() {
      return Number(this.agent.selfIsFavorite) === FAVORITE_YES;
    },
    // 收藏入口：体验模式无个人身份、我创建的不展示
    canFavorite() {
      return !this.isCreated && !this.$store.state.agent.guestMode;
    },
    // 分享入口：体验模式下分享无意义（分享页本身即免登录预览）
    canShare() {
      return !this.$store.state.agent.guestMode;
    }
  },
  methods: {
    open() {
      this.$emit('open', this.agent);
    },
    onEdit() {
      this.$emit('edit', this.agent);
    },
    onDelete() {
      this.$emit('delete', this.agent);
    },
    // 收藏/取消收藏：接口调用与 app-preview.vue 一致，成功后把最新状态抛给父组件更新列表数据
    onToggleFavorite() {
      const id = this.agent.id;
      if (this.favLoading || !id) {
        return;
      }
      this.favLoading = true;
      const request = this.isFavorited
        ? deleteFavorite({ objectId: id, objectType: 1, type: 1 })
        : addFavorite({ objectId: id, objectType: 1, type: 1 });
      request.then(() => {
        this.$emit('favorite', { agent: this.agent, selfIsFavorite: this.isFavorited ? FAVORITE_NO : FAVORITE_YES });
      }).catch((err) => {
        console.warn('[AgentCard] 收藏操作失败：', err);
      }).finally(() => {
        this.favLoading = false;
      });
    },
    // 打开分享弹框：基于 hash 路由拼接非鉴权预览页完整地址
    openShareDialog() {
      const { href } = this.$router.resolve({ path: '/agent-share', query: { id: this.agent.id } });
      this.shareUrl = `${window.location.origin}${window.location.pathname}${href}`;
      this.shareDialogVisible = true;
    },
    // 复制分享链接：优先异步 Clipboard API，非安全上下文回退到选中输入框 + execCommand
    copyShareLink() {
      const url = this.shareUrl;
      if (!url) {
        return;
      }
      const fallbackCopy = () => {
        const input = this.$refs.shareInput && this.$refs.shareInput.$el.querySelector('input');
        if (!input) {
          return false;
        }
        input.focus();
        input.select();
        return document.execCommand('copy');
      };
      const onSuccess = () => this.$message({ type: 'success', message: '链接已复制' });
      const onFail = () => this.$message.error('复制失败，请手动复制链接');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(onSuccess).catch(() => {
          if (fallbackCopy()) {
            onSuccess();
          } else {
            onFail();
          }
        });
        return;
      }
      if (fallbackCopy()) {
        onSuccess();
      } else {
        onFail();
      }
    },
    // 下载附件：优先拉取二进制流触发本地保存，跨域受限时退回直接打开下载地址
    async onDownload() {
      if (MOCK_DATA_ENABLED) {
        this.$message.info('附件下载尚未保存本地副本，模拟模式不会请求线上文件。');
        return;
      }
      const file = this.downloadFile;
      if (!file || this.downloading) {
        return;
      }
      this.downloading = true;
      // 下载同样计一次使用记录
      saveUseRecord(this.agent.id).catch((err) => {
        console.warn('[AgentCard] 保存使用记录失败：', err);
      });
      const fileName = file.fileName || this.agent.name;
      try {
        const res = await fetch(file.url);
        if (!res.ok) {
          throw new Error(`下载失败：${res.status}`);
        }
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        this.saveFile(blobUrl, fileName);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (e) {
        this.saveFile(file.url, fileName);
      } finally {
        this.downloading = false;
      }
    },
    saveFile(href, fileName) {
      const link = document.createElement('a');
      link.href = href;
      link.download = fileName || '附件';
      // 跨域直链会被浏览器忽略 download 属性，新标签页打开避免当前页跳转
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 点击状态胶囊：仅退回状态展示退回原因
    handleStatusClick() {
      if (!this.isRejected) {
        return;
      }
      this.$alert(this.agent.reviewComment || '暂无退回说明', '退回原因', {
        confirmButtonText: '知道了',
        type: 'warning'
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.cover-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all .3s cubic-bezier(.4, 0, .2, 1);
  display: flex;
  flex-direction: column;
}

.cover-card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(33, 104, 243, .14);
  transform: translateY(-2px);
}

.cc-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #eef3fb;
  height: 250px;
}

.cc-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 无封面图时的默认样式：渐变色 + 名称首字 + 学科（与桌面端卡片一致） */
.cc-cover-bg {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cc-cover-letter {
  font-size: 70px;
  font-weight: 800;
  color: rgba(255, 255, 255, .92);
  font-family: 'PingFang SC', sans-serif;
  line-height: 1;
}

.cc-cover-subject {
  font-size: 14px;
  color: rgba(255, 255, 255, .75);
  letter-spacing: 3px;
  font-family: 'PingFang SC', sans-serif;
  margin-top: 8px;
}

.cc-top-left {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cc-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, .94);
  color: #42506b;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .12);
}

.cc-badge.ai {
  background: rgba(139, 92, 246, .96);
  color: #fff;
}

.cc-badge.cw {
  background: rgba(224, 123, 57, .96);
  color: #fff;
}

.cc-badge.tool {
  background: rgba(47, 107, 237, .96);
  color: #fff;
}

.cc-uses {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 11px;
  color: #fff;
  background: rgba(15, 23, 42, .48);
  padding: 2px 9px;
  border-radius: 12px;
  backdrop-filter: blur(3px);
}

/* 审批状态胶囊（位于类型徽章右侧） */
.cc-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .12);
}

.cc-status-draft {
  background: rgba(100, 116, 139, .95);
}

.cc-status-pending {
  background: rgba(245, 158, 11, .95);
}

.cc-status-passed {
  background: rgba(22, 163, 74, .95);
}

.cc-status-rejected {
  background: rgba(220, 38, 38, .95);
}

.cc-status.is-clickable {
  cursor: pointer;
}

.cc-status-hint {
  flex-shrink: 0;
}

.cc-body {
  padding: 13px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.cc-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cc-foot {
  border-top: 1px solid var(--line);
  padding-top: 10px;
}

.cc-creator {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* gap: 7px; */
  font-size: 12px;
  color: #68758b;
  min-width: 0;
}

.cc-creator-avatar {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  color: #fff;
  font-style: normal;
  font-size: 11px;
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
}

.cc-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8a96aa;
}

/* 底部操作区（单独一行）：分享、收藏、下载按钮同一胶囊风格 */
.cc-foot-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 5px;
  flex-shrink: 0;
}

/* 分享按钮：与收藏/下载同一胶囊风格 */
.cc-share-btn {
  border: 1px solid var(--line);
  background: var(--surface);
  color: #68758b;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  cursor: pointer;
  padding: 3px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  transition: all .2s;
}

.cc-share-btn:hover {
  border-color: var(--primary);
  background: rgba(33, 104, 243, .08);
  color: var(--primary);
}

/* 附件下载按钮 */
.cc-dl-btn {
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  cursor: pointer;
  padding: 3px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  transition: all .2s;
}

.cc-dl-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.cc-dl-btn:disabled {
  opacity: .6;
  cursor: default;
}

/* 收藏胶囊：未收藏灰色描边，已收藏玫红实心心形 */
.cc-fav-btn {
  border: 1px solid var(--line);
  background: var(--surface);
  color: #68758b;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  cursor: pointer;
  padding: 3px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  transition: all .2s;
}

.cc-fav-btn:hover {
  border-color: #fbb6c2;
  background: rgba(244, 63, 94, .08);
  color: #f43f5e;
}

.cc-fav-btn.active {
  border-color: rgba(244, 63, 94, .35);
  background: rgba(244, 63, 94, .08);
  color: #f43f5e;
}

.cc-fav-btn.loading {
  opacity: .6;
  cursor: wait;
}

/* 操作按钮（仅我创建的页面显示，右上角） */
.cc-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity .2s;
}

.cover-card:hover .cc-actions {
  opacity: 1;
}

.cc-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 0;
  background: rgba(255, 255, 255, .92);
  color: #42506b;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .12);
}

.cc-action-btn:hover {
  background: var(--primary);
  color: #fff;
}

.cc-action-btn.cc-action-danger:hover {
  background: #ef4444;
  color: #fff;
}
</style>

<style>
/* 分享弹框内容（append-to-body 渲染在组件外，需全局样式） */
.share-tip {
  margin: 0 0 12px;
  font-size: 13px;
  color: #68758b;
}

.share-link-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.share-link-row .el-input {
  flex: 1;
  min-width: 0;
}
</style>

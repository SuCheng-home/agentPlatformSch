<template>
  <el-alert
    v-if="isLocalPreview"
    class="local-preview-notice"
    :title="noticeTitle"
    :description="noticeDescription"
    type="warning"
    :closable="false"
    show-icon
  />
</template>

<script>
import { LOCAL_PREVIEW_ENABLED, MOCK_DATA_ENABLED } from '@/config/local-preview';
import snapshotMeta from '@/mock/snapshot-meta.json';

export default {
  name: 'LocalPreviewNotice',
  computed: {
    isLocalPreview() {
      return LOCAL_PREVIEW_ENABLED || MOCK_DATA_ENABLED;
    },
    noticeTitle() {
      return MOCK_DATA_ENABLED
        ? `本地模拟数据 · ${snapshotMeta.agentCount} 条资源 · ${snapshotMeta.capturedAt.slice(0, 10)} 线上快照`
        : '本地页面预览：登录校验已临时跳过';
    },
    noticeDescription() {
      return MOCK_DATA_ENABLED
        ? '展示已完成：列表、筛选、详情说明和管理页；收藏、最近使用及编辑仅在本机演示。数据来自未限定学校的公开列表，非实时数据。在线 AI、上传及私人数据未接入。'
        : '业务接口仍需真实登录授权；未授权或请求失败时不填充模拟数据。';
    }
  }
};
</script>

<style scoped>
.local-preview-notice {
  margin-bottom: 20px;
}
</style>

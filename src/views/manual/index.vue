<template>
  <div class="manual-page">
    <el-alert
      v-if="isMockMode"
      title="平台使用手册未接入本地快照"
      description="当前为本地模拟模式，不加载在线文档。"
      type="info"
      :closable="false"
    />
    <iframe
      v-else
      class="manual-iframe"
      :src="manualDocUrl"
      title="平台使用手册"
      frameborder="0"
      allowfullscreen
    />
  </div>
</template>

<script>
import { MOCK_DATA_ENABLED } from '@/config/local-preview';
// 平台使用手册在线文档地址（写死）
const MANUAL_DOC_URL = 'https://docs.qq.com/doc/DV0RTRmZXdGpQSnZG';

export default {
  name: 'ManualPage',
  computed: {
    isMockMode() {
      return MOCK_DATA_ENABLED;
    }
  },
  data() {
    return {
      manualDocUrl: MANUAL_DOC_URL
    };
  }
};
</script>

<style scoped>
.manual-page {
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
}

.manual-iframe {
  flex: 1;
  width: 100%;
  border: 0;
  border-radius: 10px;
  background: var(--surface);
}
</style>

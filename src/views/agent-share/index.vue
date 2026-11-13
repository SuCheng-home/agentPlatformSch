<template>
  <div class="agent-share-page">
    <!-- 全屏预览（组件自治显隐）：分享页为独立全屏入口，不提供关闭/返回 -->
    <AppPreview ref="preview" floating-toolbar :closable="false" />
    <!-- 分享链接缺少智能体 ID 时的错误占位 -->
    <div v-if="loadError" class="asp-placeholder">
      <h3>分享链接无效</h3>
      <p class="asp-error-tip">未获取到智能体 ID，请确认分享链接是否完整</p>
    </div>
  </div>
</template>

<script>
import AppPreview from '@/components/app-preview.vue';
import { getToken } from '@/utils/auth';

export default {
  name: 'AgentShare',
  components: {
    AppPreview
  },
  data() {
    return {
      loadError: false
    };
  },
  computed: {
    /** 分享链接携带的智能体 ID */
    agentId() {
      return this.$route.query.id || '';
    }
  },
  mounted() {
    // 未登录访问：开启体验模式，app-preview 内部切换到非鉴权详情/浏览数接口
    this.$store.commit('agent/SET_GUEST_MODE', !getToken());
    this.openPreview();
  },
  methods: {
    openPreview() {
      const id = this.agentId;
      if (!id) {
        this.loadError = true;
        this.$message.error('分享链接缺少智能体 ID');
        return;
      }
      this.loadError = false;
      this.$refs.preview.open({ id });
    }
  }
};
</script>

<style scoped>
.agent-share-page {
  position: fixed;
  inset: 0;
  background: #fff;
}

.asp-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: linear-gradient(160deg, #f7f9fe, #eef3ff);
}

.asp-placeholder h3 {
  margin: 0;
  font-size: 20px;
  color: #13213d;
}

.asp-error-tip {
  margin: 0;
  font-size: 14px;
  color: #5f6f8e;
}
</style>

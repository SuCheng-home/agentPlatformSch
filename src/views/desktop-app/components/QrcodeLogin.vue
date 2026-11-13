<template>
  <div v-show="show" class='qrcode-login'>
    <div id="desktopWxLoginQrcode" v-show="!qrTimeout" class="login-qrcode" />
    <p v-if="qrTimeout" class="wx-login-tip wx-login-error">
      二维码加载失败，请检查网络后重试
      <button type="button" class="qr-retry" @click="retryQrcode">重新加载</button>
    </p>
    <p v-else class="wx-login-tip">请使用微信扫描二维码登录</p>
  </div>
</template>

<script>
import { initCodeByWx, loginByWx } from 'auth-layout-wxj'
import { getToken } from '@/utils/auth'

export default {
  name: 'qrcode-login',
  props: {
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      qrCreated: false,
      qrTimeout: false,
      qrTimer: null,
      logging: false
    }
  },
  watch: {
    show(val) {
      if (val) this.initQrcode()
    }
  },
  mounted() {
    // 微信扫码回调：用户授权后微信会将整页重定向到 redirect_uri，
    // 项目为 hash 路由，code 参数位于 # 之前，因此需从 window.location.search 读取
    const wxCode = new URLSearchParams(window.location.search).get('code')
    if (wxCode) {
      this.handleWxCallback(wxCode)
      return
    }
    this.initQrcode()
  },
  beforeDestroy() {
    if (this.qrTimer) clearTimeout(this.qrTimer)
  },
  methods: {
    /** 渲染微信登录二维码：加载 SDK 并在指定 DOM 内生成扫码 iframe，超时则展示失败提示 */
    initQrcode() {
      if (this.qrCreated || !this.show || getToken()) return
      this.qrCreated = true
      this.qrTimeout = false
      this.$nextTick(() => {
        initCodeByWx('desktopWxLoginQrcode', { state: 'SCENEBWXLOGIN_agentPlatformSch' })
        // 10s 内 iframe 未渲染则判定超时
        this.qrTimer = setTimeout(() => {
          const el = document.getElementById('desktopWxLoginQrcode')
          if (el && !el.querySelector('iframe')) {
            this.qrTimeout = true
          }
        }, 10000)
      })
    },
    /** 超时后手动重试 */
    retryQrcode() {
      if (this.qrTimer) clearTimeout(this.qrTimer)
      this.qrCreated = false
      this.qrTimeout = false
      this.initQrcode()
    },
    /** 处理扫码回跳：换取登录态后刷新页面以加载完整用户信息 */
    async handleWxCallback(wxCode) {
      if (this.logging) return
      this.logging = true
      try {
        // loginByWx 内部自动处理首次绑定手机号(1060)、多校选择(1055)等场景，并写入 Admin-Token
        await loginByWx(wxCode, 'pc')
        if (getToken()) {
          // 清除一次性 code，避免刷新后重复换取；整页刷新让 initApp 重新加载登录态
          window.history.replaceState({}, '', window.location.pathname + window.location.hash)
          window.location.reload()
        }
      } catch (error) {
        // 登录失败时 loginByWx 内部已弹出错误提示，这里恢复二维码供重新扫码
        console.error('[QrcodeLogin] 微信扫码登录失败:', error)
        this.qrCreated = false
        this.initQrcode()
      } finally {
        this.logging = false
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.qrcode-login {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* 白底卡片与 iframe 同宽，高度固定，超出部分裁剪，保证两种扫码态尺寸一致 */
.login-qrcode {
  width: 320px;
  height: 325px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  padding: 10px 10px 0;
}
.wx-login-tip {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, .65);
  font-size: 13px;
}
.wx-login-error {
  color: #ffa39e;
}
.qr-retry {
  margin-left: 6px;
  border: 1px solid rgba(255,255,255,.4);
  background: rgba(255,255,255,.1);
  color: #fff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
}
.qr-retry:hover {
  background: rgba(255,255,255,.2);
}
</style>

<style>
/* 微信扫码 iframe（需非 scoped 穿透第三方渲染内容）：
   保持 wxLogin.js 默认的 300×400 渲染尺寸，强行改小会挤压 iframe 内部按 300px 设计的布局，
   导致二维码错位、扫码确认态偏上；多出的高度由外层 .login-qrcode 裁剪 */
.qrcode-login .login-qrcode iframe {
  display: block;
  border: none;
  width: 300px;
  height: 400px;
}
</style>

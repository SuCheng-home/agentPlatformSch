<template>
  <div class="klh klh-login" :style="{ '--campus': `url(${campus})`, '--school-name': `url(${schoolName})` }">
    <div class="klh-login__photo" aria-hidden="true" />
    <div class="klh-login__wash" aria-hidden="true" />
    <svg class="klh-login__wave" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
      <path class="wave-orange" d="M0 92 C 320 40 620 150 960 96 C 1180 62 1320 70 1440 84" />
      <path class="wave-blue" d="M0 150 C 360 92 700 196 1040 140 C 1220 112 1340 118 1440 128 L1440 220 L0 220 Z" />
    </svg>

    <header class="klh-login__brand">
      <img class="brand-logo" :src="logo" alt="南京市科利华中学校徽" width="72" height="66" />
      <span class="divider" aria-hidden="true" />
      <div>
        <p class="school-cn" role="img" aria-label="南京市科利华中学" />
        <p class="school-en">NANJING KELIHUA MIDDLE SCHOOL</p>
      </div>
    </header>

    <main class="klh-login__main">
      <section class="hero" aria-labelledby="klh-platform-name">
        <div class="hero__mark">
          <brush-ke class="hero__ke" :delay="0.35" @replay="replayKey += 1" />
          <div :key="`motto-${replayKey}`" class="hero__motto-wrap">
            <p class="hero__motto klh-brush" aria-label="以利华">
              <span v-for="(ch, i) in '以利华'" :key="ch" :style="{ animationDelay: `${2.1 + i * 0.16}s` }">{{ ch }}</span>
            </p>
            <svg class="hero__swoosh" viewBox="0 0 600 64" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="klh-login-swoosh" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stop-color="#f6a03c" stop-opacity="0.35" />
                  <stop offset="0.3" stop-color="#ee8320" />
                  <stop offset="1" stop-color="#e2700f" stop-opacity="0.9" />
                </linearGradient>
                <mask id="klh-login-swoosh-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="64">
                  <path class="hero__swoosh-reveal" d="M0 48 C 200 34 400 22 600 10" pathLength="1" />
                </mask>
              </defs>
              <path
                mask="url(#klh-login-swoosh-mask)"
                fill="url(#klh-login-swoosh)"
                d="M6 50 C 120 38 260 28 420 18 C 500 13 560 9 596 6 C 560 13 500 20 420 28 C 280 40 140 50 14 60 C 6 60 2 54 6 50 Z"
              />
            </svg>
          </div>
        </div>

        <div :key="`name-${replayKey}`" class="hero__name">
          <h1 id="klh-platform-name">
            <span class="klh-brush hero__zh">科智汇</span>
            <span class="hero__bar" aria-hidden="true">｜</span>
            <span class="hero__ai">AI 矩阵平台</span>
          </h1>
        </div>
      </section>

      <section class="login-card" aria-labelledby="klh-login-title">
        <h2 id="klh-login-title" class="login-card__title">
          <span class="rule" aria-hidden="true" />
          <klh-icon name="scan" :size="22" />
          {{ demoMode ? '选择身份进入' : '扫码登录' }}
          <span class="rule" aria-hidden="true" />
        </h2>

        <template v-if="!demoMode">
          <div class="qr-frame">
            <qrcode-login class="qr-inner" />
          </div>
          <p class="login-card__tip">
            <klh-icon name="phone" :size="18" />
            打开微信，扫一扫登录
          </p>
        </template>

        <template v-else>
          <p class="login-card__note">本地预览环境 · 正式部署时为微信扫码登录</p>
          <div class="role-list" role="radiogroup" aria-label="体验身份">
            <button
              v-for="(r, key) in roles"
              :key="key"
              type="button"
              role="radio"
              :aria-checked="String(role === key)"
              :class="['role-item', { 'is-active': role === key }]"
              @click="role = key"
            >
              <span class="role-item__avatar" aria-hidden="true">{{ r.name.slice(0, 1) }}</span>
              <span class="role-item__text">
                <strong>{{ r.label }}</strong>
                <small>{{ r.name }} · {{ r.title }}</small>
              </span>
              <span class="role-item__radio" aria-hidden="true" />
            </button>
          </div>
          <button type="button" class="klh-btn klh-btn--primary enter-btn" @click="enterDemo">
            进入平台
            <klh-icon name="arrowRight" :size="16" />
          </button>
        </template>
      </section>
    </main>
  </div>
</template>

<script>
import BrushKe from '../components/brush-ke.vue';
import KlhIcon from '../components/KlhIcon.vue';
import QrcodeLogin from '@/views/desktop-app/components/QrcodeLogin.vue';
import logo from '../assets/logo-klh.png';
import schoolName from '../assets/school-name.png';
import campus from '../assets/campus-bg.webp';
import { getToken } from '@/utils/auth';
import state, { actions, DEMO_MODE, ROLES } from '../store';

export default {
  name: 'KlhLogin',
  components: { BrushKe, KlhIcon, QrcodeLogin },
  data() {
    return { logo, schoolName, campus, roles: ROLES, role: state.session.role, demoMode: DEMO_MODE, replayKey: 0 };
  },
  created() {
    if (!DEMO_MODE) {
      if (getToken()) {
        actions.restoreSession();
        this.goHome();
        return;
      }
      actions.consumeQrReturn();
      actions.markQrReturn();
    }
  },
  mounted() {
    document.title = '登录 · 科智汇｜AI矩阵平台';
  },
  methods: {
    enterDemo() {
      actions.demoLogin(this.role);
      this.goHome();
    },
    goHome() {
      const redirect = this.$route.query.redirect;
      this.$router.replace(typeof redirect === 'string' && redirect.startsWith('/kelihua') ? redirect : '/kelihua/home');
    }
  }
};
</script>

<style lang="scss" scoped>
.klh-login {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fdf3e6;
}

/* 校园实景虚化打底，再罩一层暖白，保证文字与登录卡片清晰 */
.klh-login__photo {
  position: absolute;
  inset: -24px;
  background:
    linear-gradient(160deg, rgba(255, 250, 243, 0.86) 0%, rgba(253, 243, 230, 0.62) 50%, rgba(251, 236, 216, 0.5) 100%),
    var(--campus) center 40% / cover no-repeat;
  filter: blur(4px) saturate(0.9);
  transform: scale(1.04);
  opacity: 0;
  animation: klh-photo-in 1.4s ease-out forwards;
  pointer-events: none;
}

@keyframes klh-photo-in {
  to { opacity: 1; transform: none; }
}

/* 仅保留一处柔和的暖色光晕，背景整体保持素净 */
.klh-login__wash {
  position: absolute;
  inset: -20% -10% auto auto;
  width: 70vw;
  height: 90vh;
  background: radial-gradient(closest-side, rgba(245, 154, 46, 0.22), transparent 70%);
  pointer-events: none;
}

.klh-login__wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 22vh;
  min-height: 140px;
  pointer-events: none;

  .wave-orange {
    fill: none;
    stroke: var(--klh-orange);
    stroke-width: 2;
    opacity: 0.55;
    stroke-dasharray: 1600;
    stroke-dashoffset: 1600;
    animation: klh-wave-line 2.4s 0.4s ease-out forwards;
  }
  .wave-blue {
    fill: var(--klh-blue);
    opacity: 0;
    transform: translateY(24px);
    animation: klh-rise 1.2s 0.2s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  }
}

.klh-login__brand {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 32px clamp(20px, 5vw, 72px) 0;
  opacity: 0;
  animation: klh-fade-down 0.7s 0.1s ease-out forwards;

  .brand-logo { width: 72px; height: 66px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(72, 58, 140, 0.18)); }
  .divider { width: 1px; height: 48px; background: var(--klh-line-strong); }
  /* 校名为书法题字，用蒙版着色以便统一墨色 */
  .school-cn {
    width: 300px;
    height: 42px;
    background: var(--klh-ink);
    -webkit-mask: var(--school-name) left center / contain no-repeat;
    mask: var(--school-name) left center / contain no-repeat;
  }
  .school-en {
    margin-top: 4px;
    font-size: 12px;
    letter-spacing: 0.16em;
    color: var(--klh-blue);
    opacity: 0.85;
  }
}

.klh-login__main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 24px clamp(20px, 5vw, 72px) calc(22vh + 24px);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.hero__mark {
  display: flex;
  align-items: flex-end;
  gap: clamp(8px, 2vw, 28px);
}

.hero__ke {
  width: clamp(200px, 26vw, 380px);
  height: clamp(200px, 26vw, 380px);
  filter: drop-shadow(0 6px 10px rgba(220, 106, 14, 0.14));
}

.hero__motto-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: clamp(16px, 3vw, 44px);
}

.hero__swoosh {
  display: block;
  width: 112%;
  height: clamp(20px, 2.6vw, 40px);
  margin: -0.12em 0 0 -4%;
  overflow: visible;
}

.hero__swoosh-reveal {
  fill: none;
  stroke: #fff;
  stroke-width: 80;
  stroke-linecap: butt;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: klh-swoosh 0.7s 4.35s cubic-bezier(0.5, 0, 0.3, 1) forwards;
}

@keyframes klh-swoosh {
  to { stroke-dashoffset: 0; }
}

.hero__motto {
  display: flex;
  align-items: baseline;
  gap: 0.06em;
  font-size: clamp(56px, 7.4vw, 112px);
  line-height: 1;
  color: var(--klh-blue-deep);

  span {
    display: inline-block;
    opacity: 0;
    transform: translateY(16px) scale(0.96);
    filter: blur(4px);
    animation: klh-ink-in 0.7s ease-out forwards;
  }

  /* 「以」为连接字，略小；「利华」为校名主体，突出显示 */
  span:first-child { font-size: 0.8em; }
  span:not(:first-child) { font-size: 1.08em; }
}

.hero__name {
  padding-left: clamp(4px, 1vw, 16px);

  h1 {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0 14px;
    font-weight: 800;
    color: var(--klh-ink);
    line-height: 1.15;
  }
}

.hero__zh {
  font-size: clamp(44px, 5vw, 72px);
  color: var(--klh-blue);
  letter-spacing: 0.04em;
}
.hero__bar {
  font-size: clamp(30px, 3.4vw, 50px);
  font-weight: 300;
  color: var(--klh-orange);
}
.hero__ai {
  font-size: clamp(32px, 3.6vw, 54px);
  letter-spacing: 0.12em;
}

/* 登录卡片 */
.login-card {
  flex-shrink: 0;
  width: 380px;
  padding: 32px 32px 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(10px);
  box-shadow: 0 24px 60px -24px rgba(20, 50, 154, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.7) inset;
  opacity: 0;
  animation: klh-fade-left 0.8s 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}

.login-card__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: var(--klh-blue-deep);

  .rule { flex: 1; height: 1px; background: var(--klh-line-strong); }
}

.qr-frame {
  position: relative;
  margin: 24px auto 0;
  width: 300px;
  height: 300px;
  padding: 12px;
  border-radius: 12px;
  overflow: hidden;

  /* 四角取景框 */
  background:
    linear-gradient(var(--klh-blue), var(--klh-blue)) top left / 28px 3px,
    linear-gradient(var(--klh-blue), var(--klh-blue)) top left / 3px 28px,
    linear-gradient(var(--klh-blue), var(--klh-blue)) top right / 28px 3px,
    linear-gradient(var(--klh-blue), var(--klh-blue)) top right / 3px 28px,
    linear-gradient(var(--klh-blue), var(--klh-blue)) bottom left / 28px 3px,
    linear-gradient(var(--klh-blue), var(--klh-blue)) bottom left / 3px 28px,
    linear-gradient(var(--klh-blue), var(--klh-blue)) bottom right / 28px 3px,
    linear-gradient(var(--klh-blue), var(--klh-blue)) bottom right / 3px 28px;
  background-repeat: no-repeat;

  ::v-deep .login-qrcode {
    width: 276px;
    height: 276px;
    padding: 0;
    margin-top: -48px;
  }
  ::v-deep .login-qrcode iframe { width: 276px; height: 380px; }
  ::v-deep .wx-login-tip { display: none; }
  ::v-deep .wx-login-error {
    display: block;
    color: var(--klh-orange);
  }
  ::v-deep .qr-retry { border-color: var(--klh-line-strong); color: var(--klh-ink); background: var(--klh-white); }
}

.login-card__tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 15px;
  color: var(--klh-muted);

  .klh-icon { color: var(--klh-blue); }
}

.login-card__note {
  margin: 16px 0 14px;
  font-size: 13px;
  color: var(--klh-faint);
  text-align: center;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--klh-line);
  background: var(--klh-white);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  font: inherit;
  color: inherit;

  &:hover { border-color: var(--klh-blue-tint-2); }
  &.is-active {
    border-color: var(--klh-blue);
    background: var(--klh-blue-tint);
    .role-item__radio { border-color: var(--klh-blue); box-shadow: inset 0 0 0 4px var(--klh-white); background: var(--klh-blue); }
    .role-item__avatar { background: var(--klh-blue); color: var(--klh-white); }
  }
}

.role-item__avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--klh-ink-tint);
  font-weight: 700;
  color: var(--klh-blue-deep);
  flex-shrink: 0;
}

.role-item__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  strong { font-size: 15px; }
  small { font-size: 12px; color: var(--klh-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}

.role-item__radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--klh-line-strong);
  flex-shrink: 0;
}

.enter-btn {
  width: 100%;
  height: 46px;
  margin-top: 18px;
  font-size: 16px;
}

@keyframes klh-ink-in {
  to { opacity: 1; transform: none; filter: none; }
}
@keyframes klh-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
@keyframes klh-fade-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: none; }
}
@keyframes klh-fade-left {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: none; }
}
@keyframes klh-rise {
  to { opacity: 1; transform: none; }
}
@keyframes klh-wave-line {
  to { stroke-dashoffset: 0; }
}

@media (max-width: 1024px) {
  .klh-login__main {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 32px;
  }
  .hero { align-items: center; text-align: center; }
  .hero__name { padding-left: 0; h1 { justify-content: center; } }
  .login-card { width: 100%; max-width: 420px; margin: 0 auto; }
}

@media (max-width: 560px) {
  .klh-login__brand {
    gap: 12px;
    .brand-logo { width: 52px; height: 48px; }
    .divider { height: 34px; }
    .school-cn { width: 200px; height: 28px; }
    .school-en { font-size: 10px; letter-spacing: 0.08em; }
  }
  .login-card { padding: 24px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .klh-login *,
  .klh-login *::before {
    animation-duration: 0.01s !important;
    animation-delay: 0s !important;
  }
}
</style>

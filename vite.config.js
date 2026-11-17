import { fileURLToPath, URL } from 'node:url';
import { existsSync, realpathSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const nodeModulesPath = fileURLToPath(new URL('./node_modules', import.meta.url));
const nodeModulesRealPath = existsSync(nodeModulesPath) ? realpathSync(nodeModulesPath) : nodeModulesPath;
import vue2 from '@vitejs/plugin-vue2';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const envTarget = env.VITE_ENV_TARGET || mode;
  // 应用前缀：与部署子路径、路由 base 保持一致
  const appPrefix = env.VITE_APP_PREFIX || 'agentPlatformSch';
  const isBuild = command === 'build';

  return {
    // 构建时按应用前缀部署到子路径，开发时使用根路径
    base: isBuild ? `/${appPrefix}/` : '/',

    plugins: [
      vue2(),
      // cos/vod SDK 及部分依赖需要浏览器端 Buffer/process/crypto 等 Node 内置模块垫片
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true
        }
      })
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // 指向 ESM 版本，支持运行时模板编译
        vue: 'vue/dist/vue.esm.js'
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(isBuild ? 'production' : 'development'),
        ENV_TARGET: JSON.stringify(envTarget)
      },
      global: 'globalThis'
    },

    css: {
      preprocessorOptions: {
        scss: {
          // 使用现代 Sass API，避免 [legacy-js-api] 弃用警告
          api: 'modern'
        }
      }
    },

    server: {
      host: true,
      port: 8080,
      open: false,
      // 本地快照模式阻止意外的跨站接口、外部 iframe 和图片请求；生产构建不受影响。
      headers: env.VITE_USE_MOCK === 'true'
        ? { 'Content-Security-Policy': "connect-src 'self' ws: wss:; frame-src 'none'; img-src 'self' data: blob:" }
        : {},
      // 允许通过 127.0.0.1、localhost 等本地地址访问开发服务器
      // .v0.build / .vercel.run：v0 在线预览域名（沙箱子域名会随会话变化，用前导点匹配其子域名）
      allowedHosts: ['localhost', '127.0.0.1', '.v0.build', '.vercel.run'],
      fs: {
        // node_modules 可能是指向项目外目录的软链接（如 v0 沙箱），需放行其真实路径以加载 element-ui 字体等静态资源
        allow: [projectRoot, nodeModulesRealPath]
      }
    },

    build: {
      // 构建产物输出到应用前缀同名目录，便于 Nginx 按前缀分发
      outDir: appPrefix,
      assetsDir: 'static',
      sourcemap: false,
      // es2020：cos/vod SDK 的传递依赖 @aws-sdk/checksums 使用 BigInt 字面量（CRC-64 校验），
      // esbuild 无法将其降级到 es2018；下方各浏览器版本均原生支持 BigInt 与 ES2020
      target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'vuex'],
            elementUI: ['element-ui']
          }
        }
      }
    },

    optimizeDeps: {
      include: ['vue', 'vue-router', 'vuex', 'element-ui']
    }
  };
});

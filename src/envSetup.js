// ⚠️ 该文件必须作为 main.js 的第一个 import 被引入。
// 原因：auth-layout-wxj 主包在被首次 import 时会依据当前环境创建内置 Axios 实例
//（fetch / systemFetch / modelFetch），其 baseURL 取决于 setEnvTarget 设置的环境。
// 而 utils/fetch.js 会静态 import 主包，若不在此处提前调用 setEnvTarget，
// 主包会在静态依赖解析阶段先于 main.js 主体执行，导致 baseURL 为 undefined。
// 将 setEnvTarget 收敛到本副作用模块并置于最前，可保证「先设置环境、再加载主包」。
import { setEnvTarget } from 'auth-layout-wxj/initEnv';

// 取自 vite --mode 对应的 VITE_ENV_TARGET（dev_test / build_test / production）
setEnvTarget(import.meta.env.VITE_ENV_TARGET || 'dev_test');

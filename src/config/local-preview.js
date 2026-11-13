// 临时本地预览开关：生产构建始终关闭，恢复登录时将 .env.dev_test 的 VITE_SKIP_LOGIN 设为 false。
export const LOCAL_PREVIEW_ENABLED = import.meta.env.DEV && import.meta.env.VITE_SKIP_LOGIN === 'true';

// 仅开发服务支持本地快照，构建部署时始终使用原接口。
export const MOCK_DATA_ENABLED = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

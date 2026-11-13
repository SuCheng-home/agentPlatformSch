// 统一使用 auth-layout-wxj 内置的 Axios 工厂与预配置实例
// （已内置 token 注入、错误提示、code===1000 登出等拦截器，无需再手动引入 axios / js-cookie）
import { getAxiosService } from 'auth-layout-wxj';
import { createPreviewRequest } from '@/utils/api-request';

/**
 * 智能体平台业务实例（替代原 auth-layout-zw 的 mingleAxios / service2）。
 * baseURL 取自环境变量 VITE_BASE_API_URL，已内置 token 注入与响应拦截。
 */
export const businessFetch = createPreviewRequest(getAxiosService({
  baseURL: import.meta.env.VITE_BASE_API_URL
}));

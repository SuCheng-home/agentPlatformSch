import { fetch as remoteFetch } from 'auth-layout-wxj';
import { Message } from 'element-ui';
import { MOCK_DATA_ENABLED } from '@/config/local-preview';

/** 保留原接口调用；本地模拟模式在发出 HTTP 请求之前切换到快照处理器。 */
export function createPreviewRequest(remoteRequest) {
  return async (config) => {
    if (!MOCK_DATA_ENABLED) {
      return remoteRequest(config);
    }
    const { handleMockRequest } = await import('@/mock/request-handler');
    try {
      return handleMockRequest(config);
    } catch (error) {
      Message.warning(error.message);
      throw error;
    }
  };
}

export const fetch = createPreviewRequest(remoteFetch);

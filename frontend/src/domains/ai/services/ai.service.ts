import { post } from '../../../shared/services/api';

export const aiService = {
  async chat(message: string): Promise<string> {
    const res = await post<{ response: string }>('/ai/chat', { message });
    return res.response;
  },

  async generateInsightsSummary(): Promise<string> {
    const res = await post<{ summary: string }>('/ai/insights');
    return res.summary;
  }
};

export default aiService;

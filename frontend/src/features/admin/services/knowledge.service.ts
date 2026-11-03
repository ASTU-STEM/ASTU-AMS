import apiClient from '../../../services/api';

export interface KnowledgeDocItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  sourceType: 'UPLOAD' | 'FAQ_ENTRY' | 'POLICY' | 'MANUAL';
  fileName?: string;
  fileSize?: number;
  status: 'PUBLISHED' | 'DRAFT' | 'DEACTIVATED';
  accessLevel: 'PUBLIC' | 'RESTRICTED';
  chunkCount: number;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunkItem {
  id: string;
  documentId: string;
  chunkIndex: number;
  title: string;
  section?: string;
  pageNumber?: number;
  content: string;
  tokenCount: number;
}

export interface AdminTestQueryResult {
  response: string;
  isGrounded: boolean;
  citations: Array<{ title: string; category: string; section?: string; pageNumber?: number }>;
  actions: Array<{ label: string; route: string }>;
  retrievedChunksCount: number;
}

export const knowledgeService = {
  async getDocuments(params?: { category?: string; status?: string; search?: string }): Promise<KnowledgeDocItem[]> {
    const res = await apiClient.get('/ai/knowledge/documents', { params });
    return res.data?.data?.documents || [];
  },

  async getDocumentDetails(id: string): Promise<{ document: KnowledgeDocItem; chunks: KnowledgeChunkItem[] }> {
    const res = await apiClient.get(`/ai/knowledge/documents/${id}`);
    return res.data?.data;
  },

  async uploadDocument(formData: FormData): Promise<any> {
    const res = await apiClient.post('/ai/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async createFaq(data: { question: string; answer: string; category?: string; accessLevel?: string }): Promise<any> {
    const res = await apiClient.post('/ai/knowledge/faq', data);
    return res.data;
  },

  async updateStatus(id: string, status: string, accessLevel?: string): Promise<any> {
    const res = await apiClient.patch(`/ai/knowledge/documents/${id}/status`, { status, accessLevel });
    return res.data;
  },

  async deleteDocument(id: string): Promise<any> {
    const res = await apiClient.delete(`/ai/knowledge/documents/${id}`);
    return res.data;
  },

  async testQuery(data: { message: string; targetDocumentId?: string; allowDrafts?: boolean }): Promise<AdminTestQueryResult> {
    const res = await apiClient.post('/ai/knowledge/test-chat', data);
    return res.data?.data;
  },
};

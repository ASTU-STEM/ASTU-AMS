import apiClient from '../../../services/api';
import { ApiResult } from '../../auth/services/auth.service';

export const supportService = {
  async createTicket(formData: FormData): Promise<ApiResult<{ ticketId: string }>> {
    try {
      const response = await apiClient.post<{ success: boolean; data?: { ticketId: string }; message?: string }>(
        '/support/tickets',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.success && response.data.data) {
        return { ok: true, data: response.data.data };
      }
      
      return {
        ok: false,
        errorCode: 'TICKET_SUBMISSION_FAILED',
        message: response.data.message || 'Failed to submit support ticket.'
      };
    } catch (error) {
      return {
        ok: false,
        errorCode: 'TICKET_SUBMISSION_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.'
      };
    }
  }
};

export default supportService;

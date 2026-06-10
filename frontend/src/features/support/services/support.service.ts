import axios from 'axios';
import { ApiResult } from '../../auth/services/auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const supportService = {
  async createTicket(formData: FormData): Promise<ApiResult<{ ticketId: string }>> {
    try {
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
          ok: true,
          data: {
            ticketId: `TIC-${Math.floor(100000 + Math.random() * 900000)}`
          }
        };
      }
      
      const response = await axios.post<{ success: boolean; data?: { ticketId: string }; message?: string }>(
        `${API_BASE_URL}/support/ticket`,
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

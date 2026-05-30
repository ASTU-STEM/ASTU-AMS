import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';

export class DiditService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.DIDIT_API_URL,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${env.DIDIT_API_KEY}`,
        Accept: 'application/json',
      },
    });
  }

  async verifyNationalId(nationalId: string): Promise<{ valid: boolean; name?: string; details?: any }> {
    try {
      const response = await this.client.post('/national-id/verify', {
        nationalId,
      });

      if (response.status !== 200 || !response.data) {
        return { valid: false, details: response.data };
      }

      return {
        valid: Boolean(response.data?.valid),
        name: response.data?.name || response.data?.fullName || undefined,
        details: response.data,
      };
    } catch (err: any) {
      return {
        valid: false,
        details: err.response?.data || err.message,
      };
    }
  }
}

export const diditService = new DiditService();

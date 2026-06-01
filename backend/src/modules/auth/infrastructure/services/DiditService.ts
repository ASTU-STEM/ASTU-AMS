import axios, { AxiosInstance } from 'axios';

export class DiditService {
  private client: AxiosInstance;
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string = 'https://api.didit.me/v1', apiKey: string = '') {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey || process.env.DIDIT_API_KEY || 'test_didit_key';
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
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
      console.error('Didit verification error:', err.message);
      return {
        valid: false,
        details: err.response?.data || err.message,
      };
    }
  }

  // Mock verification for testing
  mockVerifyNationalId(nationalId: string, fullName: string): { valid: boolean; name?: string } {
    if (!nationalId || nationalId.length < 5) {
      return { valid: false };
    }
    return { valid: true, name: fullName };
  }

  async verifyCompanyTin(tin: string, companyName: string): Promise<{ valid: boolean; companyName?: string; details?: any }> {
    try {
      const response = await this.client.post('/company/tin/verify', {
        tin,
        companyName,
      });

      if (response.status !== 200 || !response.data) {
        return { valid: false, details: response.data };
      }

      return {
        valid: Boolean(response.data?.valid),
        companyName: response.data?.companyName || response.data?.name || companyName,
        details: response.data,
      };
    } catch (err: any) {
      console.error('Didit company TIN verification error:', err.message);
      return {
        valid: false,
        details: err.response?.data || err.message,
      };
    }
  }
}

export const diditService = new DiditService();

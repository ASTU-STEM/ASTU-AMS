import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { env } from '../config/env.ts';

export class RegistrarAPIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.REGISTRAR_API_URL,
      timeout: 8000,
      headers: {
        'X-Registrar-API-Key': env.REGISTRAR_API_KEY,
        Accept: 'application/json',
      },
    });

    // Simple retry policy for transient network errors
    // Note: axios-retry is not listed in package.json; fallback to simple interceptor if unavailable
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const retry = require('axios-retry');
      retry(this.client, { retries: 3, retryDelay: retry.exponentialDelay });
    } catch (e) {
      // If axios-retry not installed, implement naive retry interceptor
      this.client.interceptors.response.use(undefined, async (error) => {
        const config: any = error.config;
        if (!config || typeof config !== 'object') return Promise.reject(error);
        config.__retryCount = config.__retryCount || 0;
        if (config.__retryCount >= 2) return Promise.reject(error);
        config.__retryCount += 1;
        await new Promise((r) => setTimeout(r, 200 * Math.pow(2, config.__retryCount)));
        return this.client.request(config);
      });
    }
  }

  async fetchGraduates(): Promise<any[]> {
    const resp = await this.client.get('/graduates');
    // Support different payload shapes from registrar (array or {graduates: []})
    if (Array.isArray(resp.data)) return resp.data;
    if (resp.data && Array.isArray(resp.data.graduates)) return resp.data.graduates;
    return [];
  }

  async getGraduate(studentId: string): Promise<any | null> {
    try {
      const resp = await this.client.get(`/graduates/${encodeURIComponent(studentId)}`);
      return resp.data && resp.data.graduate ? resp.data.graduate : resp.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404) return null;
      throw err;
    }
  }

  // Generic ping to Registrar API
  async ping(): Promise<boolean> {
    try {
      const resp = await this.client.get('/health');
      return resp.status === 200;
    } catch (e) {
      return false;
    }
  }
}

export const registrarAPI = new RegistrarAPIService();

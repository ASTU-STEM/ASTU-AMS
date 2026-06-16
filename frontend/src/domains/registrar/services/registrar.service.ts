import { get, post, put, patch, upload } from '../../../shared/services/api';
import type {
  BatchImportRecord,
  BatchImportResult,
  DataExportRequest,
  DocumentProcessingRequest,
  GraduateRecord,
  RegistrarDashboardSummary,
  VerificationRequest
} from '../types';

const BASE = '/registrar';

export const registrarService = {
  async getDashboardSummary(): Promise<RegistrarDashboardSummary> {
    return get<RegistrarDashboardSummary>(`${BASE}/dashboard`);
  },

  async getGraduates(): Promise<GraduateRecord[]> {
    return get<GraduateRecord[]>(`${BASE}/graduates`);
  },

  async getGraduate(studentId: string): Promise<GraduateRecord> {
    return get<GraduateRecord>(`${BASE}/students/${studentId}`);
  },

  async addGraduate(input: Omit<GraduateRecord, 'id'>): Promise<{
    graduates: GraduateRecord[];
    verifications: VerificationRequest[];
  }> {
    return post(`${BASE}/graduates`, input);
  },

  async updateGraduate(graduate: GraduateRecord): Promise<GraduateRecord> {
    return put<GraduateRecord>(`${BASE}/graduates/${graduate.id}`, graduate);
  },

  async importBatch(records: BatchImportRecord[]): Promise<BatchImportResult> {
    return post<BatchImportResult>(`${BASE}/import`, { records });
  },

  async fetchGraduatesByYear(year: number): Promise<void> {
    await post(`${BASE}/fetch-graduates/${year}`);
  },

  async fetchAllGraduates(): Promise<void> {
    await post(`${BASE}/fetch-graduates/current-and-previous`);
  },

  async getVerifications(): Promise<VerificationRequest[]> {
    return get<VerificationRequest[]>(`${BASE}/verifications`);
  },

  async resolveVerification(requestId: string, status: 'APPROVED' | 'REJECTED'): Promise<{
    graduates: GraduateRecord[];
    verifications: VerificationRequest[];
  }> {
    return patch(`${BASE}/verifications/${requestId}`, { status });
  },

  async getDocumentRequests(): Promise<DocumentProcessingRequest[]> {
    return get<DocumentProcessingRequest[]>(`${BASE}/document-requests`);
  },

  async processDocument(requestId: string, status: DocumentProcessingRequest['status']): Promise<DocumentProcessingRequest> {
    return patch<DocumentProcessingRequest>(`${BASE}/document-requests/${requestId}`, { status });
  },

  async getAlumni(): Promise<GraduateRecord[]> {
    return get<GraduateRecord[]>(`${BASE}/alumni`);
  },

  async getAlumniDetail(alumniId: string): Promise<GraduateRecord> {
    return get<GraduateRecord>(`${BASE}/alumni/${alumniId}`);
  },

  async updateAlumniStatus(alumniId: string, status: string, reason?: string): Promise<void> {
    await put(`${BASE}/alumni/${alumniId}/status`, { status, reason });
  },

  async approveAlumni(alumniId: string): Promise<void> {
    await post(`${BASE}/alumni/${alumniId}/approve`);
  },

  async suspendAlumni(alumniId: string, reason?: string): Promise<void> {
    await post(`${BASE}/alumni/${alumniId}/suspend`, { reason });
  },

  async getSyncLogs(): Promise<Array<{ id: string; syncedAt: string; recordsCount: number; status: string; errors?: string }>> {
    return get(`${BASE}/logs`);
  },

  createExportManifest(request: DataExportRequest) {
    return {
      id: Date.now(),
      ...request,
      requestedAt: new Date().toISOString(),
      status: 'Ready' as const
    };
  }
};

export default registrarService;

import { get, post, patch } from '../../../services/api';
import {
  BatchImportRecord,
  BatchImportResult,
  DataExportRequest,
  DocumentProcessingRequest,
  GraduateRecord,
  RegistrarDashboardSummary,
  VerificationRequest
} from '../types';

export const registrarService = {
  // Dashboard
  async getDashboardSummary(): Promise<RegistrarDashboardSummary> {
    try {
      const response = await get<{ data: any }>('/registrar/dashboard-stats');
      const stats = response.data;
      
      // We calculate percentage safely
      const verificationRate = stats.totalSisGraduates > 0 
        ? Math.round((stats.verifiedAlumni / stats.totalSisGraduates) * 100) 
        : 0;

      return {
        totalGraduateRecords: stats.totalSisGraduates,
        verifiedGraduateRecords: stats.verifiedAlumni,
        pendingVerifications: stats.pendingVerifications,
        pendingDocuments: stats.pendingDocuments,
        activeRecords: stats.verifiedAlumni, // Mapped approximately
        archivedRecords: 0,
        verificationRate
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  // SIS Records
  async getGraduates(): Promise<any[]> {
    try {
      const response = await get<{ data: any[] }>('/registrar/sis-records');
      return response.data;
    } catch (error) {
      console.error('Error fetching SIS records:', error);
      throw error;
    }
  },

  // Batch Import
  async importBatch(records: BatchImportRecord[]): Promise<BatchImportResult> {
    try {
      const response = await post<{ data: any }>('/registrar/batch-import', { records });
      return {
        accepted: response.data.imported,
        duplicates: response.data.duplicates,
        rejected: 0,
        records: [] // Could refetch or return new state if needed
      };
    } catch (error) {
      console.error('Error importing batch:', error);
      throw error;
    }
  },

  // Verifications
  async getVerifications(): Promise<any[]> {
    try {
      const response = await get<{ data: any[] }>('/registrar/verifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching verifications:', error);
      throw error;
    }
  },

  async resolveVerification(requestId: string, status: 'APPROVED' | 'REJECTED'): Promise<any> {
    try {
      const response = await patch<{ data: any }>(`/registrar/verifications/${requestId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error resolving verification:', error);
      throw error;
    }
  },

  // Documents
  async getDocumentRequests(): Promise<any[]> {
    try {
      const response = await get<{ data: any[] }>('/registrar/document-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching document requests:', error);
      throw error;
    }
  },

  async processDocument(requestId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_PROGRESS'): Promise<any> {
    try {
      const response = await patch<{ data: any }>(`/registrar/document-requests/${requestId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  },

  async approveDocument(requestId: string, file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      const response = await post<{ data: any }>(`/registrar/document-requests/${requestId}/approve`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error approving document:', error);
      throw error;
    }
  },

  // Data Exports (Stub)
  createExportManifest(request: DataExportRequest) {
    return {
      id: Date.now(),
      ...request,
      requestedAt: new Date().toISOString(),
      status: 'Ready' as const
    };
  }
};

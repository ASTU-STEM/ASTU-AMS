import { get, post, patch, del } from '../../../services/api';
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
      return (response && Array.isArray(response.data)) ? response.data : [];
    } catch (error) {
      console.error('Error fetching SIS records:', error);
      return [];
    }
  },

  async createSisRecord(recordData: any): Promise<any> {
    try {
      const response = await post<{ data: any }>('/registrar/sis-records', recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating SIS record:', error);
      throw error;
    }
  },

  // All Registered Alumni Accounts
  async getAllRegisteredAlumni(): Promise<any[]> {
    try {
      const response = await get<{ data: any[] }>('/registrar/alumni');
      return (response && Array.isArray(response.data)) ? response.data : [];
    } catch (error) {
      console.error('Error fetching registered alumni:', error);
      return [];
    }
  },

  // Batch Import
  async importBatch(records: any[], fileName?: string): Promise<BatchImportResult> {
    try {
      const response = await post<{ data: any }>('/registrar/batch-import', { records, fileName });
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

  // Direct Sync from University SIS API
  async syncFromSisApi(batchYear?: number | string): Promise<any> {
    try {
      const year = batchYear && batchYear !== 'ALL' ? batchYear : 'current-and-previous';
      const endpoint = year === 'current-and-previous' 
        ? '/registrar/fetch-graduates/current-and-previous'
        : `/registrar/fetch-graduates/${year}`;
      
      const response = await post<{ data: any }>(endpoint, {});
      return response.data;
    } catch (error: any) {
      console.error('Error syncing from SIS API:', error);
      throw error;
    }
  },

  async getSisStatus(): Promise<any> {
    try {
      const response = await get<{ data: any }>('/registrar/sis-status');
      return response.data;
    } catch (error) {
      console.error('Error checking SIS status:', error);
      return { status: 'OFFLINE' };
    }
  },

  async getLogs(): Promise<any[]> {
    try {
      const response = await get<{ data: any[] }>('/registrar/logs');
      return response.data;
    } catch (error) {
      console.error('Error fetching registrar sync logs:', error);
      return [];
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

  async bulkResolveVerifications(ids: string[], status: 'APPROVED' | 'REJECTED'): Promise<any> {
    try {
      const response = await post<{ data: any }>('/registrar/verifications/bulk-status', { ids, status });
      return response.data;
    } catch (error) {
      console.error('Error in bulkResolveVerifications:', error);
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

  async bulkProcessDocuments(ids: string[], status: 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'): Promise<any> {
    try {
      const response = await post<{ data: any }>('/registrar/document-requests/bulk-status', { ids, status });
      return response.data;
    } catch (error) {
      console.error('Error in bulkProcessDocuments:', error);
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

  async bulkApproveDocuments(items: { id: string; file: File }[]): Promise<any> {
    try {
      const formData = new FormData();
      items.forEach(item => {
        formData.append('requestIds', item.id);
        formData.append(`file_${item.id}`, item.file);
      });
      const response = await post<{ data: any }>('/registrar/document-requests/bulk-approve', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in bulkApproveDocuments:', error);
      throw error;
    }
  },

  async uploadDraftDocument(requestId: string, file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      const response = await post<{ data: any }>(`/registrar/document-requests/${requestId}/upload-draft`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading draft document:', error);
      throw error;
    }
  },

  async removeDraftDocument(requestId: string): Promise<any> {
    try {
      const response = await del<{ data: any }>(`/registrar/document-requests/${requestId}/remove-draft`);
      return response.data;
    } catch (error) {
      console.error('Error removing draft document:', error);
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
  },

  // Registration Issues / Data Corrections
  async getRegistrationIssues(): Promise<any[]> {
    try {
      const response = await get<{ success: boolean; data: any[] }>('/registrar/registration-issues');
      return (response && response.data && Array.isArray(response.data)) ? response.data : [];
    } catch (error) {
      console.error('Error fetching registration issues:', error);
      return [];
    }
  },

  // 3-Day Undone Task Interval Reminder Trigger
  async triggerPendingTaskReminder(): Promise<any> {
    try {
      const response = await post<{ success: boolean; message: string; data: any }>('/registrar/trigger-pending-reminder', {});
      return response;
    } catch (error) {
      console.error('Error triggering pending reminder:', error);
      throw error;
    }
  },

  // Export Logs & Scheduled Reports
  async getExportLogs(): Promise<any[]> {
    try {
      const response = await get<{ data: any[] }>('/registrar/export-logs');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching export logs:', error);
      return [];
    }
  },

  async logExport(logData: { reportName: string; format: string; recordCount?: number; fileSize?: string }): Promise<any> {
    try {
      post('/admin/audit-log', {
        action: `EXPORT_${logData.format.toUpperCase()}_REPORT`,
        details: `Registrar exported "${logData.reportName}" (${logData.recordCount || 0} records, ${logData.fileSize || '1.0 MB'}) in ${logData.format} format`,
        userEmail: 'registrar@astust.edu.et',
        userRole: 'REGISTRAR',
        afterState: { reportName: logData.reportName, format: logData.format, recordCount: logData.recordCount, fileSize: logData.fileSize }
      }).catch(() => {});
      const response = await post<{ data: any }>('/registrar/export-logs', logData);
      return response.data;
    } catch (error) {
      console.error('Error logging export:', error);
    }
  },

  async getScheduledReports(): Promise<any[]> {
    try {
      const response = await get<{ data: any[] }>('/registrar/scheduled-reports');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      return [];
    }
  },

  async createScheduledReport(reportData: { title: string; format: string; schedule: string; nextRun?: string }): Promise<any> {
    try {
      const response = await post<{ data: any }>('/registrar/scheduled-reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      throw error;
    }
  },

  async toggleScheduledReportStatus(id: string | number, status: 'Active' | 'Paused' | 'Completed'): Promise<any> {
    try {
      const response = await patch<{ data: any }>(`/registrar/scheduled-reports/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error toggling scheduled report status:', error);
      throw error;
    }
  },

  async deleteScheduledReport(id: string | number): Promise<any> {
    try {
      const response = await del<{ data: any }>(`/registrar/scheduled-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      throw error;
    }
  }
};

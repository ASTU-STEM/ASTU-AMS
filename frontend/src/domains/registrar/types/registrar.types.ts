export interface GraduateRecord {
  id: string;
  studentId: string;
  fullName: string;
  email?: string;
  department: string;
  departmentCode: string;
  graduationYear: number;
  cgpa: number;
  source: string;
}

export interface VerificationRequest {
  id: string;
  studentId: string;
  fullName: string;
  email?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface DocumentProcessingRequest {
  id: string;
  alumniId: string;
  documentType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  additionalInstructions?: string;
  notes?: string;
  fileUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RegistrarDashboardSummary {
  totalGraduateRecords: number;
  verifiedGraduateRecords: number;
  pendingVerifications: number;
  pendingDocuments: number;
  activeAlumniCount: number;
  recentSyncs: number;
}

export interface BatchImportRecord {
  studentId: string;
  fullName: string;
  department: string;
  departmentCode: string;
  cgpa: number;
  graduationYear: number;
  email?: string;
  phone?: string;
}

export interface BatchImportResult {
  accepted: number;
  duplicates: number;
  rejected: number;
  errors?: string[];
}

export interface DataExportRequest {
  format: 'CSV' | 'Excel' | 'PDF';
  scope: string;
  includeArchived: boolean;
}

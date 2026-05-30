export interface GraduateRecord {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  graduationYear: string;
  cgpa: string;
  identityVerified: boolean;
  status: 'Active' | 'Archived';
}

export interface VerificationRequest {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  graduationYear: string;
  type: 'Alumni Registration' | 'Graduation Status';
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}

export interface DocumentProcessingRequest {
  id: number;
  studentId: string;
  fullName: string;
  documentType: 'Official Transcript' | 'Degree Verification' | 'Medium of Instruction Certificate';
  destination: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress';
  requestDate: string;
}

export interface RegistrarDashboardSummary {
  totalGraduateRecords: number;
  verifiedGraduateRecords: number;
  pendingVerifications: number;
  pendingDocuments: number;
  activeRecords: number;
  archivedRecords: number;
  verificationRate: number;
}

export interface BatchImportRecord {
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  graduationYear: string;
  cgpa: string;
}

export interface BatchImportResult {
  accepted: number;
  duplicates: number;
  rejected: number;
  records: GraduateRecord[];
}

export interface RegistrarNotification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
  category: 'records' | 'verification' | 'documents' | 'reports' | 'audit';
}

export interface RegistrarAuditEvent {
  id: number;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface DataExportRequest {
  format: 'CSV' | 'Excel' | 'PDF' | 'Stata';
  scope: 'Graduate Records' | 'Verifications' | 'Documents' | 'Tracer Summary';
  includeArchived: boolean;
}

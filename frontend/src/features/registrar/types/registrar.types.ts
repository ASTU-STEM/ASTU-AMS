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
  id: string; // The backend uses UUID strings for verification requests
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  graduationYear: string;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  notes?: string;
  documentUrl?: string;
}

export interface DocumentProcessingRequest {
  id: string;
  alumniId: string;
  documentType: string;
  status: string;
  additionalInstructions?: string;
  fileUrls?: string[];
  notes?: string;
  contactEmail?: string;
  issuedDocumentUrl?: string;
  createdAt: string;
  updatedAt: string;
  alumni: {
    studentId: string;
    fullName: string;
    graduationYear?: number;
    email?: string;
    phone?: string;
    cgpa?: number | string;
    bio?: string;
    department?: { name: string } | string;
    experiences?: any[];
    certifications?: any[];
    projects?: any[];
    achievements?: any[];
  };
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

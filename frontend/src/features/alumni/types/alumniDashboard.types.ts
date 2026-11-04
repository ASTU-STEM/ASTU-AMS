export type AlumniDashboardTab =
  | 'overview'
  | 'career'
  | 'jobs'
  | 'profile'
  | 'documents'
  | 'mentorship'
  | 'surveys'
  | 'directory'
  | 'tools'
  | 'settings';

export interface AlumniProfileSummary {
  fullName: string;
  studentId: string;
  department: string;
  graduationYear: number | string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  completionPercent: number;
  linkedinUrl?: string;
  skills: string[];
}

export type DocumentLifecycleStatus =
  | 'Pending'
  | 'Under Registrar Review'
  | 'Issued'
  | 'Ready for Collection';

export interface TrackedDocumentRequest {
  id: string;
  documentType: string;
  status: DocumentLifecycleStatus;
  requestDate: string;
  reviewDate?: string;
  issuedDate?: string;
  trackingNumber: string;
  notes?: string;
  fileUrl?: string;
}

export interface CareerFilterOptions {
  department: string;
  salaryBracket: string;
  employerTier: 'All' | 'Strategic' | 'Technology' | 'Research' | 'Recruitment';
  searchQuery: string;
}

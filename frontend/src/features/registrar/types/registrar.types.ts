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

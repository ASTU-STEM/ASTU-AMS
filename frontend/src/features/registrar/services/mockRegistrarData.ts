import { GraduateRecord, VerificationRequest, DocumentProcessingRequest } from '../types/registrar.types';

const defaultGraduates: GraduateRecord[] = [
  {
    id: 1,
    studentId: 'UG/12839/14',
    fullName: 'Abebe Bikila',
    email: 'abebe.bikila@astu.edu.et',
    department: 'Computer Science and Engineering',
    graduationYear: '2024',
    cgpa: '3.78',
    identityVerified: true,
    status: 'Active'
  },
  {
    id: 2,
    studentId: 'UG/15443/13',
    fullName: 'Tigist Kebede',
    email: 'tigist.kebede@astu.edu.et',
    department: 'Electrical and Computer Engineering',
    graduationYear: '2023',
    cgpa: '3.65',
    identityVerified: true,
    status: 'Active'
  },
  {
    id: 3,
    studentId: 'UG/10398/14',
    fullName: 'Melkamu Abebe',
    email: 'melkamu.abebe@astu.edu.et',
    department: 'Computer Science and Engineering',
    graduationYear: '2024',
    cgpa: '3.91',
    identityVerified: false,
    status: 'Active'
  },
  {
    id: 4,
    studentId: 'UG/18290/13',
    fullName: 'Kalkidan Yosef',
    email: 'kalkidan.yosef@astu.edu.et',
    department: 'Computer Science and Engineering',
    graduationYear: '2023',
    cgpa: '3.82',
    identityVerified: true,
    status: 'Active'
  }
];

const defaultVerifications: VerificationRequest[] = [
  {
    id: 1,
    studentId: 'UG/10398/14',
    fullName: 'Melkamu Abebe',
    email: 'melkamu.abebe@astu.edu.et',
    department: 'Computer Science and Engineering',
    graduationYear: '2024',
    type: 'Alumni Registration',
    status: 'Pending',
    requestDate: 'May 20, 2026'
  },
  {
    id: 2,
    studentId: 'UG/11902/14',
    fullName: 'Helina Sileshi',
    email: 'helina.s@astu.edu.et',
    department: 'Chemical Engineering',
    graduationYear: '2024',
    type: 'Graduation Status',
    status: 'Pending',
    requestDate: 'May 24, 2026'
  }
];

const defaultDocuments: DocumentProcessingRequest[] = [
  {
    id: 1,
    studentId: 'UG/12839/14',
    fullName: 'Abebe Bikila',
    documentType: 'Official Transcript',
    destination: 'Chapa Financials HQ',
    status: 'Pending',
    requestDate: 'May 22, 2026'
  },
  {
    id: 2,
    studentId: 'UG/15443/13',
    fullName: 'Tigist Kebede',
    documentType: 'Degree Verification',
    destination: 'Commercial Bank of Ethiopia',
    status: 'Pending',
    requestDate: 'May 25, 2026'
  }
];

export const getGraduates = (): GraduateRecord[] => {
  const data = localStorage.getItem('registrar_graduates');
  if (data) {
    try { return JSON.parse(data); } catch { return defaultGraduates; }
  }
  return defaultGraduates;
};

export const saveGraduates = (graduates: GraduateRecord[]): void => {
  localStorage.setItem('registrar_graduates', JSON.stringify(graduates));
};

export const getVerifications = (): VerificationRequest[] => {
  const data = localStorage.getItem('registrar_verifications');
  if (data) {
    try { return JSON.parse(data); } catch { return defaultVerifications; }
  }
  return defaultVerifications;
};

export const saveVerifications = (verifications: VerificationRequest[]): void => {
  localStorage.setItem('registrar_verifications', JSON.stringify(verifications));
};

export const getDocumentRequests = (): DocumentProcessingRequest[] => {
  const data = localStorage.getItem('registrar_documents');
  if (data) {
    try { return JSON.parse(data); } catch { return defaultDocuments; }
  }
  return defaultDocuments;
};

export const saveDocumentRequests = (requests: DocumentProcessingRequest[]): void => {
  localStorage.setItem('registrar_documents', JSON.stringify(requests));
};

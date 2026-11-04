export type Role =
  | 'Alumni'
  | 'Employer'
  | 'Department Head'
  | 'DepartmentHead'
  | 'Faculty'
  | 'Registrar'
  | 'RegistrarStaff'
  | 'CMS Manager'
  | 'Admin'
  | 'Super Admin'
  | 'SuperAdmin';

export type Status = 'Active' | 'Inactive' | 'Suspended' | 'Pending Verification';

export type SortKey = 'name' | 'studentId' | 'role' | 'department' | 'batch' | 'status' | 'lastLogin';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: Role;
  department: string;
  batch: string;
  status: Status;
  lastLogin: string;
  registeredAt: string;
  phone: string;
  avatar?: string;
  adminNotes?: string;

  // Profile details
  cgpa?: number | string;
  graduationYear?: number | string;
  degreeDistinction?: string;
  advisor?: string;
  thesisTitle?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  employerName?: string;
  jobTitle?: string;
  skills?: string[];
  resumeUrl?: string;
  linkedIn?: string;
}

export interface UserFilters {
  query: string;
  role: string;
  status: string;
  department: string;
  batch: string;
}

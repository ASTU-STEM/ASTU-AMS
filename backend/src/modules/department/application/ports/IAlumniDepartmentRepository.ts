// Alumni records scoped to a department, enriched with fields the
// department dashboards need (profile + current employment).
export interface AlumniBasicInfo {
  id: string;
  userId: string | null;
  studentId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  graduationYear: number;
  /**
   * Null when the graduate has never reported a status. Consumers must treat
   * that as "unspecified" — defaulting it to UNEMPLOYED would invent graduate
   * unemployment that the university never recorded.
   */
  employmentStatus: string | null;
  salary: number | null;
  skills: string[];
  company: string | null;
  jobTitle: string | null;
  industry: string | null;
  location: string | null;
  isVerified: boolean;
}

export interface IAlumniDepartmentRepository {
  findByDepartmentId(departmentId: string): Promise<AlumniBasicInfo[]>;
}
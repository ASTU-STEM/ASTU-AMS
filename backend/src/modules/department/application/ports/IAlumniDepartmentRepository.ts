// Assuming we fetch alumni that belong to a department. We don't have full alumni entity here,
// but we can return basic representation or just stats.
export interface AlumniBasicInfo {
  id: string;
  userId: string;
  fullName: string;
  graduationYear: number;
  employmentStatus: string;
}

export interface IAlumniDepartmentRepository {
  findByDepartmentId(departmentId: string): Promise<AlumniBasicInfo[]>;
}

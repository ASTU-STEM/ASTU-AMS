import { IDepartmentHeadRepository } from '../ports/IDepartmentHeadRepository';
import { IAlumniDepartmentRepository } from '../ports/IAlumniDepartmentRepository';
import { IDepartmentRepository } from '../ports/IDepartmentRepository';
import { DepartmentStats, Department } from '../../domain/entities/Department';
import { UnauthorizedDepartmentActionError } from '../../domain/errors/DepartmentErrors';

export class GetMyDepartment {
  constructor(
    private readonly headRepo: IDepartmentHeadRepository,
    private readonly deptRepo: IDepartmentRepository
  ) {}

  async execute(userId: string): Promise<Department> {
    const head = await this.headRepo.findByUserId(userId);
    if (!head) {
      throw new UnauthorizedDepartmentActionError('User is not assigned as a department head.');
    }
    const dept = await this.deptRepo.findById(head.departmentId);
    if (!dept) {
      throw new UnauthorizedDepartmentActionError('Department not found for this department head.');
    }
    return dept;
  }
}

export class GetDepartmentStats {
  constructor(
    private readonly headRepo: IDepartmentHeadRepository,
    private readonly alumniRepo: IAlumniDepartmentRepository
  ) {}

  async execute(userId: string): Promise<DepartmentStats> {
    const head = await this.headRepo.findByUserId(userId);
    if (!head) {
      throw new UnauthorizedDepartmentActionError('User is not assigned as a department head.');
    }

    const alumni = await this.alumniRepo.findByDepartmentId(head.departmentId);

    const totalAlumni = alumni.length;
    const employedAlumni = alumni.filter(a => a.employmentStatus === 'EMPLOYED').length;
    const selfEmployedAlumni = alumni.filter(a => a.employmentStatus === 'SELF_EMPLOYED').length;
    const unemployedAlumni = Math.max(0, totalAlumni - employedAlumni - selfEmployedAlumni);
    const placedAlumni = employedAlumni + selfEmployedAlumni;
    const employmentRate = totalAlumni > 0 ? (placedAlumni / totalAlumni) * 100 : 0;

    const salaries = alumni
      .map(a => a.salary)
      .filter((s): s is number => typeof s === 'number' && !Number.isNaN(s) && s > 0);
    const averageSalary = salaries.length > 0
      ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length)
      : null;

    return new DepartmentStats(
      totalAlumni,
      employedAlumni,
      employmentRate,
      selfEmployedAlumni,
      unemployedAlumni,
      averageSalary
    );
  }
}

export class GetDepartmentAlumni {
  constructor(
    private readonly headRepo: IDepartmentHeadRepository,
    private readonly alumniRepo: IAlumniDepartmentRepository
  ) {}

  async execute(userId: string) {
    const head = await this.headRepo.findByUserId(userId);
    if (!head) {
      throw new UnauthorizedDepartmentActionError('User is not assigned as a department head.');
    }

    return await this.alumniRepo.findByDepartmentId(head.departmentId);
  }
}

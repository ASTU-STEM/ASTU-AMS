import { IDepartmentHeadRepository } from '../ports/IDepartmentHeadRepository';
import { IAlumniDepartmentRepository } from '../ports/IAlumniDepartmentRepository';
import { DepartmentStats } from '../../domain/entities/Department';
import { UnauthorizedDepartmentActionError } from '../../domain/errors/DepartmentErrors';

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
    const employmentRate = totalAlumni > 0 ? (employedAlumni / totalAlumni) * 100 : 0;

    return new DepartmentStats(totalAlumni, employedAlumni, employmentRate);
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

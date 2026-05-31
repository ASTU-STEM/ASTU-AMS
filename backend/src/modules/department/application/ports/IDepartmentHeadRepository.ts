import { DepartmentHeadProfile } from '../../domain/entities/Department';

export interface IDepartmentHeadRepository {
  findByUserId(userId: string): Promise<DepartmentHeadProfile | null>;
}

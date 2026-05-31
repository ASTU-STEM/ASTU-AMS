import { Department } from '../../domain/entities/Department';

export interface IDepartmentRepository {
  findById(id: string): Promise<Department | null>;
  findAll(): Promise<Department[]>;
}

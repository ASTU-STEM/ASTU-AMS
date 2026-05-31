import { IDepartmentRepository } from '../../application/ports/IDepartmentRepository';
import { Department } from '../../domain/entities/Department';
import prisma from '../../../../core/config/db';

export class PrismaDepartmentRepository implements IDepartmentRepository {
  async findById(id: string): Promise<Department | null> {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) return null;
    return dept as any as Department;
  }

  async findAll(): Promise<Department[]> {
    const depts = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    return depts as any as Department[];
  }
}

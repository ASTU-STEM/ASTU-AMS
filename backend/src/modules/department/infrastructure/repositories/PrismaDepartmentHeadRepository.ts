import { IDepartmentHeadRepository } from '../../application/ports/IDepartmentHeadRepository';
import { DepartmentHeadProfile } from '../../domain/entities/Department';
import prisma from '../../../../core/config/db';

export class PrismaDepartmentHeadRepository implements IDepartmentHeadRepository {
  async findByUserId(userId: string): Promise<DepartmentHeadProfile | null> {
    const profile = await prisma.departmentHeadProfile.findUnique({
      where: { userId },
    });
    if (!profile) return null;
    return profile as any as DepartmentHeadProfile;
  }
}

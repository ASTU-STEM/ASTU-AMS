import { IEmployerProfileRepository } from '../../application/ports/IEmployerProfileRepository';
import { EmployerProfile } from '../../domain/entities/Employer';
import prisma from '../../../../core/config/db';

export class PrismaEmployerProfileRepository implements IEmployerProfileRepository {
  async findByUserId(userId: string): Promise<EmployerProfile | null> {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId },
    });
    if (!profile) return null;
    return profile as any as EmployerProfile;
  }

  async update(userId: string, data: Partial<EmployerProfile>): Promise<EmployerProfile> {
    const updated = await prisma.employerProfile.update({
      where: { userId },
      data: data as any,
    });
    return updated as any as EmployerProfile;
  }
}

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

  async create(data: Omit<EmployerProfile, 'id' | 'isVerified'>): Promise<EmployerProfile> {
    const created = await prisma.employerProfile.create({
      data: data as any,
    });
    return created as any as EmployerProfile;
  }

  async delete(userId: string): Promise<void> {
    const profile = await this.findByUserId(userId);
    if (profile) {
      await prisma.employerProfile.delete({
        where: { id: profile.id },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
    }
  }
}

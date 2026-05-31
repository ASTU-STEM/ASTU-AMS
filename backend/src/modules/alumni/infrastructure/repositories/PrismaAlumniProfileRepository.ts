import { IAlumniProfileRepository } from '../../application/ports/IAlumniProfileRepository';
import { AlumniProfile } from '../../domain/entities/Alumni';
import prisma from '../../../../core/config/db';

export class PrismaAlumniProfileRepository implements IAlumniProfileRepository {
  async findByUserId(userId: string): Promise<AlumniProfile | null> {
    const data = await prisma.alumniProfile.findUnique({
      where: { userId },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        department: true,
      },
    });

    if (!data) return null;

    return {
      ...data,
      // Pass raw data back, since the entity has exactly these fields
      // In strict DDD, we map exactly, but for this project we'll pass the whole object
    } as any as AlumniProfile;
  }

  async update(userId: string, updateData: Partial<AlumniProfile>): Promise<AlumniProfile> {
    const updated = await prisma.alumniProfile.update({
      where: { userId },
      data: updateData as any,
    });
    return updated as any as AlumniProfile;
  }
}

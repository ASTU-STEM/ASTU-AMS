import { IRegistrarAlumniRepository } from '../../application/ports/IRegistrarAlumniRepository';
import prisma from '../../../../core/config/db';
import { AlumniStatus } from '@prisma/client';

export class PrismaRegistrarAlumniRepository implements IRegistrarAlumniRepository {
  async findById(alumniId: string): Promise<any | null> {
    return prisma.alumniProfile.findUnique({
      where: { id: alumniId },
      include: {
        user: true,
        department: true,
      },
    });
  }

  async findAll(status?: string): Promise<any[]> {
    const whereClause = status ? { status: status as AlumniStatus } : {};
    return prisma.alumniProfile.findMany({
      where: whereClause,
      include: {
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(alumniId: string, status: string): Promise<any> {
    return prisma.alumniProfile.update({
      where: { id: alumniId },
      data: { status: status as AlumniStatus },
    });
  }
}

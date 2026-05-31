import { IWorkExperienceRepository } from '../../application/ports/IWorkExperienceRepository';
import { WorkExperience } from '../../domain/entities/Alumni';
import prisma from '../../../../core/config/db';

export class PrismaWorkExperienceRepository implements IWorkExperienceRepository {
  async findById(id: string): Promise<WorkExperience | null> {
    const data = await prisma.workExperience.findUnique({ where: { id } });
    if (!data) return null;
    return data as any as WorkExperience;
  }

  async create(data: Omit<WorkExperience, 'id'>): Promise<WorkExperience> {
    const created = await prisma.workExperience.create({ data: data as any });
    return created as any as WorkExperience;
  }

  async update(id: string, data: Partial<WorkExperience>): Promise<WorkExperience> {
    const updated = await prisma.workExperience.update({
      where: { id },
      data: data as any,
    });
    return updated as any as WorkExperience;
  }

  async delete(id: string): Promise<void> {
    await prisma.workExperience.delete({ where: { id } });
  }
}

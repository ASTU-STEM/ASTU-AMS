import { IJobRepository } from '../../application/ports/IJobRepository';
import { Job } from '../../domain/entities/Employer';
import prisma from '../../../../core/config/db';

export class PrismaJobRepository implements IJobRepository {
  async findById(jobId: string): Promise<Job | null> {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return null;
    return job as any as Job;
  }

  async findByEmployerId(employerId: string): Promise<Job[]> {
    const jobs = await prisma.job.findMany({
      where: { employerId },
      orderBy: { createdAt: 'desc' },
    });
    return jobs as any as Job[];
  }

  async search(criteria: any): Promise<Job[]> {
    const { department, employmentType, location, experienceLevel, skills } = criteria;
    const whereClause: any = { status: 'PUBLISHED' };

    if (department) whereClause.department = department;
    if (employmentType) whereClause.employmentType = employmentType;
    if (location) whereClause.location = { contains: location, mode: 'insensitive' };
    if (experienceLevel) whereClause.experienceLevel = experienceLevel;
    if (skills && Array.isArray(skills) && skills.length > 0) {
      whereClause.skillsRequired = { hasSome: skills };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return jobs as any as Job[];
  }

  async create(data: Omit<Job, 'id'>): Promise<Job> {
    const created = await prisma.job.create({ data: data as any });
    return created as any as Job;
  }

  async update(jobId: string, data: Partial<Job>): Promise<Job> {
    const updated = await prisma.job.update({
      where: { id: jobId },
      data: data as any,
    });
    return updated as any as Job;
  }

  async delete(jobId: string): Promise<void> {
    await prisma.job.delete({ where: { id: jobId } });
  }
}

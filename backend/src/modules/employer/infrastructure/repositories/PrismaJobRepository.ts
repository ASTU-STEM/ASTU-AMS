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
    // For simplicity, returning active jobs. In reality, apply filters from criteria.
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
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

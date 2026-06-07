import { IJobViewRepository } from '../../application/ports/IJobViewRepository';
import prisma from '../../../../core/config/db';

export class PrismaJobViewRepository implements IJobViewRepository {

  async record(jobId: string, alumniId?: string | null, viewerIp?: string | null): Promise<void> {
    await prisma.jobView.create({
      data: {
        jobId,
        alumniId: alumniId || null,
        viewerIp: viewerIp || null,
      },
    });
  }

  async getViewCount(jobId: string): Promise<number> {
    return prisma.jobView.count({ where: { jobId } });
  }

  async hasViewedRecently(jobId: string, alumniId: string, withinHours: number): Promise<boolean> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - withinHours);

    const count = await prisma.jobView.count({
      where: {
        jobId,
        alumniId,
        createdAt: { gte: cutoff },
      },
    });

    return count > 0;
  }
}

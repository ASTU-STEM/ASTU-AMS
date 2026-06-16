import prisma from '../../../../core/config/db';

export class GetAdminJobs {
  async execute() {
    return prisma.job.findMany({
      include: { employer: true, applications: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}

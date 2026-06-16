import prisma from '../../../../core/config/db';
import { JobStatus } from '@prisma/client';

export class ManageJobs {
  async getJobs(params: {
    page?: number;
    limit?: number;
    query?: string;
    status?: JobStatus;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: 'insensitive' } },
        { employer: { companyName: { contains: params.query, mode: 'insensitive' } } },
      ];
    }

    if (params.status && params.status !== 'All' as any) {
      where.status = params.status;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs: jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        employer: job.employer.companyName,
        type: job.employmentType,
        postedDate: job.createdAt,
        deadline: job.deadline,
        applicants: job._count.applications,
        status: job.status,
      })),
      total,
      page,
      limit,
    };
  }

  async updateJobStatus(id: string, status: JobStatus) {
    const job = await prisma.job.update({
      where: { id },
      data: { status },
    });
    return job;
  }
}

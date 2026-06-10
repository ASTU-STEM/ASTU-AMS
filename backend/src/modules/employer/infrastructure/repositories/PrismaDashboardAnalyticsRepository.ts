import { IDashboardAnalyticsRepository, EmployerDashboardStats } from '../../application/ports/IDashboardAnalyticsRepository';
import prisma from '../../../../core/config/db';

export class PrismaDashboardAnalyticsRepository implements IDashboardAnalyticsRepository {
  async getStatsByEmployerId(employerId: string): Promise<EmployerDashboardStats> {
    const activeJobs = await prisma.job.count({
      where: {
        employerId,
        status: 'PUBLISHED',
        deadline: { gte: new Date() },
      },
    });

    const closedJobs = await prisma.job.count({
      where: {
        employerId,
        status: 'CLOSED',
      },
    });

    const totalApplications = await prisma.jobApplication.count({
      where: {
        job: { employerId },
      },
    });

    const interviewsScheduled = await prisma.interview.count({
      where: {
        status: 'SCHEDULED',
        application: { job: { employerId } },
      },
    });

    const hiredCandidates = await prisma.jobApplication.count({
      where: {
        status: 'HIRED',
        job: { employerId },
      },
    });

    const hiringRate = totalApplications > 0 ? (hiredCandidates / totalApplications) * 100 : 0;

    const hiringEvents = await prisma.hiringEvent.findMany({
      where: { employerId },
      select: { timeToHireDays: true },
    });

    const averageTimeToHire = hiringEvents.length > 0
      ? hiringEvents.reduce((acc: number, curr: { timeToHireDays: number }) => acc + curr.timeToHireDays, 0) / hiringEvents.length
      : 0;

    return {
      activeJobs,
      closedJobs,
      totalApplications,
      interviewsScheduled,
      hiredCandidates,
      hiringRate,
      averageTimeToHire,
    };
  }
}

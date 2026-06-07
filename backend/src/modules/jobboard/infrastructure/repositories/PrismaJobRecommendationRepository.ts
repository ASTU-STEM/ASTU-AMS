import { IJobRecommendationRepository } from '../../application/ports/IJobRecommendationRepository';
import { JobRecommendationEntity } from '../../domain/entities/JobBoard';
import prisma from '../../../../core/config/db';

export class PrismaJobRecommendationRepository implements IJobRecommendationRepository {

  async findByAlumniId(alumniId: string, limit: number): Promise<JobRecommendationEntity[]> {
    const recs = await prisma.jobRecommendation.findMany({
      where: {
        alumniId,
        expiresAt: { gte: new Date() },
        job: {
          status: 'PUBLISHED',
          isActive: true,
          deadline: { gte: new Date() },
        },
      },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        job: {
          include: {
            employer: {
              select: {
                companyName: true,
                industry: true,
                location: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    return recs.map((r: any) => new JobRecommendationEntity(
      r.id, r.alumniId, r.jobId, r.score,
      r.reasons, r.createdAt, r.expiresAt
    ));
  }

  async upsertMany(recommendations: Array<{
    alumniId: string;
    jobId: string;
    score: number;
    reasons: string[];
    expiresAt: Date;
  }>): Promise<void> {
    // Use transaction for batch upsert
    await prisma.$transaction(
      recommendations.map(rec =>
        prisma.jobRecommendation.upsert({
          where: {
            alumniId_jobId: { alumniId: rec.alumniId, jobId: rec.jobId },
          },
          update: {
            score: rec.score,
            reasons: rec.reasons,
            expiresAt: rec.expiresAt,
          },
          create: {
            alumniId: rec.alumniId,
            jobId: rec.jobId,
            score: rec.score,
            reasons: rec.reasons,
            expiresAt: rec.expiresAt,
          },
        })
      )
    );
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.jobRecommendation.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }

  async findActiveJobsForRecommendation(): Promise<any[]> {
    return prisma.job.findMany({
      where: {
        status: 'PUBLISHED',
        isActive: true,
        deadline: { gte: new Date() },
      },
      select: {
        id: true,
        title: true,
        department: true,
        skillsRequired: true,
        experienceRequired: true,
        location: true,
        employmentType: true,
        createdAt: true,
        employer: {
          select: {
            companyName: true,
            industry: true,
          },
        },
      },
    });
  }
}

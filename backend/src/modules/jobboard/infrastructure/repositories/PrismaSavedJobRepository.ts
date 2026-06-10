import { ISavedJobRepository } from '../../application/ports/ISavedJobRepository';
import { SavedJobEntity, PaginatedResult } from '../../domain/entities/JobBoard';
import prisma from '../../../../core/config/db';

export class PrismaSavedJobRepository implements ISavedJobRepository {

  async save(alumniId: string, jobId: string): Promise<SavedJobEntity> {
    // Upsert to make this idempotent — saving an already-saved job is a no-op
    const saved = await prisma.savedJob.upsert({
      where: {
        alumniId_jobId: { alumniId, jobId },
      },
      update: {}, // No update needed — it's already saved
      create: { alumniId, jobId },
    });
    return new SavedJobEntity(saved.id, saved.alumniId, saved.jobId, saved.createdAt);
  }

  async unsave(alumniId: string, jobId: string): Promise<void> {
    await prisma.savedJob.deleteMany({
      where: { alumniId, jobId },
    });
  }

  async findByAlumniId(alumniId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;

    const [total, savedJobs] = await Promise.all([
      prisma.savedJob.count({ where: { alumniId } }),
      prisma.savedJob.findMany({
        where: { alumniId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
    ]);

    return {
      data: savedJobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isSaved(alumniId: string, jobId: string): Promise<boolean> {
    const count = await prisma.savedJob.count({
      where: { alumniId, jobId },
    });
    return count > 0;
  }
}

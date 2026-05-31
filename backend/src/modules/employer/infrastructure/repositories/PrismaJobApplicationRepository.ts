import { IJobApplicationRepository } from '../../application/ports/IJobApplicationRepository';
import { JobApplication } from '../../domain/entities/Employer';
import prisma from '../../../../core/config/db';
import { ApplicationStatus } from '@prisma/client';

export class PrismaJobApplicationRepository implements IJobApplicationRepository {
  async findById(applicationId: string): Promise<JobApplication | null> {
    const app = await prisma.jobApplication.findUnique({ where: { id: applicationId } });
    if (!app) return null;
    return app as any as JobApplication;
  }

  async findByJobId(jobId: string): Promise<JobApplication[]> {
    const apps = await prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
    return apps as any as JobApplication[];
  }

  async findByAlumniId(alumniId: string): Promise<JobApplication[]> {
    const apps = await prisma.jobApplication.findMany({
      where: { alumniId },
      orderBy: { createdAt: 'desc' },
    });
    return apps as any as JobApplication[];
  }

  async create(data: Omit<JobApplication, 'id'>): Promise<JobApplication> {
    const created = await prisma.jobApplication.create({
      data: {
        ...data,
        status: data.status as ApplicationStatus,
      } as any,
    });
    return created as any as JobApplication;
  }

  async updateStatus(applicationId: string, status: string): Promise<JobApplication> {
    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: status as ApplicationStatus },
    });
    return updated as any as JobApplication;
  }
}

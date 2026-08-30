import { IJobApplicationRepository } from '../../application/ports/IJobApplicationRepository';
import { JobApplication } from '../../domain/entities/Employer';
import prisma from '../../../../core/config/db';
import { ApplicationStatus } from '@prisma/client';

export class PrismaJobApplicationRepository implements IJobApplicationRepository {
  async findById(applicationId: string): Promise<JobApplication | null> {
    const app = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: { include: { employer: true } },
        alumni: {
          include: {
            department: true,
            user: true,
            experiences: true,
            certifications: true,
            projects: true,
            achievements: true,
          }
        }
      },
    });
    if (!app) return null;
    return app as any as JobApplication;
  }

  async findByJobId(jobId: string): Promise<JobApplication[]> {
    const apps = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        alumni: {
          include: {
            department: true,
            user: true,
            experiences: true,
            certifications: true,
            projects: true,
            achievements: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return apps as any as JobApplication[];
  }

  async findByAlumniId(alumniId: string): Promise<JobApplication[]> {
    const apps = await prisma.jobApplication.findMany({
      where: { alumniId },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });
    return apps as any as JobApplication[];
  }

  async findByEmployerId(employerId: string): Promise<JobApplication[]> {
    const apps = await prisma.jobApplication.findMany({
      where: { job: { employerId } },
      include: {
        job: true,
        alumni: {
          include: {
            department: true,
            user: true,
            experiences: true,
            certifications: true,
            projects: true,
            achievements: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const maskedApps = apps.map((app: any) => {
      if (app.alumni) {
        const prefs = (app.alumni.preferences as any) || {};
        const isCgpaAllowed = prefs.shareCgpaToEmployers !== false && app.alumni.isCgpaPublic !== false;
        if (!isCgpaAllowed) {
          app.alumni = {
            ...app.alumni,
            cgpa: null,
            cgpaHidden: true,
          };
        }
      }
      return app;
    });

    return maskedApps as any as JobApplication[];
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

  async update(applicationId: string, data: Partial<JobApplication>): Promise<JobApplication> {
    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: data as any,
    });
    return updated as any as JobApplication;
  }
}

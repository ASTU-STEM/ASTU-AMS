import { IAlumniLookupRepository } from '../../application/ports/IAlumniLookupRepository';
import { AlumniProfileSummary, AlumniApplicationView } from '../../domain/entities/JobBoard';
import prisma from '../../../../core/config/db';
import { ApplicationStatus } from '@prisma/client';

export class PrismaAlumniLookupRepository implements IAlumniLookupRepository {

  async findByUserId(userId: string): Promise<AlumniProfileSummary | null> {
    const profile = await prisma.alumniProfile.findUnique({
      where: { userId },
      include: {
        department: { select: { id: true, code: true } },
      },
    });

    if (!profile) return null;

    return new AlumniProfileSummary(
      profile.id,
      profile.userId,
      profile.fullName,
      profile.email,
      profile.departmentId,
      profile.department.code,
      profile.skills,
      profile.cgpa,
      profile.graduationYear,
      profile.resumeUrl,
      profile.status,
      profile.employmentStatus
    );
  }

  async findById(alumniId: string): Promise<AlumniProfileSummary | null> {
    const profile = await prisma.alumniProfile.findUnique({
      where: { id: alumniId },
      include: {
        department: { select: { id: true, code: true } },
      },
    });

    if (!profile) return null;

    return new AlumniProfileSummary(
      profile.id,
      profile.userId,
      profile.fullName,
      profile.email,
      profile.departmentId,
      profile.department.code,
      profile.skills,
      profile.cgpa,
      profile.graduationYear,
      profile.resumeUrl,
      profile.status,
      profile.employmentStatus
    );
  }

  async findApplicationsByAlumniId(alumniId: string): Promise<AlumniApplicationView[]> {
    const apps = await prisma.jobApplication.findMany({
      where: { alumniId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: {
            employer: {
              select: { companyName: true },
            },
          },
        },
      },
    });

    return apps.map((app: any) => new AlumniApplicationView(
      app.id,
      app.jobId,
      app.job.title,
      app.job.employer.companyName,
      app.status,
      app.resumeUrl,
      app.coverLetter,
      app.createdAt,
      app.updatedAt
    ));
  }

  async findApplicationByAlumniAndJob(alumniId: string, jobId: string): Promise<any | null> {
    return prisma.jobApplication.findFirst({
      where: { alumniId, jobId },
    });
  }

  async createApplication(data: {
    jobId: string;
    alumniId: string;
    status: string;
    resumeUrl: string | null;
    coverLetter: string | null;
  }): Promise<any> {
    return prisma.jobApplication.create({
      data: {
        ...data,
        status: data.status as ApplicationStatus,
      },
    });
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<any> {
    return prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: status as ApplicationStatus },
    });
  }
}

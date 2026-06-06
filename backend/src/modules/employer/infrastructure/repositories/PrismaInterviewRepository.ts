import { IInterviewRepository } from '../../application/ports/IInterviewRepository';
import { Interview } from '../../domain/entities/Employer';
import prisma from '../../../../core/config/db';
import { InterviewStatus } from '@prisma/client';

export class PrismaInterviewRepository implements IInterviewRepository {
  async findById(id: string): Promise<Interview | null> {
    const interview = await prisma.interview.findUnique({
      where: { id },
    });
    if (!interview) return null;
    return interview as any as Interview;
  }

  async findByEmployerId(employerId: string): Promise<Interview[]> {
    const interviews = await prisma.interview.findMany({
      where: { application: { job: { employerId } } },
      include: { application: { include: { job: true, alumni: true } } },
      orderBy: { interviewDate: 'asc' },
    });
    return interviews as any as Interview[];
  }

  async create(data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Interview> {
    const interview = await prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        interviewer: data.interviewer,
        interviewDate: data.interviewDate,
        interviewType: data.interviewType,
        meetingLink: data.meetingLink,
        location: data.location,
        notes: data.notes,
        status: 'SCHEDULED',
      },
    });
    return interview as any as Interview;
  }

  async update(id: string, data: Partial<Interview>): Promise<Interview> {
    const updated = await prisma.interview.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? (data.status as InterviewStatus) : undefined,
      } as any,
    });
    return updated as any as Interview;
  }

  async delete(id: string): Promise<void> {
    await prisma.interview.delete({
      where: { id },
    });
  }
}

import { IEmployerFeedbackRepository } from '../../application/ports/IEmployerFeedbackRepository';
import { EmployerFeedback } from '../../domain/entities/Employer';
import prisma from '../../../../core/config/db';

export class PrismaEmployerFeedbackRepository implements IEmployerFeedbackRepository {
  async create(data: Omit<EmployerFeedback, 'id' | 'createdAt'>): Promise<EmployerFeedback> {
    const created = await prisma.employerFeedback.create({
      data: {
        employerId: data.employerId,
        alumniId: data.alumniId,
        technicalSkill: data.technicalSkill,
        communicationSkill: data.communicationSkill,
        leadershipSkill: data.leadershipSkill,
        teamworkSkill: data.teamworkSkill,
        problemSolvingSkill: data.problemSolvingSkill,
        innovationSkill: data.innovationSkill,
        feedbackText: data.feedbackText,
        overallSatisfaction: data.overallSatisfaction,
        missingSkills: data.missingSkills,
        technologiesNeeded: data.technologiesNeeded,
        wouldHireAgain: data.wouldHireAgain,
      },
    });
    return created as any as EmployerFeedback;
  }

  async findByEmployerId(employerId: string): Promise<EmployerFeedback[]> {
    const feedbacks = await prisma.employerFeedback.findMany({
      where: { employerId },
      include: { alumni: { include: { department: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return feedbacks as any as EmployerFeedback[];
  }

  async findAll(): Promise<EmployerFeedback[]> {
    const feedbacks = await prisma.employerFeedback.findMany({
      include: { employer: true, alumni: { include: { department: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return feedbacks as any as EmployerFeedback[];
  }
}

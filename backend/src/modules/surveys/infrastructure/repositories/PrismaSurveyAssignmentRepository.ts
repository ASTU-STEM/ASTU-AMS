import { ISurveyAssignmentRepository } from '../../application/ports/ISurveyAssignmentRepository';
import { SurveyAssignment } from '../../domain/entities/Survey';
import prisma from '../../../../core/config/db';

export class PrismaSurveyAssignmentRepository implements ISurveyAssignmentRepository {
  async findById(id: string): Promise<SurveyAssignment | null> {
    const assignment = await prisma.surveyAssignment.findUnique({
      where: { id },
      include: {
        survey: { include: { questions: true, sections: { include: { questions: true } } } }
      }
    });
    if (!assignment) return null;
    return assignment as any as SurveyAssignment;
  }

  async findByAlumniId(alumniId: string): Promise<SurveyAssignment[]> {
    const assignments = await prisma.surveyAssignment.findMany({
      where: { alumniId },
      include: {
        survey: { include: { questions: true, sections: { include: { questions: true } } } }
      },
      orderBy: { assignedAt: 'desc' }
    });
    return assignments as any as SurveyAssignment[];
  }

  async findPendingAndInProgress(): Promise<SurveyAssignment[]> {
    const assignments = await prisma.surveyAssignment.findMany({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      include: {
        survey: { include: { questions: true, sections: { include: { questions: true } } } }
      }
    });
    return assignments as any as SurveyAssignment[];
  }

  async findBySurveyAndAlumni(surveyId: string, alumniId: string): Promise<SurveyAssignment | null> {
    const assignment = await prisma.surveyAssignment.findFirst({
      where: { surveyId, alumniId },
      include: {
        survey: { include: { questions: true, sections: { include: { questions: true } } } }
      }
    });
    if (!assignment) return null;
    return assignment as any as SurveyAssignment;
  }

  async findAll(): Promise<SurveyAssignment[]> {
    const assignments = await prisma.surveyAssignment.findMany({
      include: {
        survey: { include: { questions: true, sections: { include: { questions: true } } } },
        alumni: true,
      },
      orderBy: { assignedAt: 'desc' }
    });
    return assignments as any as SurveyAssignment[];
  }

  async create(data: Omit<SurveyAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<SurveyAssignment> {
    const assignment = await prisma.surveyAssignment.create({
      data: {
        surveyId: data.surveyId,
        alumniId: data.alumniId,
        status: data.status as any,
        assignedAt: data.assignedAt,
        dueDate: data.dueDate,
        completedAt: data.completedAt,
        sevenDayReminderSent: data.sevenDayReminderSent ?? false,
        threeDayReminderSent: data.threeDayReminderSent ?? false,
        overdueReminderSent: data.overdueReminderSent ?? false,
        responseId: data.responseId ?? null,
      },
      include: {
        survey: { include: { questions: true, sections: { include: { questions: true } } } }
      }
    });
    return assignment as any as SurveyAssignment;
  }

  async update(id: string, data: Partial<Omit<SurveyAssignment, 'id'>>): Promise<SurveyAssignment> {
    const assignment = await prisma.surveyAssignment.update({
      where: { id },
      data: {
        status: data.status as any,
        dueDate: data.dueDate,
        completedAt: data.completedAt,
        sevenDayReminderSent: data.sevenDayReminderSent,
        threeDayReminderSent: data.threeDayReminderSent,
        overdueReminderSent: data.overdueReminderSent,
        responseId: data.responseId ?? undefined,
      },
      include: {
        survey: { include: { questions: true, sections: { include: { questions: true } } } }
      }
    });
    return assignment as any as SurveyAssignment;
  }
}

import { ISurveyRepository } from '../../application/ports/ISurveyRepository';
import { Survey } from '../../domain/entities/Survey';
import prisma from '../../../../core/config/db';

export class PrismaSurveyRepository implements ISurveyRepository {
  async findById(id: string): Promise<Survey | null> {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } }
    });
    if (!survey) return null;
    return survey as any as Survey;
  }

  async findAll(activeOnly: boolean = false): Promise<Survey[]> {
    const surveys = await prisma.survey.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: { questions: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    return surveys as any as Survey[];
  }

  async create(data: Omit<Survey, 'id'>): Promise<Survey> {
    const survey = await prisma.survey.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        isActive: data.isActive,
        questions: {
          create: data.questions?.map((q: any) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options || [],
            order: q.order,
          })) || []
        }
      },
      include: { questions: true }
    });
    return survey as any as Survey;
  }
}

import { ISurveyRepository } from '../../application/ports/ISurveyRepository';
import { Survey } from '../../domain/entities/Survey';
import prisma from '../../../../core/config/db';

const milestoneTypeMap: Record<string, number> = {
  SIX_MONTH: 6,
  TWELVE_MONTH: 12,
  EIGHTEEN_MONTH: 18,
  TWENTY_FOUR_MONTH: 24,
  CUSTOM: 0,
};

export class PrismaSurveyRepository implements ISurveyRepository {
  async findById(id: string): Promise<Survey | null> {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
      }
    });
    if (!survey) return null;
    return survey as any as Survey;
  }

  async findAll(activeOnly = false, includeArchived = false): Promise<Survey[]> {
    const filters: any = {};
    if (activeOnly) filters.isActive = true;
    if (!includeArchived) filters.isArchived = false;

    const surveys = await prisma.survey.findMany({
      where: Object.keys(filters).length ? filters : undefined,
      include: {
        questions: { orderBy: { order: 'asc' } },
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
      },
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
        milestoneMonths: data.milestoneMonths ?? null,
        isActive: data.isActive,
        isArchived: data.isArchived,
        sections: {
          create: data.sections?.map((section: any) => ({
            title: section.title,
            description: section.description,
            order: section.order,
            questions: {
              create: section.questions?.map((q: any) => ({
                questionText: q.questionText,
                questionType: q.questionType,
                required: q.required ?? false,
                placeholder: q.placeholder,
                helpText: q.helpText,
                validationRules: q.validationRules ?? null,
                options: q.options || [],
                order: q.order,
              })) || []
            }
          })) || []
        },
        questions: {
          create: data.questions?.map((q: any) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required ?? false,
            placeholder: q.placeholder,
            helpText: q.helpText,
            validationRules: q.validationRules ?? null,
            options: q.options || [],
            order: q.order,
          })) || []
        }
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
      }
    });
    return survey as any as Survey;
  }

  async update(id: string, data: Partial<Omit<Survey, 'id'>>): Promise<Survey> {
    return await prisma.$transaction(async (tx: any) => {
      const existing = await tx.survey.findUnique({ where: { id } });
      if (!existing) throw new Error('Survey template not found');

      await tx.surveyQuestion.deleteMany({ where: { surveyId: id } });
      await tx.surveySection.deleteMany({ where: { surveyId: id } });

      const updated = await tx.survey.update({
        where: { id },
        data: {
          title: data.title ?? existing.title,
          description: data.description ?? existing.description,
          type: data.type ?? existing.type,
          milestoneMonths: data.milestoneMonths ?? existing.milestoneMonths,
          isActive: data.isActive ?? existing.isActive,
          isArchived: data.isArchived ?? existing.isArchived,
          sections: {
            create: data.sections?.map((section: any) => ({
              title: section.title,
              description: section.description,
              order: section.order,
              questions: {
                create: section.questions?.map((q: any) => ({
                  questionText: q.questionText,
                  questionType: q.questionType,
                  required: q.required ?? false,
                  placeholder: q.placeholder,
                  helpText: q.helpText,
                  validationRules: q.validationRules ?? null,
                  options: q.options || [],
                  order: q.order,
                })) || []
              }
            })) || []
          },
          questions: {
            create: data.questions?.map((q: any) => ({
              questionText: q.questionText,
              questionType: q.questionType,
              required: q.required ?? false,
              placeholder: q.placeholder,
              helpText: q.helpText,
              validationRules: q.validationRules ?? null,
              options: q.options || [],
              order: q.order,
            })) || []
          }
        },
        include: {
          questions: { orderBy: { order: 'asc' } },
          sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
        }
      });

      return updated as any as Survey;
    });
  }

  async archive(id: string): Promise<Survey> {
    const survey = await prisma.survey.update({
      where: { id },
      data: { isActive: false, isArchived: true },
      include: {
        questions: { orderBy: { order: 'asc' } },
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
      }
    });
    return survey as any as Survey;
  }

  async clone(id: string): Promise<Survey> {
    const source = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
      }
    });
    if (!source) throw new Error('Survey template not found');

    const clone = await prisma.survey.create({
      data: {
        title: `Copy of ${source.title}`,
        description: source.description,
        type: source.type,
        milestoneMonths: source.milestoneMonths,
        isActive: false,
        isArchived: false,
        sections: {
          create: source.sections.map((section: any) => ({
            title: section.title,
            description: section.description,
            order: section.order,
            questions: {
              create: section.questions.map((question: any) => ({
                questionText: question.questionText,
                questionType: question.questionType,
                required: question.required,
                placeholder: question.placeholder,
                helpText: question.helpText,
                validationRules: question.validationRules,
                options: question.options,
                order: question.order,
              }))
            }
          }))
        },
        questions: {
          create: source.questions.map((question: any) => ({
            questionText: question.questionText,
            questionType: question.questionType,
            required: question.required,
            placeholder: question.placeholder,
            helpText: question.helpText,
            validationRules: question.validationRules,
            options: question.options,
            order: question.order,
          }))
        }
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
      }
    });

    return clone as any as Survey;
  }

  async findByMilestone(months: number): Promise<Survey | null> {
    const byMilestone = await prisma.survey.findFirst({
      where: {
        isActive: true,
        isArchived: false,
        OR: [
          { milestoneMonths: months },
          { AND: [
            { milestoneMonths: null },
            { type: Object.keys(milestoneTypeMap).find((key) => milestoneTypeMap[key] === months) as any }
          ] }
        ]
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
      }
    });
    return byMilestone as any as Survey | null;
  }
}

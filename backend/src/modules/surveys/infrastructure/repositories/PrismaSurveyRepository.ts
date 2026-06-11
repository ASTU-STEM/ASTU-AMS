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
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
        _count: { select: { assignments: true, responses: true } }
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
        sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
        _count: { select: { assignments: true, responses: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return surveys as any as Survey[];
  }

  async create(data: Omit<Survey, 'id'>): Promise<Survey> {
    return await prisma.$transaction(async (tx: any) => {
      const survey = await tx.survey.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          milestoneMonths: data.milestoneMonths ?? null,
          isActive: data.isActive,
          isArchived: data.isArchived,
        }
      });

      if (data.questions && data.questions.length > 0) {
        const directQuestions = data.questions.map((q: any) => ({
          surveyId: survey.id,
          questionText: q.questionText,
          questionType: q.questionType,
          required: q.required ?? false,
          placeholder: q.placeholder,
          helpText: q.helpText,
          validationRules: q.validationRules ?? null,
          options: q.options || [],
          order: q.order,
        }));
        await tx.surveyQuestion.createMany({ data: directQuestions });
      }

      if (data.sections && data.sections.length > 0) {
        for (const sectionData of data.sections) {
          const section = await tx.surveySection.create({
            data: {
              surveyId: survey.id,
              title: sectionData.title,
              description: sectionData.description,
              order: sectionData.order,
            }
          });

          if (sectionData.questions && sectionData.questions.length > 0) {
            const sectionQuestions = sectionData.questions.map((q: any) => ({
              surveyId: survey.id,
              sectionId: section.id,
              questionText: q.questionText,
              questionType: q.questionType,
              required: q.required ?? false,
              placeholder: q.placeholder,
              helpText: q.helpText,
              validationRules: q.validationRules ?? null,
              options: q.options || [],
              order: q.order,
            }));
            await tx.surveyQuestion.createMany({ data: sectionQuestions });
          }
        }
      }

      const fullSurvey = await tx.survey.findUnique({
        where: { id: survey.id },
        include: {
          questions: { orderBy: { order: 'asc' } },
          sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
          _count: { select: { assignments: true, responses: true } }
        }
      });

      return fullSurvey as any as Survey;
    });
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
        }
      });

      if (data.questions && data.questions.length > 0) {
        const directQuestions = data.questions.map((q: any) => ({
          surveyId: id,
          questionText: q.questionText,
          questionType: q.questionType,
          required: q.required ?? false,
          placeholder: q.placeholder,
          helpText: q.helpText,
          validationRules: q.validationRules ?? null,
          options: q.options || [],
          order: q.order,
        }));
        await tx.surveyQuestion.createMany({ data: directQuestions });
      }

      if (data.sections && data.sections.length > 0) {
        for (const sectionData of data.sections) {
          const section = await tx.surveySection.create({
            data: {
              surveyId: id,
              title: sectionData.title,
              description: sectionData.description,
              order: sectionData.order,
            }
          });

          if (sectionData.questions && sectionData.questions.length > 0) {
            const sectionQuestions = sectionData.questions.map((q: any) => ({
              surveyId: id,
              sectionId: section.id,
              questionText: q.questionText,
              questionType: q.questionType,
              required: q.required ?? false,
              placeholder: q.placeholder,
              helpText: q.helpText,
              validationRules: q.validationRules ?? null,
              options: q.options || [],
              order: q.order,
            }));
            await tx.surveyQuestion.createMany({ data: sectionQuestions });
          }
        }
      }

      const fullSurvey = await tx.survey.findUnique({
        where: { id },
        include: {
          questions: { orderBy: { order: 'asc' } },
          sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
          _count: { select: { assignments: true, responses: true } }
        }
      });

      return fullSurvey as any as Survey;
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

    return await prisma.$transaction(async (tx: any) => {
      const clone = await tx.survey.create({
        data: {
          title: `Copy of ${source.title}`,
          description: source.description,
          type: source.type,
          milestoneMonths: source.milestoneMonths,
          isActive: false,
          isArchived: false,
        }
      });

      if (source.questions && source.questions.length > 0) {
        const directQuestions = source.questions.map((question: any) => ({
          surveyId: clone.id,
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required,
          placeholder: question.placeholder,
          helpText: question.helpText,
          validationRules: question.validationRules,
          options: question.options,
          order: question.order,
        }));
        await tx.surveyQuestion.createMany({ data: directQuestions });
      }

      if (source.sections && source.sections.length > 0) {
        for (const section of source.sections) {
          const newSection = await tx.surveySection.create({
            data: {
              surveyId: clone.id,
              title: section.title,
              description: section.description,
              order: section.order,
            }
          });

          if (section.questions && section.questions.length > 0) {
            const sectionQuestions = section.questions.map((question: any) => ({
              surveyId: clone.id,
              sectionId: newSection.id,
              questionText: question.questionText,
              questionType: question.questionType,
              required: question.required,
              placeholder: question.placeholder,
              helpText: question.helpText,
              validationRules: question.validationRules,
              options: question.options,
              order: question.order,
            }));
            await tx.surveyQuestion.createMany({ data: sectionQuestions });
          }
        }
      }

      const fullClone = await tx.survey.findUnique({
        where: { id: clone.id },
        include: {
          questions: { orderBy: { order: 'asc' } },
          sections: { include: { questions: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } }
        }
      });

      return fullClone as any as Survey;
    });
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

import { ISurveyResponseRepository } from '../../application/ports/ISurveyResponseRepository';
import { SurveyResponse } from '../../domain/entities/Survey';
import prisma from '../../../../core/config/db';

export class PrismaSurveyResponseRepository implements ISurveyResponseRepository {
  async findById(id: string): Promise<SurveyResponse | null> {
    const response = await prisma.surveyResponse.findUnique({
      where: { id },
      include: { answers: true }
    });
    if (!response) return null;
    return response as any as SurveyResponse;
  }

  async findByAlumniAndSurvey(alumniId: string, surveyId: string): Promise<SurveyResponse | null> {
    const response = await prisma.surveyResponse.findFirst({
      where: { alumniId, surveyId },
      include: { answers: true }
    });
    if (!response) return null;
    return response as any as SurveyResponse;
  }

  async findDraftByAssignment(assignmentId: string): Promise<SurveyResponse | null> {
    const response = await prisma.surveyResponse.findFirst({
      where: { assignmentId },
      include: { answers: true }
    });
    if (!response) return null;
    return response as any as SurveyResponse;
  }

  async findBySurveyId(surveyId: string): Promise<SurveyResponse[]> {
    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId, isDraft: false },
      include: {
        answers: { include: { question: true } },
        alumni: { include: { department: true, user: true } },
        survey: true,
      },
      orderBy: { submittedAt: 'desc' }
    });
    return responses as any as SurveyResponse[];
  }

  async findAll(): Promise<SurveyResponse[]> {
    const responses = await prisma.surveyResponse.findMany({
      where: { isDraft: false },
      include: {
        answers: { include: { question: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return responses as any as SurveyResponse[];
  }

  async create(data: Omit<SurveyResponse, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<SurveyResponse, 'assignmentId' | 'submittedAt'>>): Promise<SurveyResponse> {
    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: data.surveyId,
        alumniId: data.alumniId,
        assignmentId: data.assignmentId,
        isDraft: data.isDraft ?? false,
        submittedAt: data.submittedAt ?? null,
        answers: {
          create: data.answers?.map((ans: any) => ({
            questionId: ans.questionId,
            answerText: ans.answerText
          })) || []
        }
      },
      include: { answers: true }
    });
    return response as any as SurveyResponse;
  }

  async update(id: string, data: Partial<Omit<SurveyResponse, 'id'>>): Promise<SurveyResponse> {
    if (data.answers) {
      await prisma.surveyAnswer.deleteMany({ where: { responseId: id } });
    }

    const response = await prisma.surveyResponse.update({
      where: { id },
      data: {
        isDraft: data.isDraft,
        submittedAt: data.submittedAt,
        assignmentId: data.assignmentId,
        answers: data.answers ? {
          create: data.answers.map((ans: any) => ({
            questionId: ans.questionId,
            answerText: ans.answerText
          }))
        } : undefined,
      },
      include: { answers: true }
    });
    return response as any as SurveyResponse;
  }
}

import { ISurveyResponseRepository } from '../../application/ports/ISurveyResponseRepository';
import { SurveyResponse } from '../../domain/entities/Survey';
import prisma from '../../../../core/config/db';

export class PrismaSurveyResponseRepository implements ISurveyResponseRepository {
  async findByAlumniAndSurvey(alumniId: string, surveyId: string): Promise<SurveyResponse | null> {
    const response = await prisma.surveyResponse.findFirst({
      where: { alumniId, surveyId },
      include: { answers: true }
    });
    if (!response) return null;
    return response as any as SurveyResponse;
  }

  async create(data: Omit<SurveyResponse, 'id' | 'submittedAt'>): Promise<SurveyResponse> {
    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: data.surveyId,
        alumniId: data.alumniId,
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

  async findBySurveyId(surveyId: string): Promise<SurveyResponse[]> {
    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId },
      include: { answers: true }
    });
    return responses as any as SurveyResponse[];
  }
}

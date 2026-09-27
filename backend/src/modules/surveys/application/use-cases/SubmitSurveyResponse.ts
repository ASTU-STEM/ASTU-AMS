import { ISurveyRepository } from '../ports/ISurveyRepository';
import { mapEmploymentStatusAnswer, type MappedEmploymentStatus } from '../../../../shared/employmentStatusText';
import { ISurveyResponseRepository } from '../ports/ISurveyResponseRepository';
import { DuplicateSurveyResponseError, InactiveSurveyError, SurveyNotFoundError } from '../../domain/errors/SurveyErrors';
import prisma from '../../../../core/config/db';

export class SubmitSurveyResponse {
  constructor(
    private readonly surveyRepo: ISurveyRepository,
    private readonly responseRepo: ISurveyResponseRepository
  ) {}

  async execute(surveyId: string, alumniId: string, answers: any[]) {
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) throw new SurveyNotFoundError();
    if (!survey.isActive) throw new InactiveSurveyError();

    const existing = await this.responseRepo.findByAlumniAndSurvey(alumniId, surveyId);
    if (existing) throw new DuplicateSurveyResponseError();

    const result = await prisma.$transaction(async (tx: any) => {
      const response = await this.responseRepo.create({
        surveyId,
        alumniId,
        assignmentId: null,
        answers,
      });

      // Analyze answers to update AlumniProfile
      let employmentStatus: MappedEmploymentStatus | undefined;
      let salary: number | undefined;

      for (const ans of answers) {
        const question = await tx.surveyQuestion.findUnique({
          where: { id: ans.questionId },
        });
        if (question) {
          const text = question.questionText.toLowerCase();
          if (text.includes('employment status')) {
            employmentStatus = mapEmploymentStatusAnswer(ans.answerText);
          } else if (text.includes('monthly gross salary') || text.includes('monthly salary')) {
            const val = ans.answerText;
            if (val.includes('Under 10,000')) salary = 8000;
            else if (val.includes('10,000 - 20,000')) salary = 15000;
            else if (val.includes('20,001 - 35,000')) salary = 27500;
            else if (val.includes('35,001 - 50,000')) salary = 42500;
            else if (val.includes('Above 50,000')) salary = 60000;
          }
        }
      }

      if (employmentStatus !== undefined || salary !== undefined) {
        await tx.alumniProfile.update({
          where: { id: alumniId },
          data: {
            ...(employmentStatus && { employmentStatus }),
            ...(salary !== undefined && { salary }),
          },
        });
      }

      return response;
    });

    return result;
  }
}

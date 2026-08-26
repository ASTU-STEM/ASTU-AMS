import { ISurveyAssignmentRepository } from '../ports/ISurveyAssignmentRepository';
import { ISurveyResponseRepository } from '../ports/ISurveyResponseRepository';
import { ApiError } from '../../../../core/errors/ApiError';
import { PrismaNotificationRepository } from '../../../notifications/infrastructure/repositories/PrismaNotificationRepository';
import { EmailService } from '../../../../core/services/EmailService';
import prisma from '../../../../core/config/db';

export class SubmitAssignedSurvey {
  private notificationRepo = new PrismaNotificationRepository();
  private emailService = new EmailService();

  constructor(
    private readonly assignmentRepo: ISurveyAssignmentRepository,
    private readonly responseRepo: ISurveyResponseRepository
  ) {}

  async execute(alumniId: string, assignmentIdParam: any, answersParam: any = []) {
    const assignmentId = typeof assignmentIdParam === 'string' ? assignmentIdParam : (typeof answersParam === 'string' ? answersParam : '');
    const answers = Array.isArray(answersParam) ? answersParam : (Array.isArray(assignmentIdParam) ? assignmentIdParam : []);

    const assignment = await this.assignmentRepo.findById(assignmentId);
    if (!assignment) throw new ApiError('Survey assignment not found', 404);
    if (assignment.alumniId !== alumniId) throw new ApiError('Access denied', 403);
    if (assignment.status === 'EXPIRED') throw new ApiError('Assignment has expired', 400);

    const existingResponse = await prisma.surveyResponse.findFirst({
      where: { assignmentId },
      include: { answers: true }
    });

    if (assignment.status === 'COMPLETED' && existingResponse) {
      return existingResponse;
    }

    const now = new Date();

    // Fetch valid question IDs for this survey to ensure foreign key compliance
    const surveyQuestions = await prisma.surveyQuestion.findMany({
      where: {
        OR: [
          { surveyId: assignment.surveyId },
          { section: { surveyId: assignment.surveyId } }
        ]
      }
    });

    const questionMap = new Map<string, string>();
    surveyQuestions.forEach((q, idx) => {
      questionMap.set(q.id, q.id);
      questionMap.set(String(idx + 1), q.id);
      questionMap.set(`q-${idx + 1}`, q.id);
    });

    // Sanitize answers so questionId always references a valid SurveyQuestion in Prisma
    const validAnswers = (answers || [])
      .map((ans: any, idx: number) => {
        let validQId = questionMap.get(ans.questionId) || surveyQuestions[idx]?.id || surveyQuestions[0]?.id;
        if (!validQId) return null;
        return {
          questionId: validQId,
          answerText: String(ans.answerText || '')
        };
      })
      .filter(Boolean) as { questionId: string; answerText: string }[];

    const responseData = {
      assignmentId,
      alumniId,
      surveyId: assignment.surveyId,
      answers: validAnswers,
      isDraft: false,
      submittedAt: now,
    };

    let savedResponse: any;
    if (existingResponse) {
      savedResponse = await this.responseRepo.update(existingResponse.id, responseData as any);
    } else {
      savedResponse = await this.responseRepo.create(responseData as any);
    }

    await this.assignmentRepo.update(assignmentId, {
      status: 'COMPLETED',
      completedAt: now,
      responseId: savedResponse.id,
    });

    // Analyze answers to update AlumniProfile
    let employmentStatus: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | undefined;
    let salary: number | undefined;

    for (const ans of validAnswers) {
      const question = surveyQuestions.find(q => q.id === ans.questionId);
      if (question) {
        const text = question.questionText.toLowerCase();
        if (text.includes('employment status')) {
          const val = ans.answerText.toLowerCase();
          if (val.includes('self-employed')) employmentStatus = 'SELF_EMPLOYED';
          else if (val.includes('employed')) employmentStatus = 'EMPLOYED';
          else employmentStatus = 'UNEMPLOYED';
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
      await prisma.alumniProfile.update({
        where: { id: alumniId },
        data: {
          ...(employmentStatus && { employmentStatus }),
          ...(salary !== undefined && { salary }),
        },
      }).catch(() => {});
    }

    // ─── Post-submission notifications ─────────────────────────────────────
    const surveyTitle = (assignment as any).survey?.title ?? 'Tracer Survey';

    // 1. Notify the alumni: confirmation
    try {
      await this.notificationRepo.create({
        userId: alumniId,
        title: '✅ Survey Submitted Successfully',
        content: `Your response for "${surveyTitle}" has been recorded. Thank you for participating!`,
        isRead: false,
      } as any);
    } catch { /* non-critical */ }

    // 2. Notify all admins and registrars
    try {
      const staff = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'REGISTRAR'] } },
        select: { id: true, email: true },
      });

      const alumniProfile = await prisma.alumniProfile.findUnique({
        where: { userId: alumniId },
        select: { fullName: true, email: true },
      });

      const alumniName = alumniProfile ? alumniProfile.fullName.trim() : 'An alumnus';

      await Promise.allSettled([
        ...staff.map((s: any) =>
          this.notificationRepo.create({
            userId: s.id,
            title: '📬 New Survey Response',
            content: `${alumniName} submitted a response for "${surveyTitle}".`,
            isRead: false,
          } as any)
        ),
        alumniProfile?.email
          ? this.emailService.sendGenericNotification(
              alumniProfile.email,
              `Survey Submitted: ${surveyTitle}`,
              `Your response for the survey "<strong>${surveyTitle}</strong>" has been received. Thank you for helping ASTU maintain ABET accreditation standards.`
            )
          : Promise.resolve(),
      ]);
    } catch { /* non-critical */ }

    return savedResponse;
  }
}

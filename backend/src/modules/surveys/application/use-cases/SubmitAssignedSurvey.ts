import { ISurveyAssignmentRepository } from '../ports/ISurveyAssignmentRepository';
import { ISurveyResponseRepository } from '../ports/ISurveyResponseRepository';
import { ApiError } from '../../../../core/errors/ApiError';
import prisma from '../../../../core/config/db';

export class SubmitAssignedSurvey {
  constructor(
    private readonly assignmentRepo: ISurveyAssignmentRepository,
    private readonly responseRepo: ISurveyResponseRepository
  ) {}

  async execute(alumniId: string, assignmentId: string, answers: any[]) {
    const assignment = await this.assignmentRepo.findById(assignmentId);
    if (!assignment) throw new ApiError('Survey assignment not found', 404);
    if (assignment.alumniId !== alumniId) throw new ApiError('Access denied', 403);
    if (assignment.status === 'COMPLETED') throw new ApiError('Survey already submitted', 409);
    if (assignment.status === 'EXPIRED') throw new ApiError('Assignment has expired', 400);

    const now = new Date();
    const existingDraft = await this.responseRepo.findDraftByAssignment(assignmentId);

    const responseData = {
      assignmentId,
      alumniId,
      surveyId: assignment.surveyId,
      answers,
      isDraft: false,
      submittedAt: now,
    };

    const result = await prisma.$transaction(async (tx: any) => {
      const savedResponse = existingDraft
        ? await this.responseRepo.update(existingDraft.id, responseData)
        : await this.responseRepo.create(responseData as any);

      await this.assignmentRepo.update(assignmentId, {
        status: 'COMPLETED',
        completedAt: now,
        responseId: savedResponse.id,
      });

      return savedResponse;
    });

    return result;
  }
}

import { ISurveyAssignmentRepository } from '../ports/ISurveyAssignmentRepository';
import { ISurveyResponseRepository } from '../ports/ISurveyResponseRepository';
import { ApiError } from '../../../../core/errors/ApiError';

export class SaveSurveyDraft {
  constructor(
    private readonly assignmentRepo: ISurveyAssignmentRepository,
    private readonly responseRepo: ISurveyResponseRepository
  ) {}

  async execute(alumniId: string, assignmentId: string, answers: any[]) {
    const assignment = await this.assignmentRepo.findById(assignmentId);
    if (!assignment) throw new ApiError('Survey assignment not found', 404);
    if (assignment.alumniId !== alumniId) throw new ApiError('Access denied', 403);
    if (assignment.status === 'COMPLETED') throw new ApiError('Cannot save draft for a completed survey', 400);
    if (assignment.status === 'EXPIRED') throw new ApiError('Cannot save draft for an expired survey', 400);

    const existingDraft = await this.responseRepo.findDraftByAssignment(assignmentId);
    const draftData = {
      assignmentId,
      alumniId,
      surveyId: assignment.surveyId,
      answers,
      isDraft: true,
      submittedAt: null,
    };

    const response = existingDraft
      ? await this.responseRepo.update(existingDraft.id, draftData)
      : await this.responseRepo.create(draftData as any);

    if (assignment.status === 'PENDING') {
      await this.assignmentRepo.update(assignmentId, { status: 'IN_PROGRESS' });
    }

    return response;
  }
}

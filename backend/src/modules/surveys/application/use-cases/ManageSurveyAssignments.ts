import { ISurveyAssignmentRepository } from '../ports/ISurveyAssignmentRepository';
import { SurveyAssignment } from '../../domain/entities/Survey';
import { ApiError } from '../../../../core/errors/ApiError';

export class GetSurveyAssignments {
  constructor(private readonly repo: ISurveyAssignmentRepository) {}

  async execute() {
    return await this.repo.findAll();
  }
}

export class GetSurveyAssignmentById {
  constructor(private readonly repo: ISurveyAssignmentRepository) {}

  async execute(id: string) {
    const assignment = await this.repo.findById(id);
    if (!assignment) throw new ApiError('Survey assignment not found', 404);
    return assignment;
  }
}

export class GetAlumniAssignments {
  constructor(private readonly repo: ISurveyAssignmentRepository) {}

  async execute(alumniId: string) {
    return await this.repo.findByAlumniId(alumniId);
  }
}

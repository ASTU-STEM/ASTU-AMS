import { ISurveyResponseRepository } from '../ports/ISurveyResponseRepository';
import { SurveyResponse } from '../../domain/entities/Survey';
import { ApiError } from '../../../../core/errors/ApiError';

export class GetSurveyResponses {
  constructor(private readonly repo: ISurveyResponseRepository) {}

  async execute() {
    return await this.repo.findAll();
  }
}

export class GetSurveyResponseById {
  constructor(private readonly repo: ISurveyResponseRepository) {}

  async execute(id: string) {
    const response = await this.repo.findById(id);
    if (!response) throw new ApiError('Survey response not found', 404);
    return response;
  }
}

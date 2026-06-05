import { ISurveyRepository } from '../ports/ISurveyRepository';
import { Survey } from '../../domain/entities/Survey';
import { ApiError } from '../../../../core/errors/ApiError';

export class CreateSurveyTemplate {
  constructor(private readonly repo: ISurveyRepository) {}

  async execute(data: Omit<Survey, 'id'>) {
    return await this.repo.create(data);
  }
}

export class GetSurveyTemplates {
  constructor(private readonly repo: ISurveyRepository) {}

  async execute(activeOnly = false, includeArchived = false) {
    return await this.repo.findAll(activeOnly, includeArchived);
  }
}

export class GetSurveyTemplateById {
  constructor(private readonly repo: ISurveyRepository) {}

  async execute(id: string) {
    const survey = await this.repo.findById(id);
    if (!survey) throw new ApiError('Survey template not found', 404);
    return survey;
  }
}

export class UpdateSurveyTemplate {
  constructor(private readonly repo: ISurveyRepository) {}

  async execute(id: string, data: Partial<Omit<Survey, 'id'>>) {
    const survey = await this.repo.findById(id);
    if (!survey) throw new ApiError('Survey template not found', 404);
    return await this.repo.update(id, data);
  }
}

export class ArchiveSurveyTemplate {
  constructor(private readonly repo: ISurveyRepository) {}

  async execute(id: string) {
    const survey = await this.repo.findById(id);
    if (!survey) throw new ApiError('Survey template not found', 404);
    return await this.repo.archive(id);
  }
}

export class CloneSurveyTemplate {
  constructor(private readonly repo: ISurveyRepository) {}

  async execute(id: string) {
    const survey = await this.repo.clone(id);
    return survey;
  }
}

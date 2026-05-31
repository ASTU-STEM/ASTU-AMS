import { ISurveyRepository } from '../ports/ISurveyRepository';

export class CreateSurvey {
  constructor(private readonly repo: ISurveyRepository) {}

  async execute(data: any) {
    return await this.repo.create({
      ...data,
      isActive: true,
    });
  }
}

export class GetSurveys {
  constructor(private readonly repo: ISurveyRepository) {}

  async execute(activeOnly: boolean = false) {
    return await this.repo.findAll(activeOnly);
  }
}

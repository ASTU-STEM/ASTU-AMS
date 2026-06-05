import { IAnalyticsRepository } from '../ports/IAnalyticsRepository';
import { AnalyticsCacheService } from '../../infrastructure/services/AnalyticsCacheService';

export class GetCurriculumAnalytics {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async execute() {
    const cacheKey = 'analytics:skills';
    const cached = await AnalyticsCacheService.get(cacheKey);
    if (cached) return cached;

    const data = await this.repo.getCurriculumAnalytics();
    await AnalyticsCacheService.set(cacheKey, data, 600);
    return data;
  }
}

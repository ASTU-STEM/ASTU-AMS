import { IAnalyticsRepository } from '../ports/IAnalyticsRepository';
import { AnalyticsCacheService } from '../../infrastructure/services/AnalyticsCacheService';

export class GetAlumniAnalytics {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async execute() {
    const cacheKey = 'analytics:alumni';
    const cached = await AnalyticsCacheService.get(cacheKey);
    if (cached) return cached;

    const data = await this.repo.getOverallEmploymentStats();
    await AnalyticsCacheService.set(cacheKey, data, 600);
    return data;
  }
}

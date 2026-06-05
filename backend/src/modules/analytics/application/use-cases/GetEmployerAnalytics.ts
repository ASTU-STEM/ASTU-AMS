import { IAnalyticsRepository } from '../ports/IAnalyticsRepository';
import { AnalyticsCacheService } from '../../infrastructure/services/AnalyticsCacheService';

export class GetEmployerAnalytics {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async execute() {
    const cacheKey = 'analytics:employers';
    const cached = await AnalyticsCacheService.get(cacheKey);
    if (cached) return cached;

    const data = await this.repo.getEmployerAnalytics();
    await AnalyticsCacheService.set(cacheKey, data, 600);
    return data;
  }
}

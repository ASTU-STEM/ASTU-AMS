import { IAnalyticsRepository } from '../ports/IAnalyticsRepository';
import { AnalyticsReport } from '../../domain/entities/Analytics';
import { AnalyticsCacheService } from '../../infrastructure/services/AnalyticsCacheService';

export class GetAnalyticsReport {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async execute(): Promise<AnalyticsReport> {
    const cacheKey = 'analytics:dashboard';
    const cached = await AnalyticsCacheService.get<any>(cacheKey);
    
    if (cached) {
      // Reconstruct classes from JSON representation
      return cached as AnalyticsReport;
    }

    const [
      overallEmployment,
      skills,
      departments,
      employers,
      departmentAnalytics,
      curriculum,
      tracer,
    ] = await Promise.all([
      this.repo.getOverallEmploymentStats(),
      this.repo.getSkillGapStats(),
      this.repo.getDepartmentMetrics(),
      this.repo.getEmployerAnalytics(),
      this.repo.getDepartmentAnalytics(),
      this.repo.getCurriculumAnalytics(),
      this.repo.getTracerAnalytics(),
    ]);

    const report = new AnalyticsReport(
      overallEmployment,
      skills,
      departments,
      employers,
      departmentAnalytics,
      curriculum,
      tracer
    );

    await AnalyticsCacheService.set(cacheKey, report, 600); // 10 minutes TTL

    return report;
  }
}

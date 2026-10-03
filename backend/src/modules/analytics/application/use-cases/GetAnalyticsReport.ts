import { IAnalyticsRepository, AnalyticsFilterParams } from '../ports/IAnalyticsRepository';
import { AnalyticsReport } from '../../domain/entities/Analytics';
import { AnalyticsCacheService } from '../../infrastructure/services/AnalyticsCacheService';

export class GetAnalyticsReport {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async execute(filters?: AnalyticsFilterParams): Promise<AnalyticsReport> {
    const yearKey = filters?.academicYear || 'all';
    const deptKey = filters?.department || 'all';
    const cacheKey = `analytics:dashboard:${yearKey}:${deptKey}`;

    await AnalyticsCacheService.clear(cacheKey).catch(() => {});

    const [
      overallEmployment,
      skills,
      departments,
      employers,
      departmentAnalytics,
      curriculum,
      tracer,
    ] = await Promise.all([
      this.repo.getOverallEmploymentStats(filters),
      this.repo.getSkillGapStats(filters),
      this.repo.getDepartmentMetrics(filters),
      this.repo.getEmployerAnalytics(filters),
      this.repo.getDepartmentAnalytics(filters),
      this.repo.getCurriculumAnalytics(filters),
      this.repo.getTracerAnalytics(filters),
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

    await AnalyticsCacheService.set(cacheKey, report, 60); // 1 minute TTL for dynamic filters

    return report;
  }
}

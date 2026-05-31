import { IAnalyticsRepository } from '../ports/IAnalyticsRepository';
import { AnalyticsReport } from '../../domain/entities/Analytics';

export class GetAnalyticsReport {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async execute(): Promise<AnalyticsReport> {
    const [overallEmployment, skills, departments] = await Promise.all([
      this.repo.getOverallEmploymentStats(),
      this.repo.getSkillGapStats(),
      this.repo.getDepartmentMetrics(),
    ]);

    return new AnalyticsReport(overallEmployment, skills, departments);
  }
}

import { EmploymentStats, SkillGapStats, DepartmentMetric } from '../../domain/entities/Analytics';

export interface IAnalyticsRepository {
  getOverallEmploymentStats(): Promise<EmploymentStats>;
  getSkillGapStats(): Promise<SkillGapStats>;
  getDepartmentMetrics(): Promise<DepartmentMetric[]>;
}

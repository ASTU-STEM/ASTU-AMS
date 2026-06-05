import { 
  EmploymentStats, 
  SkillGapStats, 
  DepartmentMetric, 
  EmployerAnalytics, 
  DepartmentAnalytics, 
  CurriculumAnalytics, 
  TracerAnalytics 
} from '../../domain/entities/Analytics';

export interface IAnalyticsRepository {
  getOverallEmploymentStats(): Promise<EmploymentStats>;
  getSkillGapStats(): Promise<SkillGapStats>;
  getDepartmentMetrics(): Promise<DepartmentMetric[]>;
  getEmployerAnalytics(): Promise<EmployerAnalytics>;
  getDepartmentAnalytics(): Promise<DepartmentAnalytics>;
  getCurriculumAnalytics(): Promise<CurriculumAnalytics>;
  getTracerAnalytics(): Promise<TracerAnalytics>;
}

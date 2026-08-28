import { 
  EmploymentStats, 
  SkillGapStats, 
  DepartmentMetric, 
  EmployerAnalytics, 
  DepartmentAnalytics, 
  CurriculumAnalytics, 
  TracerAnalytics 
} from '../../domain/entities/Analytics';

export interface AnalyticsFilterParams {
  academicYear?: string;
  department?: string;
}

export interface IAnalyticsRepository {
  getOverallEmploymentStats(filters?: AnalyticsFilterParams): Promise<EmploymentStats>;
  getSkillGapStats(filters?: AnalyticsFilterParams): Promise<SkillGapStats>;
  getDepartmentMetrics(filters?: AnalyticsFilterParams): Promise<DepartmentMetric[]>;
  getEmployerAnalytics(filters?: AnalyticsFilterParams): Promise<EmployerAnalytics>;
  getDepartmentAnalytics(filters?: AnalyticsFilterParams): Promise<DepartmentAnalytics>;
  getCurriculumAnalytics(filters?: AnalyticsFilterParams): Promise<CurriculumAnalytics>;
  getTracerAnalytics(filters?: AnalyticsFilterParams): Promise<TracerAnalytics>;
}

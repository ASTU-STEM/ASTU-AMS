// Department Head Portal Service Layer
// All data fetching should pass through this layer

import { get, post } from '../../../shared/services/api';
import {
  DepartmentOverview,
  EmploymentData,
  EmployerFeedbackData,
  SkillGapData,
  TracerSurveyData,
  CurriculumInsight,
  AccreditationReport,
  DepartmentFilterState,
  ExportReport
} from '../types/department.types';

const API_BASE = '/department';

export const departmentService = {
  async getOverview(filters?: DepartmentFilterState): Promise<DepartmentOverview> {
    const response = await post<DepartmentOverview>(`${API_BASE}/overview`, filters);
    return response;
  },

  async getEmploymentData(filters?: DepartmentFilterState): Promise<EmploymentData> {
    const response = await post<EmploymentData>(`${API_BASE}/employment`, filters);
    return response;
  },

  async getEmployerFeedback(filters?: DepartmentFilterState): Promise<EmployerFeedbackData> {
    const response = await post<EmployerFeedbackData>(`${API_BASE}/employer-feedback`, filters);
    return response;
  },

  async getSkillGapData(filters?: DepartmentFilterState): Promise<SkillGapData> {
    const response = await post<SkillGapData>(`${API_BASE}/skill-gap`, filters);
    return response;
  },

  async getTracerSurveyData(filters?: DepartmentFilterState): Promise<TracerSurveyData> {
    const response = await post<TracerSurveyData>(`${API_BASE}/tracer-surveys`, filters);
    return response;
  },

  async getCurriculumInsights(filters?: DepartmentFilterState): Promise<CurriculumInsight> {
    const response = await post<CurriculumInsight>(`${API_BASE}/curriculum`, filters);
    return response;
  },

  async getAccreditationReports(): Promise<AccreditationReport[]> {
    const response = await get<AccreditationReport[]>(`${API_BASE}/accreditation-reports`);
    return response;
  },

  async getExportReports(): Promise<ExportReport[]> {
    const response = await get<ExportReport[]>(`${API_BASE}/export-reports`);
    return response;
  },

  async generateReport(reportId: string, format: 'pdf' | 'excel'): Promise<Blob> {
    const response = await get<Blob>(`${API_BASE}/export/${reportId}?format=${format}`);
    return response;
  }
};

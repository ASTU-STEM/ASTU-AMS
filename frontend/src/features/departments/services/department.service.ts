// Department Head Portal Service Layer
// All data fetching should pass through this layer

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
import { adminApi } from '../../admin/api/adminApi';

export const departmentService = {
  // Overview metrics
  async getOverview(filters?: DepartmentFilterState): Promise<DepartmentOverview> {
    try {
      const response = await adminApi.getDepartmentOverview(filters);
      return response || {} as DepartmentOverview;
    } catch (error) {
      console.error('Failed to fetch department overview:', error);
      return {} as DepartmentOverview;
    }
  },

  // Employment analytics
  async getEmploymentData(filters?: DepartmentFilterState): Promise<EmploymentData> {
    try {
      const response = await adminApi.getEmploymentData(filters);
      return response || {} as EmploymentData;
    } catch (error) {
      console.error('Failed to fetch employment data:', error);
      return {} as EmploymentData;
    }
  },

  // Employer feedback
  async getEmployerFeedback(filters?: DepartmentFilterState): Promise<EmployerFeedbackData> {
    try {
      const response = await adminApi.getEmployerFeedback(filters);
      return response || {} as EmployerFeedbackData;
    } catch (error) {
      console.error('Failed to fetch employer feedback:', error);
      return {} as EmployerFeedbackData;
    }
  },

  // Skill gap analysis
  async getSkillGapData(filters?: DepartmentFilterState): Promise<SkillGapData> {
    try {
      const response = await adminApi.getSkillGapData(filters);
      return response || {} as SkillGapData;
    } catch (error) {
      console.error('Failed to fetch skill gap data:', error);
      return {} as SkillGapData;
    }
  },

  // Tracer survey data
  async getTracerSurveyData(filters?: DepartmentFilterState): Promise<TracerSurveyData> {
    try {
      const response = await adminApi.getTracerSurveyData(filters);
      return response || {} as TracerSurveyData;
    } catch (error) {
      console.error('Failed to fetch tracer survey data:', error);
      return {} as TracerSurveyData;
    }
  },

  // Curriculum insights
  async getCurriculumInsights(filters?: DepartmentFilterState): Promise<CurriculumInsight> {
    try {
      const response = await adminApi.getCurriculumInsights(filters);
      return response || {} as CurriculumInsight;
    } catch (error) {
      console.error('Failed to fetch curriculum insights:', error);
      return {} as CurriculumInsight;
    }
  },

  // Accreditation reports
  async getAccreditationReports(): Promise<AccreditationReport[]> {
    try {
      const response = await adminApi.getAccreditationReports();
      return response || [];
    } catch (error) {
      console.error('Failed to fetch accreditation reports:', error);
      return [];
    }
  },

  // Export reports
  async getExportReports(): Promise<ExportReport[]> {
    try {
      const response = await adminApi.getExportReports();
      return response || [];
    } catch (error) {
      console.error('Failed to fetch export reports:', error);
      return [];
    }
  },

  // Generate/export report
  async generateReport(reportId: string, format: 'pdf' | 'excel'): Promise<Blob> {
    try {
      const response = await adminApi.generateReport(reportId, format);
      return response || new Blob();
    } catch (error) {
      console.error('Failed to generate report:', error);
      return new Blob();
    }
  }
};

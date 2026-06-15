/**
 * Department Head Portal - Integration-Ready API Service
 * =======================================================
 * This service abstracts all backend API calls for the Department Head Portal.
 * Backend teams can implement the actual endpoints while the frontend
 * remains fully decoupled and integration-ready.
 *
 * Expected Base Endpoints (to be implemented by backend team):
 * GET    /api/department/overview           - Dashboard overview metrics
 * GET    /api/department/employment         - Employment analytics
 * GET    /api/department/skill-gap          - Skill gap analysis
 * GET    /api/department/employer-feedback   - Employer feedback data
 * GET    /api/department/tracer-surveys      - Tracer survey data
 * GET    /api/department/curriculum          - Curriculum insights
 * GET    /api/department/accreditation       - Accreditation reports
 * GET    /api/department/export              - Export report generation
 */

import api from "../../../services/api";

// ─── Types ───────────────────────────────────────────────────────────
import type {
  DepartmentOverview,
  EmploymentData,
  EmployerFeedbackData,
  SkillGapData,
  TracerSurveyData,
  CurriculumInsight,
  AccreditationReport,
  ExportReport,
} from "../types/department.types";

export interface DepartmentFilterParams {
  department?: string;
  batch?: string;
  academicYear?: string;
  timeRange?: "6months" | "12months" | "24months" | "all";
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Service ─────────────────────────────────────────────────────────

export const departmentApi = {
  /**
   * Get department overview dashboard metrics
   * GET /api/department/overview
   */
  async getOverview(
    params?: DepartmentFilterParams,
  ): Promise<DepartmentOverview> {
    try {
      const response = await api.get<DepartmentOverview>(
        "/department/overview",
        params as unknown as Record<string, unknown>,
      );
      return response ?? ({} as DepartmentOverview);
    } catch {
      console.warn("[DepartmentAPI] getOverview failed — returning empty data");
      return {} as DepartmentOverview;
    }
  },

  /**
   * Get employment analytics data
   * GET /api/department/employment
   */
  async getEmploymentData(
    params?: DepartmentFilterParams,
  ): Promise<EmploymentData> {
    try {
      const response = await api.get<EmploymentData>(
        "/department/employment",
        params as unknown as Record<string, unknown>,
      );
      return response ?? ({} as EmploymentData);
    } catch {
      console.warn(
        "[DepartmentAPI] getEmploymentData failed — returning empty data",
      );
      return {} as EmploymentData;
    }
  },

  /**
   * Get employer feedback data
   * GET /api/department/employer-feedback
   */
  async getEmployerFeedback(
    params?: DepartmentFilterParams,
  ): Promise<EmployerFeedbackData> {
    try {
      const response = await api.get<EmployerFeedbackData>(
        "/department/employer-feedback",
        params as unknown as Record<string, unknown>,
      );
      return response ?? ({} as EmployerFeedbackData);
    } catch {
      console.warn(
        "[DepartmentAPI] getEmployerFeedback failed — returning empty data",
      );
      return {} as EmployerFeedbackData;
    }
  },

  /**
   * Get skill gap analysis data
   * GET /api/department/skill-gap
   */
  async getSkillGapData(
    params?: DepartmentFilterParams,
  ): Promise<SkillGapData> {
    try {
      const response = await api.get<SkillGapData>(
        "/department/skill-gap",
        params as unknown as Record<string, unknown>,
      );
      return response ?? ({} as SkillGapData);
    } catch {
      console.warn(
        "[DepartmentAPI] getSkillGapData failed — returning empty data",
      );
      return {} as SkillGapData;
    }
  },

  /**
   * Get tracer survey data
   * GET /api/department/tracer-surveys
   */
  async getTracerSurveyData(
    params?: DepartmentFilterParams,
  ): Promise<TracerSurveyData> {
    try {
      const response = await api.get<TracerSurveyData>(
        "/department/tracer-surveys",
        params as unknown as Record<string, unknown>,
      );
      return response ?? ({} as TracerSurveyData);
    } catch {
      console.warn(
        "[DepartmentAPI] getTracerSurveyData failed — returning empty data",
      );
      return {} as TracerSurveyData;
    }
  },

  /**
   * Get curriculum insights
   * GET /api/department/curriculum
   */
  async getCurriculumInsights(
    params?: DepartmentFilterParams,
  ): Promise<CurriculumInsight> {
    try {
      const response = await api.get<CurriculumInsight>(
        "/department/curriculum",
        params as unknown as Record<string, unknown>,
      );
      return response ?? ({} as CurriculumInsight);
    } catch {
      console.warn(
        "[DepartmentAPI] getCurriculumInsights failed — returning empty data",
      );
      return {} as CurriculumInsight;
    }
  },

  /**
   * Get accreditation reports
   * GET /api/department/accreditation
   */
  async getAccreditationReports(): Promise<AccreditationReport[]> {
    try {
      const response = await api.get<AccreditationReport[]>(
        "/department/accreditation",
      );
      return response ?? [];
    } catch {
      console.warn(
        "[DepartmentAPI] getAccreditationReports failed — returning empty array",
      );
      return [];
    }
  },

  /**
   * Get export-ready reports list
   * GET /api/department/export
   */
  async getExportReports(): Promise<ExportReport[]> {
    try {
      const response = await api.get<ExportReport[]>("/department/export");
      return response ?? [];
    } catch {
      console.warn(
        "[DepartmentAPI] getExportReports failed — returning empty array",
      );
      return [];
    }
  },

  /**
   * Generate and download a report
   * GET /api/department/export/:reportId?format=pdf|excel
   */
  async generateReport(
    reportId: string,
    format: "pdf" | "excel",
  ): Promise<Blob> {
    try {
      const response = await api.get<Blob>(`/department/export/${reportId}`, {
        format,
      } as unknown as Record<string, unknown>);
      return response ?? new Blob();
    } catch {
      console.warn(
        "[DepartmentAPI] generateReport failed — returning empty blob",
      );
      return new Blob();
    }
  },
};

export default departmentApi;

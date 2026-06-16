import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DepartmentLayout from '../shared/layouts/DepartmentLayout';
import { ManagementHub } from '../domains/departments/pages/ManagementHub';
import { DepartmentProfile } from '../domains/departments/pages/DepartmentProfile';
import { DashboardOverview } from '../domains/departments/components/DashboardOverview';
import { EmploymentAnalytics } from '../domains/departments/components/EmploymentAnalytics';
import { SkillGapAnalysis } from '../domains/departments/components/SkillGapAnalysis';
import { EmployerFeedback } from '../domains/departments/components/EmployerFeedback';
import { TracerReports } from '../domains/departments/components/TracerReports';
import { CurriculumInsights } from '../domains/departments/components/CurriculumInsights';
import { AccreditationReports } from '../domains/departments/components/AccreditationReports';
import { ExportCenter } from '../domains/departments/components/ExportCenter';

export default function DepartmentRoutes() {
  return (
    <Routes>
      <Route element={<DepartmentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="management" element={<ManagementHub />} />
        <Route path="profile" element={<DepartmentProfile />} />
        <Route path="employment-analytics" element={<EmploymentAnalytics data={null} />} />
        <Route path="skill-gap" element={<SkillGapAnalysis data={null} />} />
        <Route path="employer-feedback" element={<EmployerFeedback data={null} />} />
        <Route path="tracer-reports" element={<TracerReports data={null} />} />
        <Route path="curriculum" element={<CurriculumInsights data={null} />} />
        <Route path="accreditation" element={<AccreditationReports />} />
        <Route path="export" element={<ExportCenter reports={[]} />} />
      </Route>
    </Routes>
  );
}

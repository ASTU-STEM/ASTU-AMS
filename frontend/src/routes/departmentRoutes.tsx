import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DepartmentLayout from '../layouts/DepartmentLayout';
import { ManagementHub } from '../features/departments/pages/ManagementHub';
import { DepartmentProfile } from '../features/departments/pages/DepartmentProfile';
import { DashboardOverview } from '../features/departments/components/DashboardOverview';
import { EmploymentAnalytics } from '../features/departments/components/EmploymentAnalytics';
import { SkillGapAnalysis } from '../features/departments/components/SkillGapAnalysis';
import { EmployerFeedback } from '../features/departments/components/EmployerFeedback';
import { TracerReports } from '../features/departments/components/TracerReports';
import { CurriculumInsights } from '../features/departments/components/CurriculumInsights';
import { AccreditationReports } from '../features/departments/components/AccreditationReports';
import { ExportCenter } from '../features/departments/components/ExportCenter';
import {
  mockEmploymentData,
  mockSkillGapData,
  mockEmployerFeedback,
  mockTracerSurveyData,
  mockCurriculumInsights,
  mockExportReports
} from '../features/departments/services/mockDepartmentData';


// Wrapper component to pass common props (darkMode) that the components currently expect
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  // Read theme from localStorage or assume light
  const isDark = localStorage.getItem('theme') === 'dark';
  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark bg-[#090d16] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {React.cloneElement(children as React.ReactElement, { darkMode: isDark })}
    </div>
  );
};

export default function DepartmentRoutes() {
  return (
    <Routes>
      <Route element={<DepartmentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Main Dashboard overview */}
        <Route path="dashboard" element={
          <ThemeWrapper>
            <DashboardOverview />
          </ThemeWrapper>
        } />
        
        {/* The management hub */}
        <Route path="management" element={
          <ThemeWrapper>
            <ManagementHub />
          </ThemeWrapper>
        } />

        {/* Profile */}
        <Route path="profile" element={
          <ThemeWrapper>
            <DepartmentProfile />
          </ThemeWrapper>
        } />
        
        {/* Analytics */}
        <Route path="employment-analytics" element={
          <ThemeWrapper>
            <EmploymentAnalytics data={null} />
          </ThemeWrapper>
        } />
        <Route path="skill-gap" element={
          <ThemeWrapper>
            <SkillGapAnalysis data={null} />
          </ThemeWrapper>
        } />
        <Route path="employer-feedback" element={
          <ThemeWrapper>
            <EmployerFeedback data={null} />
          </ThemeWrapper>
        } />
        
        {/* Reports */}
        <Route path="tracer-reports" element={
          <ThemeWrapper>
            <TracerReports data={null} />
          </ThemeWrapper>
        } />
        <Route path="curriculum" element={
          <ThemeWrapper>
            <CurriculumInsights data={null} />
          </ThemeWrapper>
        } />
        <Route path="accreditation" element={
          <ThemeWrapper>
            <AccreditationReports />
          </ThemeWrapper>
        } />
        <Route path="export" element={
          <ThemeWrapper>
            <ExportCenter reports={mockExportReports} />
          </ThemeWrapper>
        } />
      </Route>
    </Routes>
  );
}

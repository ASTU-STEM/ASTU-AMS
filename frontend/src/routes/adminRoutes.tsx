import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import UserManagement from '../features/admin/pages/UserManagement';
import RoleManagement from '../features/admin/pages/RoleManagement';
import SurveyManagement from '../features/admin/pages/SurveyManagement';
import JobsManagement from '../features/admin/pages/JobsManagement';
import AnalyticsOverview from '../features/admin/pages/AnalyticsOverview';
import DepartmentManagement from '../features/admin/pages/DepartmentManagement';
import NotificationCenter from '../features/admin/pages/NotificationCenter';
import SystemLogs from '../features/admin/pages/SystemLogs';
import BackupSecurity from '../features/admin/pages/BackupSecurity';
import SystemSettings from '../features/admin/pages/SystemSettings';
import SuperAdminModules from '../features/admin/pages/SuperAdminModules';
import ReportsCenter from '../features/admin/pages/ReportsCenter';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="modules" element={<SuperAdminModules />} />
        <Route path="reports" element={<ReportsCenter />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="analytics" element={<AnalyticsOverview />} />
        <Route path="surveys" element={<SurveyManagement />} />
        <Route path="jobs" element={<JobsManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="departments/:id" element={<DepartmentManagement />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="logs" element={<SystemLogs />} />
        <Route path="backup" element={<BackupSecurity />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>
    </Routes>
  );
}

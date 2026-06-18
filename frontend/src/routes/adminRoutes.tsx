import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../shared/layouts/AdminLayout';
import AdminDashboard from '../domains/admin/pages/AdminDashboard';
import UserManagement from '../domains/admin/pages/UserManagement';
import RoleManagement from '../domains/admin/pages/RoleManagement';
import SurveyManagement from '../domains/admin/pages/SurveyManagement';
import JobsManagement from '../domains/admin/pages/JobsManagement';
import AnalyticsOverview from '../domains/admin/pages/AnalyticsOverview';
import DepartmentManagement from '../domains/admin/pages/DepartmentManagement';
import NotificationCenter from '../domains/admin/pages/NotificationCenter';
import SystemLogs from '../domains/admin/pages/SystemLogs';
import BackupSecurity from '../domains/admin/pages/BackupSecurity';
import SystemSettings from '../domains/admin/pages/SystemSettings';
import SuperAdminModules from '../domains/admin/pages/SuperAdminModules';
import ReportsCenter from '../domains/admin/pages/ReportsCenter';
import EmailCenter from '../domains/admin/pages/EmailCenter';
import AdminProfile from '../domains/admin/pages/AdminProfile';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="modules" element={<SuperAdminModules />} />
        <Route path="reports" element={<ReportsCenter />} />
        <Route path="email" element={<EmailCenter />} />
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
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
}

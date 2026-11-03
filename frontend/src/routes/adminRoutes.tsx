import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboard'));
const UserManagement = lazy(() => import('../features/admin/pages/UserManagement'));
const RoleManagement = lazy(() => import('../features/admin/pages/RoleManagement'));
const SurveyManagement = lazy(() => import('../features/admin/pages/SurveyManagement'));
const JobsManagement = lazy(() => import('../features/admin/pages/JobsManagement'));
const AnalyticsOverview = lazy(() => import('../features/admin/pages/AnalyticsOverview'));
const DepartmentManagement = lazy(() => import('../features/admin/pages/DepartmentManagement'));
const NotificationCenter = lazy(() => import('../features/admin/pages/NotificationCenter'));
const SystemLogs = lazy(() => import('../features/admin/pages/SystemLogs'));
const BackupSecurity = lazy(() => import('../features/admin/pages/BackupSecurity'));
const SystemSettings = lazy(() => import('../features/admin/pages/SystemSettings'));
const SuperAdminModules = lazy(() => import('../features/admin/pages/SuperAdminModules'));
const ReportsCenter = lazy(() => import('../features/admin/pages/ReportsCenter'));
const AdminProfile = lazy(() => import('../features/admin/pages/AdminProfile'));
const DonationsManagement = lazy(() => import('../features/admin/pages/DonationsManagement'));
const AdminChatPage = lazy(() => import('../features/admin/pages/AdminChatPage'));
const SupportDeskManagement = lazy(() => import('../features/admin/pages/SupportDeskManagement'));
const IctAdminDashboard = lazy(() => import('../features/admin/pages/IctAdminDashboard'));
const KnowledgeBaseManagement = lazy(() => import('../features/admin/pages/KnowledgeBaseManagement'));
const PortalMenuControls = lazy(() => import('../features/admin/pages/PortalMenuControls'));

export default function AdminRoutes() {
  const { user } = useAuth();
  const defaultTab = user?.role === 'ADMIN' ? 'ict-portal' : 'dashboard';

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading workspace...</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to={defaultTab} replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="ict-portal" element={<IctAdminDashboard />} />
          <Route path="modules" element={<SuperAdminModules />} />
          <Route path="knowledge-hub" element={<KnowledgeBaseManagement />} />
          <Route path="rag-knowledge" element={<KnowledgeBaseManagement />} />
          <Route path="reports" element={<ReportsCenter />} />
          <Route path="messages" element={<AdminChatPage />} />
          <Route path="support-tickets" element={<SupportDeskManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="analytics" element={<AnalyticsOverview />} />
          <Route path="surveys" element={<SurveyManagement />} />
          <Route path="jobs" element={<JobsManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="departments/:id" element={<DepartmentManagement />} />
          <Route path="donations" element={<DonationsManagement />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="backup" element={<BackupSecurity />} />
          <Route path="menu-controls" element={<PortalMenuControls />} />
          <Route path="portal-controls" element={<PortalMenuControls />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

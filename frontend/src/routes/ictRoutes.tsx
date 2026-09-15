import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import IctLayout from '../layouts/IctLayout';
import IctCommandCenterPage from '../features/ict/pages/IctCommandCenterPage';
import IctUniversalLogsPage from '../features/ict/pages/IctUniversalLogsPage';
import IctApiGatewayPage from '../features/ict/pages/IctApiGatewayPage';
import IctObservabilityPage from '../features/ict/pages/IctObservabilityPage';
import IctIncidentsPage from '../features/ict/pages/IctIncidentsPage';
import IctSecuritySocPage from '../features/ict/pages/IctSecuritySocPage';
import IctForensicsAuditPage from '../features/ict/pages/IctForensicsAuditPage';
import IctIntegrationsPage from '../features/ict/pages/IctIntegrationsPage';
import IctFeatureFlagsPage from '../features/ict/pages/IctFeatureFlagsPage';
import IctPoliciesSessionsPage from '../features/ict/pages/IctPoliciesSessionsPage';
import IctArchitecturePage from '../features/ict/pages/IctArchitecturePage';
import IctSupportTicketsPage from '../features/ict/pages/IctSupportTicketsPage';

export default function IctRoutes() {
  return (
    <Routes>
      <Route element={<IctLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<IctCommandCenterPage />} />
        <Route path="support-tickets" element={<IctSupportTicketsPage />} />
        <Route path="logs" element={<IctUniversalLogsPage />} />
        <Route path="api-gateway" element={<IctApiGatewayPage />} />
        <Route path="observability" element={<IctObservabilityPage />} />
        <Route path="incidents" element={<IctIncidentsPage />} />
        <Route path="security" element={<IctSecuritySocPage />} />
        <Route path="audit" element={<IctForensicsAuditPage />} />
        <Route path="integrations" element={<IctIntegrationsPage />} />
        <Route path="feature-flags" element={<IctFeatureFlagsPage />} />
        <Route path="policies" element={<IctPoliciesSessionsPage />} />
        <Route path="architecture" element={<IctArchitecturePage />} />
      </Route>
    </Routes>
  );
}

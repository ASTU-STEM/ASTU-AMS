import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CmsLayout from '../layouts/CmsLayout';
import CmsDashboard from '../features/admin/pages/CmsDashboard';
import ContentGovernance from '../features/admin/pages/ContentGovernance';
import GalleryManagement from '../features/admin/pages/GalleryManagement';
import EventWorkshopManagement from '../features/admin/pages/EventWorkshopManagement';
import ContentList from '../features/admin/pages/ContentList';
import CmsSettings from '../features/admin/pages/CmsSettings';
import AnnouncementRegistrations from '../features/admin/pages/AnnouncementRegistrations';
import DedicatedRegistrationsPage from '../features/admin/pages/DedicatedRegistrationsPage';
import HomepageManagement from '../features/admin/pages/HomepageManagement';
import CmsChatPage from '../features/admin/pages/CmsChatPage';
import NotificationCenter from '../features/admin/pages/NotificationCenter';
import CommunityMembersManagement from '../features/admin/pages/CommunityMembersManagement';
import CommunityManagement from '../features/admin/pages/CommunityManagement';
import PartnersManagement from '../features/admin/pages/PartnersManagement';
import MediaGalleryHub from '../features/admin/pages/MediaGalleryHub';
import MediaLibrary from '../features/admin/pages/MediaLibrary';
import SEOManagement from '../features/admin/pages/SEOManagement';
import ApprovalWorkflow from '../features/admin/pages/ApprovalWorkflow';
import ContentTemplates from '../features/admin/pages/ContentTemplates';
import KnowledgeBaseManagement from '../features/admin/pages/KnowledgeBaseManagement';
import PortalMenuControls from '../features/admin/pages/PortalMenuControls';
import SurveyManagement from '../features/admin/pages/SurveyManagement';
import AnalyticsOverview from '../features/admin/pages/AnalyticsOverview';
import ReportsCenter from '../features/admin/pages/ReportsCenter';
import JobsManagement from '../features/admin/pages/JobsManagement';
import DonationsManagement from '../features/admin/pages/DonationsManagement';

export default function CmsRoutes() {
  return (
    <Routes>
      {/* Standalone Full Page View - Completely NO Sidebar */}
      <Route path="registrations/full" element={<DedicatedRegistrationsPage />} />
      <Route path="registrations-full" element={<DedicatedRegistrationsPage />} />

      {/* CMS Shell Layout with Sidebar */}
      <Route element={<CmsLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CmsDashboard />} />
        <Route path="surveys" element={<SurveyManagement />} />
        <Route path="tracer-studies" element={<Navigate to="/cms/surveys" replace />} />
        <Route path="analytics" element={<AnalyticsOverview />} />
        <Route path="reports" element={<ReportsCenter />} />
        <Route path="registrations" element={<AnnouncementRegistrations />} />
        <Route path="events" element={<EventWorkshopManagement />} />
        <Route path="jobs" element={<JobsManagement />} />
        <Route path="careers" element={<Navigate to="/cms/jobs" replace />} />
        <Route path="donations" element={<DonationsManagement />} />
        <Route path="homepage" element={<HomepageManagement />} />
        <Route path="content" element={<ContentList />} />
        <Route path="announcements" element={<ContentList />} />
        <Route path="partners" element={<PartnersManagement />} />
        <Route path="employers" element={<PartnersManagement />} />
        <Route path="institutional-pages" element={<HomepageManagement initialCategory="detail-pages" />} />
        <Route path="community" element={<CommunityManagement />} />
        <Route path="community-members" element={<CommunityMembersManagement />} />
        <Route path="knowledge-hub" element={<KnowledgeBaseManagement />} />
        <Route path="rag-knowledge" element={<KnowledgeBaseManagement />} />
        <Route path="portal-controls" element={<PortalMenuControls />} />
        <Route path="menu-controls" element={<PortalMenuControls />} />
        <Route path="media-gallery" element={<MediaGalleryHub />} />
        <Route path="media" element={<MediaGalleryHub />} />
        <Route path="gallery" element={<MediaGalleryHub />} />
        <Route path="seo" element={<SEOManagement />} />
        <Route path="approvals" element={<ApprovalWorkflow />} />
        <Route path="templates" element={<ContentTemplates />} />
        <Route path="messages" element={<CmsChatPage />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="settings" element={<CmsSettings />} />
      </Route>
    </Routes>
  );
}

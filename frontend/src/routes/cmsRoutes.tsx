import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CmsLayout from '../layouts/CmsLayout';

const CmsDashboard = lazy(() => import('../features/admin/pages/CmsDashboard'));
const ContentGovernance = lazy(() => import('../features/admin/pages/ContentGovernance'));
const GalleryManagement = lazy(() => import('../features/admin/pages/GalleryManagement'));
const EventWorkshopManagement = lazy(() => import('../features/admin/pages/EventWorkshopManagement'));
const ContentList = lazy(() => import('../features/admin/pages/ContentList'));
const CmsSettings = lazy(() => import('../features/admin/pages/CmsSettings'));
const AnnouncementRegistrations = lazy(() => import('../features/admin/pages/AnnouncementRegistrations'));
const DedicatedRegistrationsPage = lazy(() => import('../features/admin/pages/DedicatedRegistrationsPage'));
const HomepageManagement = lazy(() => import('../features/admin/pages/HomepageManagement'));
const CmsChatPage = lazy(() => import('../features/admin/pages/CmsChatPage'));
const NotificationCenter = lazy(() => import('../features/admin/pages/NotificationCenter'));
const CommunityManagement = lazy(() => import('../features/admin/pages/CommunityManagement'));
const PartnersManagement = lazy(() => import('../features/admin/pages/PartnersManagement'));
const MediaGalleryHub = lazy(() => import('../features/admin/pages/MediaGalleryHub'));
const MediaLibrary = lazy(() => import('../features/admin/pages/MediaLibrary'));
const SEOManagement = lazy(() => import('../features/admin/pages/SEOManagement'));
const ApprovalWorkflow = lazy(() => import('../features/admin/pages/ApprovalWorkflow'));
const ContentTemplates = lazy(() => import('../features/admin/pages/ContentTemplates'));
const DonationsManagement = lazy(() => import('../features/admin/pages/DonationsManagement'));
const JobsManagement = lazy(() => import('../features/admin/pages/JobsManagement'));
const SurveyManagement = lazy(() => import('../features/admin/pages/SurveyManagement'));
const ReportsCenter = lazy(() => import('../features/admin/pages/ReportsCenter'));
const AnalyticsOverview = lazy(() => import('../features/admin/pages/AnalyticsOverview'));
const UserManagement = lazy(() => import('../features/admin/pages/UserManagement'));
const AdminProfile = lazy(() => import('../features/admin/pages/AdminProfile'));
const KnowledgeBaseManagement = lazy(() => import('../features/admin/pages/KnowledgeBaseManagement'));

export default function CmsRoutes() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
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
        <Route path="alumni-directory" element={<UserManagement />} />
        <Route path="users" element={<Navigate to="/cms/alumni-directory" replace />} />
        <Route path="registrations" element={<AnnouncementRegistrations />} />
        <Route path="events" element={<EventWorkshopManagement />} />
        <Route path="jobs" element={<JobsManagement />} />
        <Route path="careers" element={<Navigate to="/cms/jobs" replace />} />
        <Route path="donations" element={<DonationsManagement />} />
        <Route path="homepage" element={<HomepageManagement />} />
        <Route path="content" element={<ContentList />} />
        <Route path="announcements" element={<Navigate to="/cms/content" replace />} />
        <Route path="partners" element={<PartnersManagement />} />
        <Route path="employers" element={<Navigate to="/cms/partners" replace />} />
        <Route path="institutional-pages" element={<HomepageManagement initialCategory="detail-pages" />} />
        <Route path="community" element={<CommunityManagement />} />
        <Route path="knowledge-hub" element={<KnowledgeBaseManagement />} />
        <Route path="rag-knowledge" element={<KnowledgeBaseManagement />} />
        {/* Merged into Community (members tab) — keep redirects for old bookmarks */}
        <Route path="community-members" element={<Navigate to="/cms/community?tab=members" replace />} />
        <Route path="media-gallery" element={<MediaGalleryHub />} />
        <Route path="media" element={<Navigate to="/cms/media-gallery" replace />} />
        <Route path="gallery" element={<Navigate to="/cms/media-gallery" replace />} />
        <Route path="seo" element={<SEOManagement />} />
        <Route path="approvals" element={<ApprovalWorkflow />} />
        <Route path="templates" element={<ContentTemplates />} />
        <Route path="messages" element={<CmsChatPage />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="settings" element={<CmsSettings />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
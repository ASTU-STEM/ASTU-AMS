import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CmsLayout from '../layouts/CmsLayout';
import CmsDashboard from '../features/admin/pages/CmsDashboard';
import HomepageManagement from '../features/admin/pages/HomepageManagement';
import ContentGovernance from '../features/admin/pages/ContentGovernance';
import GalleryManagement from '../features/admin/pages/GalleryManagement';
import EventWorkshopManagement from '../features/admin/pages/EventWorkshopManagement';
import ContentList from '../features/admin/pages/ContentList';
import MediaLibrary from '../features/admin/pages/MediaLibrary';
import SEOManagement from '../features/admin/pages/SEOManagement';
import ContentTemplates from '../features/admin/pages/ContentTemplates';
import ApprovalWorkflow from '../features/admin/pages/ApprovalWorkflow';
import FooterManagement from '../features/admin/pages/FooterManagement';
import LatestNewsManagement from '../features/admin/pages/LatestNewsManagement';
import FaqManagement from '../features/admin/pages/FaqManagement';
import CmsSettings from '../features/admin/pages/CmsSettings';
import CmsProfile from '../features/admin/pages/CmsProfile';

export default function CmsRoutes() {
  return (
    <Routes>
      <Route element={<CmsLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CmsDashboard />} />
        <Route path="homepage" element={<HomepageManagement />} />
        <Route path="content" element={<ContentList />} />
        <Route path="community" element={<ContentGovernance />} />
        <Route path="gallery" element={<GalleryManagement />} />
        <Route path="events" element={<EventWorkshopManagement />} />
        <Route path="footer" element={<FooterManagement />} />
        <Route path="news" element={<LatestNewsManagement />} />
        <Route path="faq" element={<FaqManagement />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="seo" element={<SEOManagement />} />
        <Route path="templates" element={<ContentTemplates />} />
        <Route path="approvals" element={<ApprovalWorkflow />} />
        <Route path="profile" element={<CmsProfile />} />
        <Route path="settings" element={<CmsSettings />} />
      </Route>
    </Routes>
  );
}

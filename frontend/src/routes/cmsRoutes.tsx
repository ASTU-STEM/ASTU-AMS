import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CmsLayout from '../shared/layouts/CmsLayout';
import CmsDashboard from '../domains/admin/pages/CmsDashboard';
import HomepageManagement from '../domains/admin/pages/HomepageManagement';
import ContentGovernance from '../domains/admin/pages/ContentGovernance';
import GalleryManagement from '../domains/admin/pages/GalleryManagement';
import EventWorkshopManagement from '../domains/admin/pages/EventWorkshopManagement';
import ContentList from '../domains/admin/pages/ContentList';
import MediaLibrary from '../domains/admin/pages/MediaLibrary';
import SEOManagement from '../domains/admin/pages/SEOManagement';
import ContentTemplates from '../domains/admin/pages/ContentTemplates';
import ApprovalWorkflow from '../domains/admin/pages/ApprovalWorkflow';
import FooterManagement from '../domains/admin/pages/FooterManagement';
import LatestNewsManagement from '../domains/admin/pages/LatestNewsManagement';
import FaqManagement from '../domains/admin/pages/FaqManagement';
import CmsSettings from '../domains/admin/pages/CmsSettings';
import CmsProfile from '../domains/admin/pages/CmsProfile';

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

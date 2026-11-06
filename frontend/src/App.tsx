import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store";

import HomePage from "./pages/HomePage";
import PartnersPage from "./pages/PartnersPage";
import EmployersPage from "./pages/EmployersPage";
import PublicInfoPage from "./pages/PublicInfoPage";
import AnnouncementListPage from "./pages/AnnouncementListPage";
import AnnouncementDetailPage from "./pages/AnnouncementDetailPage";
import PublicGalleryPage from "./pages/PublicGalleryPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import AlumniCommunityPage from "./pages/AlumniCommunityPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./features/auth/pages/LoginPage";
import AlumniRegistrationPage from "./features/auth/pages/AlumniRegistrationPage";
import AlumniActivationPage from "./features/auth/pages/AlumniActivationPage";
import NationalIdVerificationPage from "./features/auth/pages/NationalIdVerificationPage";
import VerifyNationalIdCallbackPage from "./features/auth/pages/VerifyNationalIdCallbackPage";
import EmployerRegistrationPage from "./features/auth/pages/EmployerRegistrationPage";
import VerifyOtpPage from "./features/auth/pages/VerifyOtpPage";
import VerifyManualPage from "./features/auth/pages/VerifyManualPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import Verify2FAPage from "./features/auth/pages/Verify2FAPage";
import ContactRegistrarPage from "./features/auth/pages/ContactRegistrarPage";
import SupportPage from "./features/support/pages/SupportPage";
import DedicatedRegistrationsPage from "./features/admin/pages/DedicatedRegistrationsPage";
import AlumniDashboard from "./features/alumni/pages/AlumniDashboard";
import EmployerDashboard from "./features/employers/pages/EmployerDashboard";
import RegistrarDashboard from "./features/registrar/pages/RegistrarDashboard";
import DepartmentDashboard from "./features/departments/pages/DepartmentDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoutes from "./routes/adminRoutes";
import IctRoutes from "./routes/ictRoutes";
import CmsRoutes from "./routes/cmsRoutes";
import { RegistrationProvider } from "./features/auth/contexts/RegistrationContext";
import { PortalMenuControlProvider } from "./context/PortalMenuControlContext";
import VerificationRouteGuard from "./features/auth/components/VerificationRouteGuard";

import { SystemSettingsProvider } from "./context/SystemSettingsContext";

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/info/:slug" element={<PublicInfoPage />} />
        <Route path="/announcements" element={<AnnouncementListPage />} />
        <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="/gallery" element={<PublicGalleryPage />} />
        <Route path="/stories/:id" element={<StoryDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/workshops/:id" element={<EventDetailPage />} />
        <Route path="/community" element={<AlumniCommunityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<AlumniRegistrationPage />} />
        <Route path="/activate-account" element={<AlumniActivationPage />} />
        <Route path="/employers" element={<EmployersPage />} />
        <Route path="/employers/register" element={<EmployerRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-2fa" element={<Verify2FAPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/contact-registrar" element={<ContactRegistrarPage />} />

        {/* Verification routes protected by VerificationRouteGuard */}
        <Route element={<VerificationRouteGuard />}>
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/verify-national-id" element={<NationalIdVerificationPage />} />
          <Route path="/verify-manual" element={<VerifyManualPage />} />
          <Route path="/verify-national-id/callback" element={<VerifyNationalIdCallbackPage />} />
        </Route>

        {/* Role-protected routes */}
        <Route
          path="/alumni/dashboard"
          element={
            <ProtectedRoute
              element={<AlumniDashboard />}
              allowedRoles={["ALUMNI"]}
            />
          }
        />
        <Route
          path="/alumni/tools"
          element={
            <ProtectedRoute
              element={<AlumniDashboard defaultTab="tools" />}
              allowedRoles={["ALUMNI"]}
            />
          }
        />
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute
              element={<EmployerDashboard />}
              allowedRoles={["EMPLOYER"]}
            />
          }
        />
        <Route
          path="/registrar/dashboard"
          element={
            <ProtectedRoute
              element={<RegistrarDashboard />}
              allowedRoles={["REGISTRAR"]}
            />
          }
        />
        <Route
          path="/department/dashboard"
          element={
            <ProtectedRoute
              element={<DepartmentDashboard />}
              allowedRoles={["DEPARTMENT_HEAD", "ADMIN"]}
            />
          }
        />
        <Route
          path="/ict/*"
          element={
            <ProtectedRoute
              element={<IctRoutes />}
              allowedRoles={["ADMIN", "SUPER_ADMIN"]}
            />
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute
              element={<AdminRoutes />}
              allowedRoles={["SUPER_ADMIN"]}
            />
          }
        />
        <Route
          path="/cms/registrations/full"
          element={
            <ProtectedRoute
              element={<DedicatedRegistrationsPage />}
              allowedRoles={["ADMIN", "CMS_MANAGER", "ALUMNI_OFFICE", "SUPER_ADMIN"]}
            />
          }
        />
        <Route
          path="/cms/*"
          element={
            <ProtectedRoute
              element={<CmsRoutes />}
              allowedRoles={["ADMIN", "CMS_MANAGER", "ALUMNI_OFFICE"]}
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Toaster position="top-right" containerStyle={{ zIndex: 999999 }} toastOptions={{ style: { zIndex: 999999 } }} />
      <SystemSettingsProvider>
        <RegistrationProvider>
          <PortalMenuControlProvider>
            <AppContent />
          </PortalMenuControlProvider>
        </RegistrationProvider>
      </SystemSettingsProvider>
    </Provider>
  );
}

export default App;

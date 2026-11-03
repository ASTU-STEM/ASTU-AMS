import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PartnersPage from "./pages/PartnersPage";
import EmployersPage from "./pages/EmployersPage";
import PublicInfoPage from "./pages/PublicInfoPage";
import AnnouncementListPage from "./pages/AnnouncementListPage";
import AnnouncementDetailPage from "./pages/AnnouncementDetailPage";
import PublicGalleryPage from "./pages/PublicGalleryPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import AlumniCommunityPage from "./pages/AlumniCommunityPage";
import DonationsPage from "./pages/DonationsPage";
import LoginPage from "./features/auth/pages/LoginPage";
import AlumniRegistrationPage from "./features/auth/pages/AlumniRegistrationPage";
import NationalIdVerificationPage from "./features/auth/pages/NationalIdVerificationPage";
import VerifyNationalIdCallbackPage from "./features/auth/pages/VerifyNationalIdCallbackPage";
import EmployerRegistrationPage from "./features/auth/pages/EmployerRegistrationPage";
import VerifyOtpPage from "./features/auth/pages/VerifyOtpPage";
import VerifyManualPage from "./features/auth/pages/VerifyManualPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import AlumniActivationPage from "./features/auth/pages/AlumniActivationPage";
import Verify2FAPage from "./features/auth/pages/Verify2FAPage";
import ContactRegistrarPage from "./features/auth/pages/ContactRegistrarPage";
import SupportPage from "./features/support/pages/SupportPage";
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
import VerificationRouteGuard from "./features/auth/components/VerificationRouteGuard";

import { SystemSettingsProvider } from "./context/SystemSettingsContext";

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/faq" element={<Navigate to="/info/faq" replace />} />
        <Route path="/info/:slug" element={<PublicInfoPage />} />
        <Route path="/announcements" element={<AnnouncementListPage />} />
        <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="/gallery" element={<PublicGalleryPage />} />
        <Route path="/stories/:id" element={<StoryDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/community" element={<AlumniCommunityPage />} />
        <Route path="/donations" element={<DonationsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<AlumniRegistrationPage />} />
        <Route path="/employers" element={<EmployersPage />} />
        <Route path="/employers/register" element={<EmployerRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/activate-alumni" element={<AlumniActivationPage />} />
        <Route path="/activate" element={<Navigate to="/activate-alumni" replace />} />
        <Route path="/activate-account" element={<Navigate to="/activate-alumni" replace />} />
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

        {/* Role base redirects — short paths used in emails/nav must land on dashboards */}
        <Route path="/alumni" element={<Navigate to="/alumni/dashboard" replace />} />
        <Route path="/employer" element={<Navigate to="/employer/dashboard" replace />} />
        <Route path="/employers/portal" element={<Navigate to="/employer/dashboard" replace />} />
        <Route path="/registrar" element={<Navigate to="/registrar/dashboard" replace />} />
        <Route path="/department" element={<Navigate to="/department/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/cms" element={<Navigate to="/cms/dashboard" replace />} />
        <Route path="/ict" element={<Navigate to="/ict/dashboard" replace />} />

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
          path="/alumni/jobs"
          element={
            <ProtectedRoute
              element={<AlumniDashboard defaultTab="jobs" />}
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
      <Toaster
        position="top-center"
        containerStyle={{ top: 72, zIndex: 999999 }}
        toastOptions={{
          duration: 2800,
          style: {
            zIndex: 999999,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
          },
        }}
      />
      <SystemSettingsProvider>
        <RegistrationProvider>
          <AppContent />
        </RegistrationProvider>
      </SystemSettingsProvider>
    </Provider>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

import HomePage from "./pages/HomePage";
import PartnersPage from "./pages/PartnersPage";
import EmployersPage from "./pages/EmployersPage";
import PublicInfoPage from "./pages/PublicInfoPage";
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
import SupportPage from "./features/support/pages/SupportPage";
import AlumniDashboard from "./features/alumni/pages/AlumniDashboard";
import EmployerDashboard from "./features/employers/pages/EmployerDashboard";
import RegistrarDashboard from "./features/registrar/pages/RegistrarDashboard";
import DepartmentDashboard from "./features/departments/pages/DepartmentDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoutes from "./routes/adminRoutes";
import { RegistrationProvider } from "./features/auth/contexts/RegistrationContext";
import VerificationRouteGuard from "./features/auth/components/VerificationRouteGuard";

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/info/:slug" element={<PublicInfoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<AlumniRegistrationPage />} />
        <Route path="/activate-account" element={<AlumniActivationPage />} />
        <Route path="/employers" element={<EmployersPage />} />
        <Route path="/employers/register" element={<EmployerRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/support" element={<SupportPage />} />

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
          path="/depthead/dashboard"
          element={
            <ProtectedRoute
              element={<DepartmentDashboard />}
              allowedRoles={["DEPARTMENT_HEAD", "ADMIN"]}
            />
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute
              element={<AdminRoutes />}
              allowedRoles={["ADMIN"]}
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
      <RegistrationProvider>
        <AppContent />
      </RegistrationProvider>
    </Provider>
  );
}

export default App;

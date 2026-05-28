import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./features/auth/pages/LoginPage";
import AlumniRegistrationPage from "./features/auth/pages/AlumniRegistrationPage";
import AlumniActivationPage from "./features/auth/pages/AlumniActivationPage";
import EmployersPage from "./features/auth/pages/EmployersPage";
import AlumniDashboard from "./features/alumni/pages/AlumniDashboard";
import EmployerDashboard from "./features/employers/pages/EmployerDashboard";
import RegistrarDashboard from "./features/registrar/pages/RegistrarDashboard";
import DepartmentDashboard from "./features/departments/pages/DepartmentDashboard";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<AlumniRegistrationPage />} />
        <Route path="/activate-account" element={<AlumniActivationPage />} />
        <Route path="/employers" element={<EmployersPage />} />

        {/* Role-protected routes */}
        <Route
          path="/alumni/dashboard"
          element={
            <ProtectedRoute
              element={<AlumniDashboard />}
              allowedRoles={["alumni"]}
            />
          }
        />
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute
              element={<EmployerDashboard />}
              allowedRoles={["employer"]}
            />
          }
        />
        <Route
          path="/registrar/dashboard"
          element={
            <ProtectedRoute
              element={<RegistrarDashboard />}
              allowedRoles={["registrar"]}
            />
          }
        />
        <Route
          path="/department/dashboard"
          element={
            <ProtectedRoute
              element={<DepartmentDashboard />}
              allowedRoles={["department", "admin"]}
            />
          }
        />
        <Route
          path="/depthead/dashboard"
          element={
            <ProtectedRoute
              element={<DepartmentDashboard />}
              allowedRoles={["department", "admin"]}
            />
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              element={<AdminDashboard />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

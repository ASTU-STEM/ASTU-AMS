import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import AuthLayout from '../../../layouts/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import AuthCheckbox from '../components/AuthCheckbox';
import AuthFooterLink from '../components/AuthFooterLink';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import authService from '../services/auth.service';
import { useAuth } from '../../../contexts/AuthContext';

const QUICK_LOGIN_ROLES = [
  { role: 'ALUMNI', label: 'Alumni', color: 'bg-astu-navy' },
  { role: 'EMPLOYER', label: 'Employer', color: 'bg-astu-green' },
  { role: 'REGISTRAR', label: 'Registrar', color: 'bg-amber-600' },
  { role: 'DEPARTMENT_HEAD', label: 'Dept Head', color: 'bg-purple-600' },
  { role: 'ADMIN', label: 'Admin', color: 'bg-red-600' },
] as const;

const roleRoutes: Record<string, string> = {
  ALUMNI: '/alumni/dashboard',
  EMPLOYER: '/employer/dashboard',
  REGISTRAR: '/registrar/dashboard',
  DEPARTMENT_HEAD: '/department/dashboard',
  ADMIN: '/admin/dashboard',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: LoginFormData = {
    emailOrStudentId: '',
    password: '',
    rememberMe: false,
  };

  const handleLoginSuccess = (role: string) => {
    const route = roleRoutes[role] || '/';
    navigate(route);
  };

  const handleQuickLogin = (role: string) => {
    login(role as any);
    toast.success(`Logged in as ${role}`);
    handleLoginSuccess(role);
  };

  const handleSubmit = async (values: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        emailOrStudentId: values.emailOrStudentId,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (response.success && response.data) {
        toast.success('Login successful!');
        handleLoginSuccess(response.data.user.role);
      } else {
        toast.error(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your alumni or administrative workspace"
      showLogo={true}
    >
      <div className="rounded-lg bg-astu-navy/5 p-4 mb-6">
        <p className="text-xs text-on-surface-variant">
          <strong>Note:</strong> For employer login, please use the{' '}
          <Link to="/employers" className="font-semibold text-astu-navy hover:underline">
            Employers Portal
          </Link>.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
          Demo Quick Login
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_LOGIN_ROLES.map(({ role, label, color }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleQuickLogin(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:brightness-110 transition-all ${color}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-on-surface-variant">or sign in with credentials</span>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-5">
            <Field
              name="emailOrStudentId"
              as={AuthInput}
              label="Email or Student ID"
              type="text"
              placeholder="Enter your email or student ID"
              value={values.emailOrStudentId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.emailOrStudentId}
              touched={touched.emailOrStudentId}
              disabled={isLoading}
              required
              autoComplete="username"
            />

            <Field
              name="password"
              as={AuthInput}
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
              disabled={isLoading}
              required
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <Field
                name="rememberMe"
                as={AuthCheckbox}
                id="rememberMe"
                label="Remember me"
                checked={values.rememberMe}
                onChange={handleChange}
              />
              
              <button
                type="button"
                onClick={() => {
                  toast('Password reset feature coming soon', { icon: 'ℹ️' });
                }}
                className="text-sm font-semibold text-astu-navy hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <AuthButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </AuthButton>

            <AuthFooterLink
              text="Alumni? Join the network"
              linkText="Register Now"
              to="/register"
            />
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

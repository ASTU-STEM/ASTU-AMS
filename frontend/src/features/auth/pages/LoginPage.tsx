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

const roleRoutes: Record<string, string> = {
  ALUMNI: '/alumni/dashboard',
  EMPLOYER: '/employer/dashboard',
  REGISTRAR: '/registrar/dashboard',
  DEPARTMENT_HEAD: '/department/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/ict/dashboard',
  CMS_MANAGER: '/cms/dashboard',
  ALUMNI_OFFICE: '/cms/dashboard',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show2FAChallenge, setShow2FAChallenge] = useState(false);
  const [pendingValues, setPendingValues] = useState<LoginFormData | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const initialValues: LoginFormData = {
    emailOrStudentId: '',
    password: '',
    rememberMe: false,
  };

  const handleLoginSuccess = (role: string) => {
    const route = roleRoutes[role] || '/';
    navigate(route);
  };

  const handleSubmit = async (values: LoginFormData, extra2FACode?: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        emailOrStudentId: values.emailOrStudentId,
        password: values.password,
        rememberMe: values.rememberMe,
        ...(extra2FACode ? { twoFactorCode: extra2FACode } : {}),
      } as any);

      if (response.ok && response.data) {
        if ((response.data as any).requires2FA) {
          navigate('/verify-2fa', {
            state: {
              email: (response.data as any).email || values.emailOrStudentId,
              emailOrStudentId: values.emailOrStudentId,
              password: values.password,
              rememberMe: values.rememberMe,
            }
          });
          return;
        }

        toast.success('Login successful!', { id: 'login-success' });
        handleLoginSuccess((response.data.user as any).role);
      } else {
        toast.error(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingValues) return;
    if (twoFactorCode.trim().length < 4) {
      toast.error('Please enter a valid 6-digit 2FA code.');
      return;
    }
    handleSubmit(pendingValues, twoFactorCode.trim());
  };

  return (
    <>
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your alumni or administrative workspace"
      showLogo={true}
    >


      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={(vals) => handleSubmit(vals)}
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

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-astu-navy hover:underline"
              >
                Forgot password?
              </Link>
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

      {/* 2FA Challenge Verification Modal */}
      {show2FAChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                  🛡️
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">2FA Verification Required</h3>
                  <p className="text-[11px] text-gray-500">Enter the 6-digit code from your Authenticator app</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShow2FAChallenge(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handle2FASubmit} className="space-y-4 pt-1">
              <div>
                <label className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center text-xl font-mono tracking-[0.4em] p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366] text-gray-900 font-bold"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FAChallenge(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#003366] text-white text-xs font-bold shadow hover:bg-[#00264d] disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

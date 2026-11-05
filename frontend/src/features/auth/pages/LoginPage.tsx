import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { ShieldCheck, X } from 'lucide-react';
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

  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleLoginSuccess = (role: string) => {
    if (redirectUrl && (role === 'ALUMNI' || redirectUrl.startsWith('/'))) {
      navigate(redirectUrl);
      return;
    }
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
            },
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
        title="Sign In"
        subtitle="Access your alumni, employer, or university workspace"
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

              <div className="flex items-center justify-between gap-3">
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
                  className="text-sm font-bold text-astu-navy transition hover:underline dark:text-sky-300 dark:hover:text-sky-200"
                >
                  Forgot password?
                </Link>
              </div>

              <AuthButton type="submit" loading={isLoading} disabled={isLoading}>
                Sign In
              </AuthButton>

              <div className="space-y-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <AuthFooterLink
                  text="Alumni? Join the network"
                  linkText="Register Now"
                  to="/register"
                />
                <AuthFooterLink
                  text="Employer Partner?"
                  linkText="Register Organisation"
                  to="/employers/register"
                />
              </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>

      {show2FAChallenge ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-astu-navy/10 text-astu-navy dark:bg-sky-500/15 dark:text-sky-300">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    2FA Verification Required
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShow2FAChallenge(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handle2FASubmit} className="space-y-4 pt-1">
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-center font-mono text-xl font-bold tracking-[0.4em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-astu-navy/30 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-400/30"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FAChallenge(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-astu-navy py-2.5 text-xs font-bold text-white shadow hover:bg-[#064a8a] disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

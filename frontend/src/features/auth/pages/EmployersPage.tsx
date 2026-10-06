import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Briefcase, Building2, ArrowRight } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import AuthFooterLink from '../components/AuthFooterLink';
import authService from '../services/auth.service';
import * as yup from 'yup';

const employerLoginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(1, 'Password is required'),
});

interface EmployerLoginFormData {
  email: string;
  password: string;
}

export default function EmployersPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginInitialValues: EmployerLoginFormData = {
    email: '',
    password: '',
  };

  const handleLoginSubmit = async (values: EmployerLoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.employerLogin({
        email: values.email,
        password: values.password,
      });

      if (!response.ok || !response.data) {
        toast.error(response.message || 'Login failed. Please check your credentials.');
        return;
      }

      const role = response.data.user?.role;
      if (role !== 'EMPLOYER') {
        toast.error('This account is not registered as an employer partner.');
        authService.logout();
        return;
      }

      toast.success('Login successful!', { id: 'login-success' });
      navigate('/employer/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Employer Login"
      subtitle="Sign in to access your employer portal"
      showLogo={true}
    >
      <Formik
        initialValues={loginInitialValues}
        validationSchema={employerLoginSchema}
        onSubmit={handleLoginSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-5">
            <Field
              name="email"
              as={AuthInput}
              label="Company Email"
              type="email"
              placeholder="company@organization.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
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

            <div className="text-center">
              <p className="text-sm text-on-surface-variant">
                Don't have an employer account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/employers/register')}
                  className="font-semibold text-astu-navy hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          </Form>
        )}
      </Formik>

      <div className="mt-6 pt-6 border-t border-outline-variant">
        <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-[var(--bg-card)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astu-navy/10">
            <Building2 className="h-5 w-5 text-astu-navy" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-astu-navy">Partner with ASTU</h3>
            <p className="text-xs text-on-surface-variant">
              Access verified alumni talent for your recruitment needs
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

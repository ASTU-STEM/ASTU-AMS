import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Briefcase, Building2, ArrowRight } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import AuthFooterLink from '../components/AuthFooterLink';
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

const employerRequestSchema = yup.object().shape({
  companyName: yup
    .string()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters'),
  industry: yup
    .string()
    .required('Industry is required'),
  website: yup
    .string()
    .optional()
    .url('Please enter a valid website URL'),
  location: yup
    .string()
    .required('Location is required')
    .min(2, 'Location must be at least 2 characters'),
  hrContact: yup
    .string()
    .required('HR contact name is required')
    .min(2, 'HR contact name must be at least 2 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

interface EmployerLoginFormData {
  email: string;
  password: string;
}

interface EmployerRequestFormData {
  companyName: string;
  industry: string;
  website: string;
  location: string;
  hrContact: string;
  email: string;
  password: string;
}

export default function EmployersPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

  const loginInitialValues: EmployerLoginFormData = {
    email: '',
    password: '',
  };

  const requestInitialValues: EmployerRequestFormData = {
    companyName: '',
    industry: '',
    website: '',
    location: '',
    hrContact: '',
    email: '',
    password: '',
  };

  const handleLoginSubmit = async (values: EmployerLoginFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call employer login API
      // const response = await authService.login({ ...values, role: 'EMPLOYER' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Login successful!');
      navigate('/employer/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmit = async (values: EmployerRequestFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call employer registration API
      // const response = await authService.registerEmployer(values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsRegistrationSuccess(true);
      toast.success('Employer registration submitted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistrationSuccess) {
    return (
      <AuthLayout
        title="Registration Submitted"
        subtitle="Your employer account is pending approval"
      >
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 border border-green-200 p-1">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <p className="text-sm font-semibold text-green-800 mb-2">
              Registration Successful
            </p>
            <p className="text-sm text-green-700">
              Employer registration submitted successfully. Please wait for admin approval. 
              You will receive an email once your account is approved.
            </p>
          </div>

          <AuthButton
            onClick={() => navigate('/login')}
            variant="outline"
          >
            Go to Login
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Employer Portal"
      subtitle="Partner with ASTU to recruit top talent"
      showLogo={true}
    >
      {!showRegisterForm ? (
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
                    onClick={() => setShowRegisterForm(true)}
                    className="font-semibold text-astu-navy hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={requestInitialValues}
          validationSchema={employerRequestSchema}
          onSubmit={handleRequestSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form className="space-y-4">
              <Field
                name="companyName"
                as={AuthInput}
                label="Company Name"
                type="text"
                placeholder="Your company name"
                value={values.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.companyName}
                touched={touched.companyName}
                disabled={isLoading}
                required
                autoComplete="organization"
              />

              <Field
                name="industry"
                as={AuthInput}
                label="Industry"
                type="text"
                placeholder="e.g., Technology, Healthcare, Finance"
                value={values.industry}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.industry}
                touched={touched.industry}
                disabled={isLoading}
                required
                autoComplete="organization-title"
              />

              <Field
                name="website"
                as={AuthInput}
                label="Website (Optional)"
                type="url"
                placeholder="https://www.company.com"
                value={values.website}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.website}
                touched={touched.website}
                disabled={isLoading}
                autoComplete="url"
              />

              <Field
                name="location"
                as={AuthInput}
                label="Location"
                type="text"
                placeholder="e.g., Addis Ababa, Ethiopia"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.location}
                touched={touched.location}
                disabled={isLoading}
                required
                autoComplete="address-level2"
              />

              <Field
                name="hrContact"
                as={AuthInput}
                label="HR Contact Name"
                type="text"
                placeholder="Full name of HR contact"
                value={values.hrContact}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.hrContact}
                touched={touched.hrContact}
                disabled={isLoading}
                required
                autoComplete="name"
              />

              <Field
                name="email"
                as={AuthInput}
                label="Email Address"
                type="email"
                placeholder="hr@company.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                disabled={isLoading}
                required
                autoComplete="email"
              />

              <Field
                name="password"
                as={AuthInput}
                label="Password"
                type="password"
                placeholder="Create a strong password"
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
                autoComplete="new-password"
              />

              <div className="rounded-lg bg-astu-navy/5 p-4">
                <p className="text-xs text-on-surface-variant">
                  <strong>Note:</strong> Your registration will be reviewed by the university administration. 
                  You will receive an email once your account is approved.
                </p>
              </div>

              <AuthButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
              >
                Register
              </AuthButton>

              <div className="text-center">
                <p className="text-sm text-on-surface-variant">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="font-semibold text-astu-navy hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      )}

      <div className="mt-6 pt-6 border-t border-outline-variant">
        <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-white p-4">
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

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import AuthLayout from '../../../layouts/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import authService from '../services/auth.service';
import * as yup from 'yup';

const alumniActivationSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

interface AlumniActivationFormData {
  password: string;
  confirmPassword: string;
}

export default function AlumniActivationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues: AlumniActivationFormData = {
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: AlumniActivationFormData) => {
    setIsLoading(true);
    try {
      const token = searchParams.get('token') || '';
      const response = await authService.activateAlumni(token, values.password);

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Account activated successfully!');
      } else {
        toast.error(response.message || 'Activation failed. Please try again.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Activation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Account Activated"
        subtitle="Your alumni account is now active"
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
              Activation Successful
            </p>
            <p className="text-sm text-green-700">
              Your alumni account has been activated successfully. 
              You can now log in to access the alumni portal.
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
      title="Activate Your Account"
      subtitle="Set your password to activate your alumni account"
      showLogo={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={alumniActivationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-5">
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

            <Field
              name="confirmPassword"
              as={AuthInput}
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              disabled={isLoading}
              required
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              autoComplete="new-password"
            />

            <div className="rounded-lg bg-astu-navy/5 p-4">
              <p className="text-xs text-on-surface-variant">
                <strong>Note:</strong> Your account has been approved by the university administration. 
                Set your password to complete the activation process.
              </p>
            </div>

            <AuthButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Activate Account
            </AuthButton>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

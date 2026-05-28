import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import AuthLayout from '../../../layouts/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import AuthFooterLink from '../components/AuthFooterLink';
import * as yup from 'yup';

const alumniRegistrationSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
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
  phone: yup
    .string()
    .optional()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number'),
});

interface AlumniRegistrationFormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export default function AlumniRegistrationPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues: AlumniRegistrationFormData = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
  };

  const handleSubmit = async (values: AlumniRegistrationFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call alumni registration API
      // const response = await authService.registerAlumni(values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      toast.success('Registration submitted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Registration Submitted"
        subtitle="Your alumni account is pending approval"
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
              Your alumni account registration has been submitted successfully. 
              Please wait for admin approval. You will receive an email once your account is approved.
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
      title="Join Alumni Network"
      subtitle="Register as an ASTU alumnus"
      showLogo={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={alumniRegistrationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-5">
            <Field
              name="fullName"
              as={AuthInput}
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fullName}
              touched={touched.fullName}
              disabled={isLoading}
              required
              autoComplete="name"
            />

            <Field
              name="email"
              as={AuthInput}
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
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
              name="phone"
              as={AuthInput}
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+251 911 123 456"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
              disabled={isLoading}
              autoComplete="tel"
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
                <strong>Note:</strong> Your account will be reviewed by the university administration. 
                You will receive an email once your registration is approved.
              </p>
            </div>

            <AuthButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Submit Registration
            </AuthButton>

            <AuthFooterLink
              text="Already have an account?"
              linkText="Sign in"
              to="/login"
            />
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import AuthLayout from '../../../layouts/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import AuthFooterLink from '../components/AuthFooterLink';
import { signupSchema, type SignupFormData } from '../schemas/auth.schema';
import authService from '../services/auth.service';

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: SignupFormData = {
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    batch: '',
    activationCode: '',
  };

  const handleSubmit = async (values: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        fullName: values.fullName,
        studentId: values.studentId,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        department: values.department,
        batch: values.batch,
        activationCode: values.activationCode,
      });

      if (response.ok) {
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Register as a verified ASTU alumni"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={signupSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-4">
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
              name="studentId"
              as={AuthInput}
              label="Student ID"
              type="text"
              placeholder="e.g., ATR/1234/23"
              value={values.studentId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.studentId}
              touched={touched.studentId}
              disabled={isLoading}
              required
              autoComplete="username"
            />

            <Field
              name="email"
              as={AuthInput}
              label="Email Address"
              type="email"
              placeholder="your.email@astu.edu.et"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
              disabled={isLoading}
              required
              autoComplete="email"
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                name="department"
                as={AuthInput}
                label="Department (Optional)"
                type="text"
                placeholder="e.g., Software Engineering"
                value={values.department}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.department}
                touched={touched.department}
                disabled={isLoading}
                autoComplete="organization"
              />

              <Field
                name="batch"
                as={AuthInput}
                label="Batch Year (Optional)"
                type="text"
                placeholder="e.g., 2024"
                value={values.batch}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.batch}
                touched={touched.batch}
                disabled={isLoading}
                autoComplete="organization-title"
              />
            </div>

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

            <Field
              name="activationCode"
              as={AuthInput}
              label="Activation Code (Optional)"
              type="text"
              placeholder="Enter activation code if provided"
              value={values.activationCode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.activationCode}
              touched={touched.activationCode}
              disabled={isLoading}
              autoComplete="off"
            />

            <div className="rounded-xl border border-astu-navy/10 bg-astu-navy/5 p-4 dark:border-sky-500/15 dark:bg-sky-500/10">
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <strong>Note:</strong> Your account will be verified against registrar records.
                You may receive an email confirmation once your account is approved.
              </p>
            </div>

            <AuthButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Create Account
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

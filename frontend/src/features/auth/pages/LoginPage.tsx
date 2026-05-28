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

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: LoginFormData = {
    emailOrStudentId: '',
    password: '',
    rememberMe: false,
  };

  const handleLoginSuccess = (role: string) => {
    // Redirect based on role
    switch (role) {
      case 'ALUMNI':
        navigate('/alumni/dashboard');
        break;
      case 'EMPLOYER':
        navigate('/employer/dashboard');
        break;
      case 'REGISTRAR':
        navigate('/registrar/dashboard');
        break;
      case 'DEPARTMENT_HEAD':
        navigate('/department/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
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

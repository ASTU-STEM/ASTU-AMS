import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    >
      <div className="flex justify-center mb-6">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH" 
          alt="ASTU Logo" 
          className="h-16 w-16 object-contain rounded-full border border-slate-100 p-1 shadow-sm"
          onError={(e) => {
            // fallback if logo is not loading
            e.currentTarget.src = "/images/astu-logo.jpeg";
          }}
        />
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
              text="Don't have an account?"
              linkText="Create your verified alumni account"
              to="/register"
            />
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

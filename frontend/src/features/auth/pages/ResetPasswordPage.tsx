import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { KeyRound, Eye, EyeOff, ShieldCheck, Check, X } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import authService from '../services/auth.service';
import SupportLink from '../components/SupportLink';

const resetSchema = yup.object().shape({
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!token) {
      toast.error('Invalid password reset session. Missing token.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, values.password);
      if (response.ok) {
        setIsSuccess(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.message || 'Reset failed. Your link might be expired.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Weak', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Reset Done"
        subtitle="Your new credentials are now active"
        showLogo={true}
      >
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 p-1">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-150 text-xs text-emerald-800">
            Your password has been reset successfully. Please log in with your new password credentials.
          </div>

          <PrimaryButton onClick={() => navigate('/login')} variant="primary">
            Back to Sign In
          </PrimaryButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
      showLogo={true}
    >
      {!token && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-lg">
          <strong>Warning:</strong> No reset token detected in the URL. This reset form may fail to submit. Please check your recovery link.
        </div>
      )}

      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        validationSchema={resetSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => {
          const strength = getPasswordStrength(values.password);
          const rules = [
            { label: 'Minimum 8 characters', met: values.password.length >= 8 },
            { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(values.password) },
            { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(values.password) },
            { label: 'One number (0-9)', met: /[0-9]/.test(values.password) },
            { label: 'One special symbol (!@#$ etc.)', met: /[^A-Za-z0-9]/.test(values.password) },
          ];

          return (
            <Form className="space-y-5">
              <div className="relative">
                <FormField
                  label="New Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create your new password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  touched={touched.password}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-on-surface-variant hover:text-astu-navy transition-all"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {values.password && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Password Strength:</span>
                    <span className="font-bold text-on-surface">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  
                  {/* Interactive Checklist */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-[10px] text-on-surface-variant list-none pl-0">
                    {rules.map((rule, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        {rule.met ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        )}
                        <span className={rule.met ? 'text-on-surface font-medium' : ''}>{rule.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="relative">
                <FormField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password to verify"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-on-surface-variant hover:text-astu-navy transition-all"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <PrimaryButton type="submit" loading={isLoading}>
                Reset Password
              </PrimaryButton>

              <div className="pt-2 border-t border-outline-variant flex flex-col items-center gap-3">
                <SupportLink 
                  lastErrorCode="PASSWORD_RESET"
                  label="Having issues? Contact support"
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </AuthLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Mail, Phone, ArrowLeft, ShieldCheck, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import authService from '../services/auth.service';
import SupportLink from '../components/SupportLink';

const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required('ASTU Email is required')
    .email('Please enter a valid email address'),
});

const phoneSchema = yup.object().shape({
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number'),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [targetVal, setTargetVal] = useState('');
  
  // Resend code state & countdown timer
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // OTP & Reset Password Form State
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Resend countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleSubmit = async (values: { email?: string; phone?: string }) => {
    setIsLoading(true);
    const inputVal = method === 'email' ? values.email || '' : values.phone || '';
    setTargetVal(inputVal);

    try {
      const response = await authService.requestPasswordReset(inputVal, method);
      if (response.ok) {
        setIsSuccess(true);
        setResendTimer(45);
        toast.success(response.data.message || `Recovery code sent to ${inputVal}`);
      } else {
        toast.error(response.message || 'Request failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!targetVal || resendTimer > 0) return;
    setIsResending(true);
    try {
      const response = await authService.requestPasswordReset(targetVal, method);
      if (response.ok) {
        setResendTimer(45);
        toast.success(`A new verification code has been dispatched to ${targetVal}`);
      } else {
        toast.error(response.message || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      toast.error('Error resending verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResetWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    try {
      const response = await authService.resetPassword(otpCode.trim(), newPassword);
      if (response.ok) {
        toast.success('Password reset successfully! Please sign in with your new password.', { duration: 5000 });
        navigate('/login');
      } else {
        toast.error(response.message || 'Invalid or expired code. Please try resending the code.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Password reset failed. Check your code and try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Reset Your Password"
        subtitle="Enter the 6-digit verification code sent to your account"
        showLogo={true}
      >
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 p-1">
            <ShieldCheck className="h-7 w-7 text-emerald-600 animate-pulse" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200 text-xs text-emerald-900">
            <p className="font-bold mb-1 flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Reset Instructions Dispatched
            </p>
            <p className="leading-relaxed">
              We have sent a verification code to <span className="font-bold text-astu-navy underline">{targetVal}</span>.
            </p>
            <p className="mt-1 text-[11px] text-emerald-700">
              Code expires in <span className="font-semibold">15 minutes</span>.
            </p>
          </div>

          {/* OTP Code & New Password Verification Form */}
          <form onSubmit={handleResetWithOtp} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="e.g. 849204"
                className="w-full text-center text-xl font-mono tracking-[0.3em] p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-astu-navy text-slate-900 font-bold bg-white"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-astu-navy text-slate-900 font-medium bg-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-astu-navy text-slate-900 font-medium bg-white"
                required
              />
            </div>

            <PrimaryButton type="submit" loading={isResetting}>
              Set New Password & Sign In
            </PrimaryButton>
          </form>

          {/* Resend Code Section with Countdown Timer */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              Didn't receive the email or SMS code?
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                disabled={resendTimer > 0 || isResending}
                onClick={handleResendCode}
                className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-astu-navy text-xs font-bold transition-all border border-slate-300 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {isResending
                    ? 'Sending Code...'
                    : resendTimer > 0
                    ? `Resend Code in ${resendTimer}s`
                    : 'Send Code Again'}
                </span>
              </button>
            </div>
          </div>

          <div className="text-center pt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { setIsSuccess(false); setOtpCode(''); }}
              className="text-xs text-slate-500 hover:text-astu-navy font-semibold hover:underline"
            >
              Use a different email address or phone number
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs text-astu-navy font-bold inline-flex items-center justify-center gap-1 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Retrieve access to your ASTU alumni account"
      showLogo={true}
    >
      {/* Introductory description */}
      <p className="text-sm text-on-surface-variant mb-4 max-w-md mx-auto">
        Enter the email address associated with your ASTU alumni account (or phone number) and we will send you a secure link or verification code to reset your password. The link expires after 15 minutes for your safety.
      </p>
      {/* Recovery Method Toggle Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
            method === 'email'
              ? 'bg-white text-astu-navy shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          ASTU Email
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
            method === 'phone'
              ? 'bg-white text-astu-navy shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          Phone Recovery
        </button>
      </div>

      <Formik
        key={method}
        initialValues={method === 'email' ? { email: '' } : { phone: '' }}
        validationSchema={method === 'email' ? emailSchema : phoneSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-5">
            {method === 'email' ? (
              <FormField
                label="ASTU Email Address"
                name="email"
                type="email"
                placeholder="your.name@astust.edu.et"
                value={(values as any).email || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                disabled={isLoading}
                required
                helpText="Enter the email address registered with your ASTU alumni account."
              />
            ) : (
              <FormField
                label="Registered Phone Number"
                name="phone"
                type="tel"
                placeholder="+251 911 123 456"
                value={(values as any).phone || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                touched={touched.phone}
                disabled={isLoading}
                required
                helpText="If you do not have access to your email, we can send a verification code to your verified mobile number."
              />
            )}

            <PrimaryButton type="submit" loading={isLoading}>
              Send Recovery Instructions
            </PrimaryButton>

            {/* Support Link */}
            <div className="pt-2 border-t border-outline-variant flex flex-col items-center gap-3">
              <SupportLink 
                lastErrorCode="FORGOT_PASSWORD"
                label="Having issues? Contact support"
              />
              
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs text-on-surface-variant hover:text-astu-navy font-semibold inline-flex items-center gap-1.5 mt-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}


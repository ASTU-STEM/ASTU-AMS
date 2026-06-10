import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import PrimaryButton from '../components/PrimaryButton';
import OtpInput from '../components/OtpInput';
import InlineAlert from '../components/InlineAlert';
import SupportLink from '../components/SupportLink';
import authService from '../services/auth.service';
import { useRegistration } from '../contexts/RegistrationContext';
import * as yup from 'yup';

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required('OTP is required')
    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits'),
});

interface OtpFormData {
  otp: string;
}

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const { registrationDetails, maskedEmail, clearRegistration } = useRegistration();
  // If no email (user indicated no ASTU email), skip OTP UI and show alternative verification options
  if (!registrationDetails?.email) {
    return (
      <AuthLayout title="Verify Your Identity" subtitle="Select a verification method" showLogo={true}>
        <div className="space-y-4 p-4">
          <PrimaryButton type="button" onClick={() => navigate('/verify-national-id')} variant="outline" className="w-full">
            Verify with National ID
          </PrimaryButton>
          <PrimaryButton type="button" onClick={() => navigate('/verify-manual')} variant="outline" className="w-full">
            Manual verification
          </PrimaryButton>
          <SupportLink lastErrorCode="NO_EMAIL" label="Need assistance? Contact support" />
        </div>
      </AuthLayout>
    );
  }
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'INVALID' | 'EXPIRED' | 'LOCKOUT' | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Sync / poll timer checking using resendAvailableAt from sessionStorage
  useEffect(() => {
    const checkTimer = () => {
      const resendAvailableAt = sessionStorage.getItem('resendAvailableAt');
      if (resendAvailableAt) {
        const remaining = Math.ceil((parseInt(resendAvailableAt, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldown(remaining);
        } else {
          sessionStorage.removeItem('resendAvailableAt');
          setCooldown(0);
        }
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpSubmit = async (values: OtpFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    setErrorType(null);
    
    try {
      const result = await authService.verifyOtp(values.otp);
      if (result.ok) {
        toast.success('Registration completed successfully! Please log in.');
        clearRegistration(); // Minimize PII by clearing registration context on completion
        navigate('/login');
      } else {
        setErrorMsg(result.message);
        const code = result.errorCode as 'INVALID' | 'EXPIRED' | 'LOCKOUT';
        setErrorType(code || 'INVALID');
        
        if (code === 'LOCKOUT') {
          toast.error('Too many failed attempts. Account temporarily locked.');
        }
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
      setErrorType('INVALID');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !registrationDetails?.email || errorType === 'LOCKOUT') return;
    setIsLoading(true);
    setErrorMsg(null);
    setErrorType(null);
    
    try {
      const result = await authService.resendOtp(registrationDetails.email);
      if (result.ok) {
        toast.success('A new 6-digit OTP code has been sent to your email.');
        const targetTime = Date.now() + 30000; // 30-second cooldown
        sessionStorage.setItem('resendAvailableAt', targetTime.toString());
        setCooldown(30);
      } else {
        toast.error(result.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      toast.error('Error resending OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const initialValues: OtpFormData = {
    otp: '',
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Enter the OTP sent to your email"
      showLogo={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={otpSchema}
        onSubmit={handleOtpSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg bg-astu-teal/5 p-4 border border-astu-teal/10">
              <Mail className="h-5 w-5 text-astu-teal flex-shrink-0" />
              <p className="text-xs text-on-surface leading-normal">
                We've sent a 6-digit verification code to <span className="font-semibold text-astu-navy">{maskedEmail || 'your email'}</span>.
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium bg-slate-50 p-3 rounded-lg border border-outline-variant">
              <span>Step 2 of 3: Verify identity</span>
              <span className="bg-astu-navy/10 text-astu-navy px-2 py-0.5 rounded-full text-[10px]">Email OTP</span>
            </div>

            {/* Error alerts with appropriate messages and icons */}
            {errorMsg && (
              <InlineAlert 
                type={errorType === 'LOCKOUT' ? 'error' : errorType === 'EXPIRED' ? 'warning' : 'error'}
                title={
                  errorType === 'LOCKOUT' 
                    ? 'Lockout Warning' 
                    : errorType === 'EXPIRED' 
                    ? 'Code Expired' 
                    : 'Invalid Code'
                }
                message={
                  errorType === 'LOCKOUT'
                    ? 'Too many failed attempts. Your registration is locked. Please contact support or retry in 15 minutes.'
                    : errorType === 'EXPIRED'
                    ? 'The verification code has expired. Please request a new code below.'
                    : 'The OTP code is incorrect. Please check and try again.'
                }
                action={
                  errorType === 'LOCKOUT' ? (
                    <SupportLink 
                      lastErrorCode="LOCKOUT"
                      label="Get Help / Request Unlock"
                      className="text-red-900 font-bold"
                    />
                  ) : undefined
                }
              />
            )}

            {/* Modern 6-digit OTP Box */}
            <div className="py-2">
              <OtpInput 
                value={values.otp}
                onChange={(otpVal) => setFieldValue('otp', otpVal)}
                disabled={isLoading || errorType === 'LOCKOUT'}
                hasError={!!errorMsg}
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Didn't receive the email?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isLoading || errorType === 'LOCKOUT'}
                className="font-bold text-astu-navy hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>

            <PrimaryButton
              type="submit"
              loading={isLoading}
              disabled={isLoading || values.otp.length < 6 || errorType === 'LOCKOUT'}
            >
              Verify OTP
            </PrimaryButton>

            {/* Visual fallback links with visual styling and secondary actions */}
            <div className="pt-2 border-t border-outline-variant space-y-4">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => navigate('/verify-national-id')}
                  className="w-full text-left text-sm font-semibold text-astu-navy hover:underline flex justify-between items-center"
                >
                  <span>Verify with National ID</span>
                  <span className="text-xs font-normal text-on-surface-variant">Ethiopia only</span>
                </button>
                <p className="text-[11px] text-on-surface-variant pl-0 leading-normal">
                  If you don't have access to your university email (requires didit.me verification).
                </p>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => navigate('/verify-manual')}
                  className="w-full text-left text-sm font-semibold text-astu-navy hover:underline flex justify-between items-center"
                >
                  <span>Manual verification</span>
                  <span className="text-xs font-normal text-on-surface-variant">International / fallback</span>
                </button>
                <p className="text-[11px] text-on-surface-variant pl-0 leading-normal">
                  If you're outside Ethiopia or do not have a National ID (requires document uploads).
                </p>
              </div>
            </div>

            {/* Back Navigation & Support */}
            <div className="pt-2 flex flex-col items-center gap-3">
              <SupportLink 
                lastErrorCode={errorType || 'OTP_PAGE'}
                label="Need assistance? Contact support"
              />

              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-xs text-on-surface-variant hover:text-astu-navy font-semibold inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to registration page
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

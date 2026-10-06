import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Mail, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';
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

  const handleSubmit = async (values: { email?: string; phone?: string }) => {
    setIsLoading(true);
    const inputVal = method === 'email' ? values.email || '' : values.phone || '';
    setTargetVal(inputVal);

    try {
      const response = await authService.requestPasswordReset(inputVal, method);
      if (response.ok) {
        setIsSuccess(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.message || 'Request failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Recovery Info Sent"
        subtitle="Check your inbox or messages to reset your password"
        showLogo={true}
      >
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 p-1">
            <ShieldCheck className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-emerald-50/50 p-4 border border-emerald-150 text-xs text-emerald-800">
            <p className="font-bold mb-1">Reset Instructions Dispatched</p>
            <p>
              We have sent a verification code / password reset link to <span className="font-semibold text-astu-navy">{targetVal}</span>.
            </p>
            <p className="mt-1">
              Please follow the instructions in the message to set up your new password. The link will expire in <span className="font-medium">15 minutes</span>.
            </p>
          </div>

          <PrimaryButton onClick={() => navigate('/login')} variant="outline">
            Go to Login
          </PrimaryButton>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="text-xs text-on-surface-variant hover:text-astu-navy font-semibold hover:underline"
            >
              Didn't receive the code? Request again
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
      <div className="flex bg-[var(--bg-page)] p-1 rounded-lg mb-6">
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

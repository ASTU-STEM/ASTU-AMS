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
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 p-1 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
            <p className="mb-1 font-bold">Reset instructions sent</p>
            <p>
              We sent a verification code / password reset link to{' '}
              <span className="font-semibold text-astu-navy dark:text-sky-300">{targetVal}</span>.
            </p>
            <p className="mt-1">
              Follow the message to set a new password. The link expires in{' '}
              <span className="font-medium">15 minutes</span>.
            </p>
          </div>

          <PrimaryButton onClick={() => navigate('/login')} variant="outline">
            Go to Login
          </PrimaryButton>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="text-xs font-semibold text-slate-500 transition hover:text-astu-navy hover:underline dark:text-slate-400 dark:hover:text-sky-300"
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
      <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Enter the email or phone on your ASTU alumni account and we will send a secure reset link or code. Links expire after 15 minutes.
      </p>
      <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
            method === 'email'
              ? 'bg-white text-astu-navy shadow-sm dark:bg-slate-950 dark:text-sky-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          ASTU Email
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
            method === 'phone'
              ? 'bg-white text-astu-navy shadow-sm dark:bg-slate-950 dark:text-sky-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
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

            <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <SupportLink lastErrorCode="FORGOT_PASSWORD" label="Having issues? Contact support" />

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-astu-navy dark:text-slate-400 dark:hover:text-sky-300"
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

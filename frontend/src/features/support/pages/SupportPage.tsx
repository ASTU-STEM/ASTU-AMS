import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { LifeBuoy, ArrowLeft, CheckCircle } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import FormField from '../../auth/components/FormField';
import PrimaryButton from '../../auth/components/PrimaryButton';
import FileUpload from '../../auth/components/FileUpload';
import { useRegistration } from '../../auth/contexts/RegistrationContext';
import supportService from '../services/support.service';

const supportSchema = yup.object().shape({
  category: yup.string().required('Please select a support category'),
  fullName: yup.string().required('Full name is required'),
  contactEmail: yup.string().email('Please enter a valid email address').required('Contact email is required'),
  phone: yup.string().optional(),
  studentId: yup.string().optional(),
  graduationYear: yup.string().optional(),
  message: yup.string().required('Please write your message / description of the issue').min(10, 'Message should be at least 10 characters'),
  consent: yup.boolean().oneOf([true], 'You must consent to the privacy terms'),
});

export default function SupportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrationDetails } = useRegistration();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  // Destructure router state metadata passed via SupportLink
  const { currentRoute, lastErrorCode, sessionId } = location.state || {};

  const initialValues = {
    category: lastErrorCode ? 'auth_verification' : '',
    studentId: registrationDetails?.studentId || '',
    fullName: registrationDetails?.fullName || '',
    graduationYear: registrationDetails?.graduationYear || '',
    contactEmail: registrationDetails?.email || '',
    phone: registrationDetails?.phone || '',
    message: lastErrorCode ? `I encountered an issue during verification on route "${currentRoute || 'N/A'}" with error code "${lastErrorCode}". ` : '',
    consent: false,
  };

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', values.category);
      formData.append('fullName', values.fullName);
      formData.append('contactEmail', values.contactEmail);
      formData.append('phone', values.phone || '');
      formData.append('studentId', values.studentId || '');
      formData.append('graduationYear', values.graduationYear || '');
      formData.append('message', values.message);
      
      // Attach files
      files.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      // Append hidden metadata
      formData.append('metadata_currentRoute', currentRoute || window.location.pathname);
      formData.append('metadata_lastErrorCode', lastErrorCode || 'NONE');
      formData.append('metadata_sessionId', sessionId || 'NONE');
      formData.append('metadata_timestamp', new Date().toISOString());

      const response = await supportService.createTicket(formData);
      if (response.ok) {
        setTicketId(response.data.ticketId);
        setIsSuccess(true);
        toast.success('Support ticket created successfully!');
      } else {
        toast.error((response as any).message || 'Failed to submit support ticket.');
      }
    } catch (error) {
      toast.error('An error occurred while submitting the ticket.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Ticket Submitted"
        subtitle="We will get back to you shortly"
        showLogo={true}
      >
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-astu-teal/10 border border-astu-teal/20 p-1">
            <CheckCircle className="h-8 w-8 text-astu-teal" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-astu-teal/5 p-5 border border-astu-teal/10 space-y-3 text-xs text-on-surface">
            <p className="font-bold text-[13px] text-astu-navy">Support Request Logged</p>
            <p>
              <strong>Ticket ID:</strong>{' '}
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-outline-variant text-astu-navy">
                {ticketId}
              </span>
            </p>
            <p>
              Your support request has been logged in our system. A support representative will review the ticket details and contact you via email at <span className="font-semibold">{initialValues.contactEmail || 'your email'}</span>.
            </p>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Typical response times are under 24 hours. Thank you for your patience!
            </p>
          </div>

          <PrimaryButton onClick={() => navigate('/login')} variant="outline">
            Go to Login
          </PrimaryButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Contact Support"
      subtitle="Fill out the form below to file a help ticket"
      showLogo={true}
      maxWidth="max-w-2xl"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={supportSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-6">
            <div className="flex items-start gap-3 rounded-lg bg-astu-navy/5 p-4 border border-outline-variant">
              <LifeBuoy className="h-5 w-5 text-astu-navy mt-0.5 flex-shrink-0" />
              <div className="text-xs text-on-surface leading-relaxed">
                <p className="font-semibold text-astu-navy">Need assistance with your alumni registration?</p>
                <p className="mt-0.5 text-on-surface-variant">
                  Select the appropriate category and describe your issue. Contextual metadata about your last session is attached automatically to speed up resolution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                  Support Category *
                </label>
                <Field
                  name="category"
                  as="select"
                  className={`w-full px-4 py-3 text-sm rounded-lg border bg-[var(--bg-card)] text-on-surface focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all ${
                    errors.category && touched.category
                      ? 'border-astu-red focus:border-astu-red focus:ring-astu-red/20'
                      : 'border-outline-variant focus:border-astu-navy'
                  }`}
                  value={values.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="auth_verification">Email Verification / OTP Issues</option>
                  <option value="didit_verification">National ID (Didit) Issues</option>
                  <option value="missing_record">Student Record Not Found</option>
                  <option value="account_lockout">Account Lockout Recovery</option>
                  <option value="general_login">Login & Password Recovery</option>
                  <option value="other">Other Technical Issues</option>
                </Field>
                {errors.category && touched.category && (
                  <p className="mt-1 text-xs text-astu-red font-medium">{errors.category as string}</p>
                )}
              </div>

              <FormField
                name="studentId"
                label="Student ID (If applicable)"
                type="text"
                placeholder="e.g. ATR/1234/23"
                value={values.studentId}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.studentId as string}
                touched={touched.studentId as boolean}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="fullName"
                label="Full Name *"
                type="text"
                placeholder="Enter your full name"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName as string}
                touched={touched.fullName as boolean}
                disabled={isLoading}
                required
              />

              <FormField
                name="graduationYear"
                label="Graduation Year"
                type="text"
                placeholder="e.g. 2024"
                value={values.graduationYear}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.graduationYear as string}
                touched={touched.graduationYear as boolean}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  name="contactEmail"
                  label="Contact Email *"
                  type="email"
                  placeholder="name@example.com"
                  helpText="Any valid email address can be used for support contact"
                  value={values.contactEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.contactEmail as string}
                  touched={touched.contactEmail as boolean}
                  disabled={isLoading}
                  required
                />

              <FormField
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="+251 911 123 456"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone as string}
                touched={touched.phone as boolean}
                disabled={isLoading}
              />
            </div>

            <FormField
              label="Describe the issue *"
              name="message"
              as="textarea"
              rows={4}
              placeholder="Please provide details about the problem, error messages you saw, or questions you have..."
              value={values.message}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.message as string}
              touched={touched.message as boolean}
              disabled={isLoading}
              required
            />

            {/* Attachments Section */}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1">
                Upload Screenshots / Attachments
              </label>
              <FileUpload
                files={files}
                onChange={setFiles}
                maxFiles={2}
                disabled={isLoading}
              />
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--bg-page)] border border-outline-variant">
              <Field
                name="consent"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-outline-variant text-astu-navy focus:ring-astu-navy"
                checked={values.consent}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="consent" className="text-xs text-on-surface leading-relaxed cursor-pointer select-none">
                I consent to ASTU Support collecting my submitted contact details, document uploads, and session diagnostics to resolve my ticket.
              </label>
            </div>
            {errors.consent && touched.consent && (
              <p className="mt-1 text-xs text-astu-red font-medium">{errors.consent as string}</p>
            )}

            {/* Submit & Back Buttons */}
            <div className="pt-4 border-t border-outline-variant space-y-4">
              <PrimaryButton type="submit" loading={isLoading}>
                Submit Support Ticket
              </PrimaryButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-xs text-on-surface-variant hover:text-astu-navy font-semibold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Go Back
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

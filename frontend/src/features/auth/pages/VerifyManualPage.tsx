import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Globe, CheckCircle, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import FileUpload from '../components/FileUpload';
import InlineAlert from '../components/InlineAlert';
import SupportLink from '../components/SupportLink';
import authService from '../services/auth.service';
import { useRegistration } from '../contexts/RegistrationContext';
import * as yup from 'yup';

const manualVerificationSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  country: yup.string().required('Country of residence is required'),
  contactEmail: yup.string().email('Please enter a valid email address').required('Contact email is required'),
  phone: yup.string().optional(),
  documentType: yup.string().required('Document type is required'),
  notes: yup.string().optional(),
});

interface ManualVerificationFormData {
  studentId: string;
  fullName: string;
  graduationYear: string;
  country: string;
  contactEmail: string;
  phone: string;
  documentType: string;
  notes: string;
}

export default function VerifyManualPage() {
  const navigate = useNavigate();
  const { registrationDetails, clearRegistration } = useRegistration();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const initialValues: ManualVerificationFormData = {
    studentId: registrationDetails?.studentId || '',
    fullName: registrationDetails?.fullName || '',
    graduationYear: registrationDetails?.graduationYear || '',
    country: '',
    contactEmail: registrationDetails?.email || '',
    phone: registrationDetails?.phone || '',
    documentType: '',
    notes: '',
  };

  const handleSubmit = async (values: ManualVerificationFormData) => {
    setFileError(null);
    if (files.length === 0) {
      setFileError('Please upload at least one verification document.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('studentId', values.studentId);
      formData.append('fullName', values.fullName);
      formData.append('graduationYear', values.graduationYear);
      formData.append('country', values.country);
      formData.append('contactEmail', values.contactEmail);
      formData.append('phone', values.phone);
      formData.append('documentType', values.documentType);
      formData.append('notes', values.notes);
      
      files.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await authService.submitManualVerification(formData);

      if (response.ok) {
        setRequestId(response.data.requestId || 'N/A');
        setIsSuccess(true);
        toast.success('Manual verification request submitted successfully!');
        // Do NOT call clearRegistration() here, otherwise VerificationRouteGuard will unmount this page instantly!
      } else {
        toast.error((response as any).message || 'Submission failed.');
      }
    } catch (error) {
      toast.error('An error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Submission Received"
        subtitle="Your manual verification request has been received"
        showLogo={true}
      >
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-astu-teal/10 border border-astu-teal/20 p-1">
            <CheckCircle className="h-10 w-10 text-astu-teal" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg bg-astu-teal/5 p-5 border border-astu-teal/10 space-y-3">
            <p className="text-sm font-bold text-astu-navy">
              Request Submitted Successfully
            </p>
            <div className="text-xs text-on-surface space-y-2">
              <p>
                <strong>Request ID:</strong> <span className="font-mono bg-white px-2 py-0.5 rounded border border-outline-variant text-astu-navy">{requestId}</span>
              </p>
              <p>
                <strong>Expected Review Time:</strong> 2-3 business days
              </p>
              <p>
                Your registration information and document uploads have been queued for manual review by the university registrar's office. You will receive an email update once verified.
              </p>
            </div>
          </div>

          <PrimaryButton
            onClick={() => {
              clearRegistration();
              navigate('/login');
            }}
            variant="primary"
          >
            Go to Login
          </PrimaryButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Upload Verification Document"
      subtitle="Manual verification for international and fallback registrations"
      showLogo={true}
      maxWidth="max-w-2xl"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={manualVerificationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg bg-astu-teal/5 p-4 border border-astu-teal/10">
              <Globe className="h-5 w-5 text-astu-teal flex-shrink-0" />
              <p className="text-xs text-on-surface leading-relaxed">
                Please provide details and upload supporting documents (such as passport, degree diploma, or transcript) to verify your ASTU alumni records manually.
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium bg-[var(--bg-page)] p-3 rounded-lg border border-outline-variant">
              <span>Step 2 of 3: Verify identity</span>
              <span className="bg-astu-navy/10 text-astu-navy px-2 py-0.5 rounded-full text-[10px]">Manual Upload</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Read-Only Prefilled Fields */}
              <FormField
                label="Student ID (Read-only)"
                name="studentId"
                value={values.studentId || 'N/A'}
                onChange={() => {}}
                disabled
              />

              <FormField
                label="Graduation Year (Read-only)"
                name="graduationYear"
                value={values.graduationYear || 'N/A'}
                onChange={() => {}}
                disabled
              />
            </div>

            <FormField
              name="fullName"
              label="Full Name *"
              type="text"
              placeholder="Enter your full name"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fullName}
              touched={touched.fullName}
              disabled={isLoading}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="contactEmail"
                label="Contact Email *"
                type="email"
                placeholder="your.email@example.com"
                value={values.contactEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.contactEmail}
                touched={touched.contactEmail}
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
                error={errors.phone}
                touched={touched.phone}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="country"
                label="Country of Residence *"
                type="text"
                placeholder="e.g. Ethiopia, United States"
                value={values.country}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.country}
                touched={touched.country}
                disabled={isLoading}
                required
              />

              <div>
                <FormField
                  name="documentType"
                  label="Document Type *"
                  as="select"
                  value={values.documentType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.documentType}
                  touched={touched.documentType}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select Document Type</option>
                  <option value="passport">Passport</option>
                  <option value="diploma">Diploma Certificate</option>
                  <option value="transcript">Academic Transcript</option>
                  <option value="id_card">National ID Card</option>
                  <option value="other">Other Document</option>
                </FormField>
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Upload Verification Documents (Passport, Diploma or Transcript) *
              </label>
              
              <FileUpload
                files={files}
                onChange={(updatedFiles) => {
                  setFiles(updatedFiles);
                  setFileError(null);
                }}
                maxFiles={3}
                disabled={isLoading}
              />

              {fileError && (
                <InlineAlert 
                  type="error"
                  message={fileError}
                />
              )}
            </div>

            {/* Notes Field */}
            <FormField
              label="Notes / Additional Comments"
              name="notes"
              as="textarea"
              rows={3}
              placeholder="Provide any additional context or information to help the review process..."
              value={values.notes}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
            />

            {/* Actions */}
            <div className="pt-4 border-t border-outline-variant space-y-4">
              <PrimaryButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
              >
                Submit Documents
              </PrimaryButton>

              <div className="text-center flex flex-col items-center gap-3">
                <SupportLink 
                  lastErrorCode="MANUAL_UPLOAD"
                  label="Need help? Contact support"
                />

                <button
                  type="button"
                  onClick={() => navigate('/verify-otp')}
                  className="text-xs text-on-surface-variant hover:text-astu-navy font-semibold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to OTP verification
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

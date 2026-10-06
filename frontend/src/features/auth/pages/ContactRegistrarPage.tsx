import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import toast from 'react-hot-toast';
import { AlertTriangle, Upload, CheckCircle, ArrowLeft, FileText, Phone, Mail, User, GraduationCap, Hash, MessageSquare } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import authService from '../services/auth.service';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import * as yup from 'yup';

const contactRegistrarSchema = yup.object().shape({
  fullName: yup.string().required('Full name is required').min(3, 'Full name must be at least 3 characters'),
  studentId: yup.string().required('Student ID is required'),
  graduationYear: yup.string().required('Graduation year is required'),
  contactEmail: yup.string().required('Contact email is required').email('Please enter a valid email address'),
  phoneNumber: yup.string().required('Phone number is required').test('is-valid-phone', 'Please enter a valid phone number', (value) => isValidPhoneNumber(value || '')),
  department: yup.string().required('Department/Program is required'),
  issueType: yup.string().required('Please select the issue type'),
  issueDescription: yup.string().required('Please describe the issue').min(20, 'Description must be at least 20 characters'),
});

interface ContactRegistrarFormData {
  fullName: string;
  studentId: string;
  graduationYear: string;
  contactEmail: string;
  phoneNumber: string;
  department: string;
  issueType: string;
  issueDescription: string;
}

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 25 }, (_, i) => currentYear - i);

export default function ContactRegistrarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from navigation state (passed from registration page)
  const prefill = location.state || {};

  const initialValues: ContactRegistrarFormData = {
    fullName: prefill.fullName || '',
    studentId: prefill.studentId || '',
    graduationYear: prefill.graduationYear || '',
    contactEmail: prefill.contactEmail || '',
    phoneNumber: prefill.phoneNumber || '',
    department: '',
    issueType: '',
    issueDescription: '',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setFileError('Only JPG, PNG, WebP, and PDF files are allowed.');
        setSelectedFile(null);
        return;
      }
      if (file.size > maxSize) {
        setFileError('File size must be less than 5MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (values: ContactRegistrarFormData) => {
    if (!selectedFile) {
      setFileError('Please upload your identification document.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('studentId', values.studentId);
      formData.append('graduationYear', values.graduationYear);
      formData.append('contactEmail', values.contactEmail);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('issueDescription', `[${values.issueType}] Department: ${values.department}\n\n${values.issueDescription}`);
      formData.append('identificationDocument', selectedFile);

      const response = await authService.submitRegistrationIssue(formData);

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Your request has been submitted successfully!');
      } else {
        toast.error(response.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Request Submitted"
        subtitle="We've received your data correction request"
        showLogo={true}
        maxWidth="max-w-lg"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Request Received!</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your data correction request has been submitted to the Registrar's Office. 
              You will be notified via email once your information has been verified and updated.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>What happens next?</strong><br />
              The Registrar will review your submitted documents and verify your identity. 
              Once approved, your alumni record will be updated and you can proceed with registration. 
              This typically takes <strong>1–3 business days</strong>.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <PrimaryButton
              type="button"
              onClick={() => navigate('/register')}
              className="py-3"
            >
              Back to Registration
            </PrimaryButton>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-astu-navy hover:underline"
            >
              Go to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Contact Registrar"
      subtitle="Submit a data correction request to verify your identity"
      showLogo={true}
      maxWidth="max-w-2xl"
      rightWidth="lg:w-[55%]"
    >
      {/* Warning Banner */}
      <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Registration Data Mismatch</h3>
            <p className="mt-1 text-xs text-amber-700 leading-relaxed">
              Your Student ID, name, or email could not be found or verified in our records. 
              Please fill out the form below so the Registrar can update your records.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-astu-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Registration
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={contactRegistrarSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form className="space-y-5">
            {/* Personal Information Section */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <User className="h-4 w-4 text-astu-navy" />
                Personal Information
              </h3>
              <p className="text-[11px] text-on-surface-variant">Provide your full legal name as it appears on your university records.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="fullName"
                label="Full Name (First Middle Last) *"
                type="text"
                placeholder="e.g. Abebe Kebede Tadesse"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName}
                touched={touched.fullName}
                disabled={isLoading}
                required
              />

              <FormField
                name="studentId"
                label="Student ID *"
                type="text"
                placeholder="UGR/XXXXX/YY"
                value={values.studentId}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.studentId}
                touched={touched.studentId}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  name="graduationYear"
                  label="Graduation Year *"
                  as="select"
                  value={values.graduationYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.graduationYear}
                  touched={touched.graduationYear}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select Year</option>
                  {graduationYears.map((year) => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </FormField>
              </div>

              <FormField
                name="department"
                label="Department / Program *"
                type="text"
                placeholder="e.g. Computer Science"
                value={values.department}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.department}
                touched={touched.department}
                disabled={isLoading}
                required
              />
            </div>

            {/* Contact Information Section */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Mail className="h-4 w-4 text-astu-navy" />
                Contact Information
              </h3>
              <p className="text-[11px] text-on-surface-variant">We will use this to notify you once your data has been corrected.</p>
            </div>

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

              <div className="space-y-1">
                <label className="block text-sm font-medium text-on-surface-variant">Phone Number *</label>
                <PhoneInput
                  international
                  defaultCountry="ET"
                  value={values.phoneNumber}
                  onChange={(value) => setFieldValue('phoneNumber', value)}
                  placeholder="+251 911 123 456"
                  disabled={isLoading}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <p className="text-xs text-astu-red">{errors.phoneNumber as string}</p>
                )}
              </div>
            </div>

            {/* Issue Details Section */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-astu-navy" />
                Issue Details
              </h3>
              <p className="text-[11px] text-on-surface-variant">Tell us what went wrong during registration.</p>
            </div>

            <div>
              <FormField
                name="issueType"
                label="Issue Type *"
                as="select"
                value={values.issueType}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.issueType}
                touched={touched.issueType}
                disabled={isLoading}
                required
              >
                <option value="">Select Issue Type</option>
                <option value="Student ID Not Found">Student ID Not Found in Records</option>
                <option value="Name Mismatch">Name Does Not Match Records</option>
                <option value="Email Mismatch">Email Does Not Match Records</option>
                <option value="Wrong Graduation Year">Wrong Graduation Year on Record</option>
                <option value="Department Mismatch">Department / Program Mismatch</option>
                <option value="Other">Other</option>
              </FormField>
            </div>

            <div>
              <FormField
                name="issueDescription"
                label="Describe the Issue *"
                as="textarea"
                placeholder="Please provide details about what happened during registration. Include any additional information that may help the Registrar verify your identity (e.g., name changes, transfer details, etc.)."
                value={values.issueDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.issueDescription}
                touched={touched.issueDescription}
                disabled={isLoading}
                required
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <FileText className="h-4 w-4 text-astu-navy" />
                Identity Verification Document
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Upload a clear photo or scan of your National ID, Passport, or University Student ID Card.
              </p>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : fileError
                  ? 'border-red-300 bg-red-50/50'
                  : 'border-outline-variant bg-[var(--bg-page)] hover:border-astu-navy/50 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface">{selectedFile.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-on-surface-variant mx-auto" />
                  <p className="text-sm font-medium text-on-surface-variant">
                    Click to upload your ID document
                  </p>
                  <p className="text-[11px] text-on-surface-variant/70">
                    Accepted: JPG, PNG, WebP, PDF — Max 5MB
                  </p>
                </div>
              )}
            </div>
            {fileError && <p className="text-xs text-astu-red font-medium -mt-3">{fileError}</p>}

            {/* Submit */}
            <PrimaryButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="py-3.5 text-base w-full"
            >
              Submit Correction Request
            </PrimaryButton>

            {/* Footer Info */}
            <div className="rounded-lg bg-astu-teal/5 p-4 border border-astu-teal/10">
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-astu-teal mt-0.5 flex-shrink-0" />
                <p className="text-xs text-on-surface leading-relaxed">
                  <strong>Need urgent help?</strong> Contact the Registrar Office directly at{' '}
                  <a href="mailto:registrar@astust.edu.et" className="text-astu-navy font-semibold hover:underline">
                    registrar@astust.edu.et
                  </a>{' '}
                  or call{' '}
                  <a href="tel:+251221100123" className="text-astu-navy font-semibold hover:underline">
                    +251 22 110 0123
                  </a>
                </p>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

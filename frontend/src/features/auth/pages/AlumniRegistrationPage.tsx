import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Mail, Shield, Upload, Clock, CheckCircle, Globe } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import * as yup from 'yup';

const alumniRegistrationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  middleName: yup
    .string()
    .required('Middle name is required')
    .min(2, 'Middle name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  gender: yup
    .string()
    .required('Gender is required'),
  educationalQualification: yup
    .string()
    .required('Educational qualification is required'),
  workPlace: yup
    .string()
    .required('Work place is required'),
  workPosition: yup
    .string()
    .required('Work position is required'),
  idNumber: yup
    .string()
    .optional(),
  yearOfGraduation: yup
    .string()
    .required('Year of graduation is required'),
  fieldOfStudy: yup
    .string()
    .required('Field of study is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: yup
    .string()
    .required('Phone is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number'),
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
  confirmation: yup
    .boolean()
    .oneOf([true], 'You must confirm the information is accurate'),
});

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required('OTP is required')
    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits'),
});

const nationalIdSchema = yup.object().shape({
  nationalId: yup
    .string()
    .required('National ID is required')
    .min(10, 'National ID must be at least 10 characters'),
});

const documentUploadSchema = yup.object().shape({
  document: yup
    .mixed()
    .required('Document is required')
    .test('fileType', 'Only PDF, JPG, PNG files are allowed', (value) => {
      if (!value) return false;
      const file = value as File;
      return ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
    }),
  documentType: yup
    .string()
    .required('Document type is required'),
});

interface AlumniRegistrationFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  educationalQualification: string;
  workPlace: string;
  workPosition: string;
  idNumber?: string;
  yearOfGraduation: string;
  fieldOfStudy: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  confirmation: boolean;
}

interface OtpFormData {
  otp: string;
}

interface NationalIdFormData {
  nationalId: string;
}

interface DocumentUploadFormData {
  document: File | null;
  documentType: string;
}

type RegistrationStep = 'registration' | 'adminVerification' | 'otp' | 'nationalId' | 'documentUpload' | 'success';

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

export default function AlumniRegistrationPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('registration');

  const registrationInitialValues: AlumniRegistrationFormData = {
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    educationalQualification: '',
    workPlace: '',
    workPosition: '',
    idNumber: '',
    yearOfGraduation: '',
    fieldOfStudy: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    confirmation: false,
  };

  const otpInitialValues: OtpFormData = {
    otp: '',
  };

  const nationalIdInitialValues: NationalIdFormData = {
    nationalId: '',
  };

  const documentUploadInitialValues: DocumentUploadFormData = {
    document: null,
    documentType: '',
  };

  const handleRegistrationSubmit = async (values: AlumniRegistrationFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call registration API to submit data for admin verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('adminVerification');
      toast.success('Registration submitted! Verifying your information...');
      
      // Simulate automatic verification and OTP sending
      setTimeout(() => {
        setCurrentStep('otp');
        toast.success('Verification successful! OTP sent to your email.');
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (values: OtpFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call OTP verification API
      // const response = await authService.verifyOtp({ otp: values.otp });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep('success');
      toast.success('OTP verified successfully! Registration complete.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNationalIdSubmit = async (values: NationalIdFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call National ID verification API using didit.me
      // const response = await authService.verifyNationalId({ nationalId: values.nationalId });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('success');
      toast.success('National ID verified successfully! Registration complete.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'National ID verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUploadSubmit = async (values: DocumentUploadFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call document upload API for manual verification
      // const response = await authService.uploadDocument(values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('success');
      toast.success('Document uploaded successfully! Your registration will be manually verified.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Document upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'success') {
    return (
      <AuthLayout
        title="Registration Complete"
        subtitle="Your alumni account has been created"
      >
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-astu-teal/10 border border-astu-teal/20 p-1">
            <CheckCircle className="h-10 w-10 text-astu-teal" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-astu-teal/5 p-4 border border-astu-teal/10">
            <p className="text-sm font-semibold text-astu-navy mb-2">
              Registration Successful
            </p>
            <p className="text-sm text-on-surface">
              Your alumni account has been created successfully. 
              You can now log in to access the alumni portal.
            </p>
          </div>

          <AuthButton
            onClick={() => navigate('/login')}
            variant="outline"
          >
            Go to Login
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  if (currentStep === 'adminVerification') {
    return (
      <AuthLayout
        title="Verification in Progress"
        subtitle="Verifying your information"
        showLogo={true}
      >
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-astu-navy/10 border border-astu-navy/20 p-1">
            <Clock className="h-10 w-10 text-astu-navy animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-astu-navy/5 p-6 border border-astu-navy/10">
            <p className="text-sm font-semibold text-astu-navy mb-3">
              Verifying Your Information
            </p>
            <p className="text-sm text-on-surface mb-4">
              Your registration information is being verified against the university student database.
            </p>
            <div className="w-full bg-astu-navy/10 rounded-full h-2 overflow-hidden">
              <div className="bg-astu-navy h-2 rounded-full animate-[width_3s_ease-in-out_forwards]" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="rounded-lg bg-astu-teal/5 p-4 border border-astu-teal/10">
            <p className="text-xs text-on-surface">
              <strong>Note:</strong> An OTP code will be automatically sent to your email address once verification is complete.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (currentStep === 'otp') {
    return (
      <AuthLayout
        title="Verify Your Email"
        subtitle="Enter the OTP sent to your email"
        showLogo={true}
      >
        <Formik
          initialValues={otpInitialValues}
          validationSchema={otpSchema}
          onSubmit={handleOtpSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form className="space-y-5">
              <div className="flex items-center gap-3 rounded-lg bg-astu-teal/5 p-4 border border-astu-teal/10">
                <Mail className="h-5 w-5 text-astu-teal" />
                <p className="text-xs text-on-surface">
                  We've sent a 6-digit OTP to your email address
                </p>
              </div>

              <Field
                name="otp"
                as={AuthInput}
                label="One-Time Password (OTP)"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={values.otp}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.otp}
                touched={touched.otp}
                disabled={isLoading}
                required
                maxLength={6}
                autoComplete="one-time-code"
              />

              <AuthButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
              >
                Verify OTP
              </AuthButton>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('nationalId')}
                  className="w-full text-sm font-semibold text-astu-navy hover:underline"
                >
                  I don't have access to my email → Verify with National ID
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('documentUpload')}
                  className="w-full text-sm font-semibold text-astu-navy hover:underline"
                >
                  I'm outside Ethiopia → Upload Document for Manual Verification
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('adminVerification')}
                  className="text-sm text-on-surface-variant hover:text-astu-navy"
                >
                  ← Back to verification status
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    );
  }

  if (currentStep === 'nationalId') {
    return (
      <AuthLayout
        title="Verify with National ID"
        subtitle="Alternative verification using your National ID"
        showLogo={true}
      >
        <Formik
          initialValues={nationalIdInitialValues}
          validationSchema={nationalIdSchema}
          onSubmit={handleNationalIdSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form className="space-y-5">
              <div className="flex items-center gap-3 rounded-lg bg-astu-navy/5 p-4 border border-astu-navy/10">
                <Shield className="h-5 w-5 text-astu-navy" />
                <p className="text-xs text-on-surface">
                  We'll verify your identity using didit.me National ID verification
                </p>
              </div>

              <Field
                name="nationalId"
                as={AuthInput}
                label="National ID"
                type="text"
                placeholder="Enter your National ID number"
                value={values.nationalId}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nationalId}
                touched={touched.nationalId}
                disabled={isLoading}
                required
                autoComplete="off"
              />

              <div className="rounded-lg bg-astu-navy/5 p-4">
                <p className="text-xs text-on-surface-variant">
                  <strong>Note:</strong> Your National ID will be verified securely through didit.me. 
                  This information is used only for identity verification purposes.
                </p>
              </div>

              <AuthButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
              >
                Verify National ID
              </AuthButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('otp')}
                  className="text-sm text-on-surface-variant hover:text-astu-navy"
                >
                  ← Back to OTP verification
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    );
  }

  if (currentStep === 'documentUpload') {
    return (
      <AuthLayout
        title="Upload Verification Document"
        subtitle="Manual verification for international alumni"
        showLogo={true}
      >
        <Formik
          initialValues={documentUploadInitialValues}
          validationSchema={documentUploadSchema}
          onSubmit={handleDocumentUploadSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
            <Form className="space-y-5">
              <div className="flex items-center gap-3 rounded-lg bg-astu-teal/5 p-4 border border-astu-teal/10">
                <Globe className="h-5 w-5 text-astu-teal" />
                <p className="text-xs text-on-surface">
                  Upload a document for manual verification (for alumni outside Ethiopia)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Document Type *
                </label>
                <Field
                  name="documentType"
                  as="select"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.documentType && touched.documentType
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-outline-variant focus:border-astu-navy'
                  } bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all`}
                  value={values.documentType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  required
                >
                  <option value="">--- Select Document Type ---</option>
                  <option value="passport">Passport</option>
                  <option value="diploma">Diploma Certificate</option>
                  <option value="transcript">Academic Transcript</option>
                  <option value="id_card">National ID Card</option>
                  <option value="other">Other</option>
                </Field>
                {errors.documentType && touched.documentType && (
                  <p className="mt-1 text-xs text-red-500">{errors.documentType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Upload Document *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0] || null;
                      setFieldValue('document', file);
                    }}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-astu-navy/10 file:text-astu-navy hover:file:bg-astu-navy/20"
                  />
                  {values.document && (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Selected: {values.document.name}
                    </p>
                  )}
                </div>
                {errors.document && touched.document && (
                  <p className="mt-1 text-xs text-red-500">{errors.document}</p>
                )}
              </div>

              <div className="rounded-lg bg-astu-navy/5 p-4">
                <p className="text-xs text-on-surface-variant">
                  <strong>Note:</strong> Accepted file formats: PDF, JPG, PNG. 
                  Your document will be manually verified by the university administration.
                </p>
              </div>

              <AuthButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
              >
                Upload Document
              </AuthButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep('otp')}
                  className="text-sm text-on-surface-variant hover:text-astu-navy"
                >
                  ← Back to OTP verification
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Register Here"
      subtitle="Create your alumni account"
      showLogo={true}
      maxWidth="max-w-7xl"
      rightWidth="lg:w-1/2"
    >
      <div className="mb-6 text-center">
        <p className="text-sm text-on-surface-variant">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-astu-navy hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>

      <Formik
        initialValues={registrationInitialValues}
        validationSchema={alumniRegistrationSchema}
        onSubmit={handleRegistrationSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                <Field
                  name="firstName"
                  as={AuthInput}
                  label="First Name *"
                  type="text"
                  placeholder="Enter your first name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.firstName}
                  touched={touched.firstName}
                  disabled={isLoading}
                  required
                  autoComplete="given-name"
                />

                <Field
                  name="middleName"
                  as={AuthInput}
                  label="Middle Name *"
                  type="text"
                  placeholder="Enter your middle name"
                  value={values.middleName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.middleName}
                  touched={touched.middleName}
                  disabled={isLoading}
                  required
                  autoComplete="additional-name"
                />

                <Field
                  name="lastName"
                  as={AuthInput}
                  label="Last Name *"
                  type="text"
                  placeholder="Enter your last name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.lastName}
                  touched={touched.lastName}
                  disabled={isLoading}
                  required
                  autoComplete="family-name"
                />

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Gender *
                  </label>
                  <Field
                    name="gender"
                    as="select"
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.gender && touched.gender
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-outline-variant focus:border-astu-navy'
                    } bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all`}
                    value={values.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    required
                  >
                    <option value="">--- Select Gender ---</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Field>
                  {errors.gender && touched.gender && (
                    <p className="mt-1 text-xs text-red-500">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Educational Qualification *
                  </label>
                  <Field
                    name="educationalQualification"
                    as="select"
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.educationalQualification && touched.educationalQualification
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-outline-variant focus:border-astu-navy'
                    } bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all`}
                    value={values.educationalQualification}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    required
                  >
                    <option value="">--- Select Educational Qualification ---</option>
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                  </Field>
                  {errors.educationalQualification && touched.educationalQualification && (
                    <p className="mt-1 text-xs text-red-500">{errors.educationalQualification}</p>
                  )}
                </div>

                <Field
                  name="workPlace"
                  as={AuthInput}
                  label="Work Place (Institution, City, Region) *"
                  type="text"
                  placeholder="Enter your work place"
                  value={values.workPlace}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.workPlace}
                  touched={touched.workPlace}
                  disabled={isLoading}
                  required
                  autoComplete="organization"
                />

                <Field
                  name="workPosition"
                  as={AuthInput}
                  label="Work Position *"
                  type="text"
                  placeholder="Enter your work position"
                  value={values.workPosition}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.workPosition}
                  touched={touched.workPosition}
                  disabled={isLoading}
                  required
                  autoComplete="organization-title"
                />
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <Field
                  name="idNumber"
                  as={AuthInput}
                  label="ID Number (University Student ID)"
                  type="text"
                  placeholder="Enter your student ID (optional)"
                  value={values.idNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.idNumber}
                  touched={touched.idNumber}
                  disabled={isLoading}
                  autoComplete="off"
                />

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">
                    Year of Graduation *
                  </label>
                  <Field
                    name="yearOfGraduation"
                    as="select"
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.yearOfGraduation && touched.yearOfGraduation
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-outline-variant focus:border-astu-navy'
                    } bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all`}
                    value={values.yearOfGraduation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    required
                  >
                    <option value="">--- Select Year of Graduation ---</option>
                    {graduationYears.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </Field>
                  {errors.yearOfGraduation && touched.yearOfGraduation && (
                    <p className="mt-1 text-xs text-red-500">{errors.yearOfGraduation}</p>
                  )}
                </div>

                <Field
                  name="fieldOfStudy"
                  as={AuthInput}
                  label="Field of Study *"
                  type="text"
                  placeholder="Enter your field of study"
                  value={values.fieldOfStudy}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.fieldOfStudy}
                  touched={touched.fieldOfStudy}
                  disabled={isLoading}
                  required
                  autoComplete="organization"
                />

                <Field
                  name="email"
                  as={AuthInput}
                  label="Email *"
                  type="email"
                  placeholder="your.email@example.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />

                <Field
                  name="phone"
                  as={AuthInput}
                  label="Phone *"
                  type="tel"
                  placeholder="+251 911 123 456"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phone}
                  touched={touched.phone}
                  disabled={isLoading}
                  required
                  autoComplete="tel"
                />

                <Field
                  name="password"
                  as={AuthInput}
                  label="Password *"
                  type="password"
                  placeholder="Create a strong password"
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
                  autoComplete="new-password"
                />

                <Field
                  name="confirmPassword"
                  as={AuthInput}
                  label="Confirm Password *"
                  type="password"
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  disabled={isLoading}
                  required
                  showPasswordToggle
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-astu-navy/5 border border-astu-navy/10">
              <Field
                name="confirmation"
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-outline-variant text-astu-navy focus:ring-astu-navy focus:ring-offset-0"
                checked={values.confirmation}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="confirmation" className="text-sm text-on-surface leading-relaxed">
                I confirm that the information I have entered is accurate and correct.
              </label>
            </div>
            {errors.confirmation && touched.confirmation && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmation}</p>
            )}

            {/* Sign Up Button */}
            <AuthButton
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="bg-astu-navy hover:bg-astu-navy/90 w-full py-4 text-lg"
            >
              Sign Up
            </AuthButton>

            <div className="rounded-lg bg-astu-teal/5 p-5 border border-astu-teal/10">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-astu-teal mt-0.5" />
                <p className="text-sm text-on-surface leading-relaxed">
                  <strong>Note:</strong> Your information will be automatically verified against the university student database. 
                  After verification, an OTP code will be sent to your email to complete your registration.
                </p>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

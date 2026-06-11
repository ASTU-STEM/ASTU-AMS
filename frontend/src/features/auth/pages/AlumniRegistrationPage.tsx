import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { Mail, Check, X, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import SupportLink from '../components/SupportLink';
import authService from '../services/auth.service';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
// import { StudentIdInput } from '../components/StudentIdInput'; // Removed unused component
import { useRegistration } from '../contexts/RegistrationContext';
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
  
  // Conditional validations based on hasNoAstuEmail
  hasNoAstuEmail: yup.boolean(),
  
  idNumber: yup
    .string()
    .required('Student ID is required')
    .matches(/^UGR\/\d{5}\/\d{2}$/, 'Student ID must follow format UGR/XXXXX/YY'),
    
  email: yup
    .string()
    .when('hasNoAstuEmail', {
      is: true,
      then: (schema) => schema.optional(),
      otherwise: (schema) => schema
        .required('ASTU email is required')
        .email('Please enter a valid email address')
        .matches(/^[^\s@]+@astust\.edu\.et$/, 'Email must end with @astust.edu.et')
    }),
    
  yearOfGraduation: yup
    .string()
    .required('Year of graduation is required'),
  fieldOfStudy: yup
    .string()
    .required('Field of study is required'),
  phone: yup.string().required('Phone number is required').test('is-valid-phone', 'Please enter a valid phone number', (value) => isValidPhoneNumber(value || '')),

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

interface AlumniRegistrationFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  educationalQualification: string;
  workPlace: string;
  workPosition: string;
  idNumber: string;
  yearOfGraduation: string;
  fieldOfStudy: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  confirmation: boolean;
  hasNoAstuEmail: boolean;
}

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

export default function AlumniRegistrationPage() {
  const navigate = useNavigate();
  const { setRegistrationDetails } = useRegistration();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    hasNoAstuEmail: false,
  };

  const handleRegistrationSubmit = async (values: AlumniRegistrationFormData) => {
    setIsLoading(true);
    try {
// Calls updated authService.signup
       const response = await authService.signup({
        fullName: `${values.firstName} ${values.middleName} ${values.lastName}`,
        studentId: values.idNumber,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        phone: values.phone,
        batch: values.yearOfGraduation,
        department: values.fieldOfStudy,
        hasNoAstuEmail: values.hasNoAstuEmail,
      });

      if (response.ok) {
        const matchedEmail = response.data.email;

        setRegistrationDetails({
          studentId: values.idNumber,
          fullName: `${values.firstName} ${values.middleName} ${values.lastName}`,
          graduationYear: values.yearOfGraduation,
          email: matchedEmail || '',
          phone: values.phone,
        });

        // Always navigate to OTP verification page. The OTP page will handle whether to show the OTP input based on email presence.
        if (!matchedEmail) {
          toast.success('Registration successful! No university email matched on record. Proceed to OTP verification.');
        } else {
          toast.success('Registration submitted! Please verify your email via OTP.');
        }
        navigate('/verify-otp');
      } else {
        toast.error(response.message || 'Registration failed.');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
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

  return (
    <AuthLayout
      title="Register Here"
      subtitle="Create your alumni account"
      showLogo={true}
      maxWidth="max-w-2xl"
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
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => {
          const strength = getPasswordStrength(values.password);
          const passwordRules = [
            { label: 'Minimum 8 characters', met: values.password.length >= 8 },
            { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(values.password) },
            { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(values.password) },
            { label: 'One number (0-9)', met: /[0-9]/.test(values.password) },
            { label: 'One special symbol (!@#$ etc.)', met: /[^A-Za-z0-9]/.test(values.password) },
          ];

          return (
            <Form className="space-y-6">
              {/* Step indicator */}
              <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium bg-slate-50 p-3 rounded-lg border border-outline-variant">
                <span>Step 1 of 3: Enter profile details</span>
                <span className="bg-astu-navy/10 text-astu-navy px-2 py-0.5 rounded-full text-[10px]">Registration</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
                {/* Left Column */}
                <div className="space-y-5">
                  <FormField
                    name="firstName"
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

                  <FormField
                    name="middleName"
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

                  <FormField
                    name="lastName"
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

                  <FormField
                    name="gender"
                    label="Gender *"
                    as="select"
                    value={values.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.gender}
                    touched={touched.gender}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </FormField>

                  <FormField
                    name="educationalQualification"
                    label="Educational Qualification *"
                    as="select"
                    value={values.educationalQualification}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.educationalQualification}
                    touched={touched.educationalQualification}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select Qualification</option>
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                  </FormField>

                  <FormField
                    name="workPlace"
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

                  <FormField
                    name="workPosition"
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
                  <FormField
                    name="idNumber"
                    label="Student ID (University Student ID)"
                    type="text"
                    placeholder="UGR/XXXXX/YY"
                    value={values.idNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.idNumber}
                    touched={touched.idNumber}
                    disabled={isLoading}
                    required
                  />

                  <FormField
                    name="yearOfGraduation"
                    label="Year of Graduation *"
                    as="select"
                    value={values.yearOfGraduation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.yearOfGraduation}
                    touched={touched.yearOfGraduation}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select Year</option>
                    {graduationYears.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </FormField>

                  <FormField
                    name="fieldOfStudy"
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

                  {/* Toggle Checkbox: I don't have ASTU email */}
                  <div>
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-outline-variant">
                      <input
                        id="hasNoAstuEmail"
                        name="hasNoAstuEmail"
                        type="checkbox"
                        className="h-4.5 w-4.5 rounded border-outline-variant text-astu-navy focus:ring-astu-navy"
                        checked={values.hasNoAstuEmail}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFieldValue('hasNoAstuEmail', checked);
                          if (checked) {
                            setFieldValue('email', '');
                          }
                        }}
                        disabled={isLoading}
                      />
                      <label htmlFor="hasNoAstuEmail" className="text-xs font-semibold text-astu-navy select-none cursor-pointer">
                        I don't know / don't have my ASTU email
                      </label>
                    </div>
                  </div>

                  {/* ASTU Email Form Field (conditionally rendered) */}
                  {!values.hasNoAstuEmail && (
                    <FormField
                      name="email"
                      label="ASTU University Email *"
                      type="email"
                      placeholder="yourname@astust.edu.et"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.email}
                      touched={touched.email}
                      disabled={isLoading}
                      required
                      helpText="Institutional email addresses must end with @astust.edu.et"
                      autoComplete="email"
                    />
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone Number *</label>
                    <PhoneInput
                      international
                      defaultCountry="ET"
                      value={values.phone}
                      onChange={(value) => setFieldValue('phone', value)}
                      placeholder="+251 911 123 456"
                      disabled={isLoading}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-xs text-astu-red">{errors.phone as string}</p>
                    )}
                  </div>

                  {/* Create Password */}
                  <div className="relative">
                    <FormField
                      name="password"
                      label="Create Password *"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.password}
                      touched={touched.password}
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-on-surface-variant hover:text-astu-navy transition-all animate-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password strength checker box */}
                  {values.password && (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-outline-variant">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-on-surface-variant font-medium">Strength:</span>
                        <span className="font-bold text-on-surface">{strength.label}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${strength.color} transition-all duration-300`} 
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[10px] text-on-surface-variant pl-0 list-none">
                        {passwordRules.map((rule, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            {rule.met ? (
                              <Check className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <X className="h-3 w-3 text-red-400 flex-shrink-0" />
                            )}
                            <span className={rule.met ? 'text-on-surface font-medium' : ''}>{rule.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="relative">
                    <FormField
                      name="confirmPassword"
                      label="Confirm Password *"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.confirmPassword}
                      touched={touched.confirmPassword}
                      disabled={isLoading}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[38px] text-on-surface-variant hover:text-astu-navy transition-all animate-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-astu-navy/5 border border-astu-navy/10">
                <Field
                  name="confirmation"
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-outline-variant text-astu-navy focus:ring-astu-navy"
                  checked={values.confirmation}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label htmlFor="confirmation" className="text-xs text-on-surface leading-relaxed">
                  I confirm that the information I have entered is accurate and correct. I consent to my student ID data being matched against the ASTU registrar database for identity verification.
                </label>
              </div>
              {errors.confirmation && touched.confirmation && (
                <p className="mt-1 text-xs text-astu-red font-medium">{errors.confirmation}</p>
              )}

              {/* Sign Up Button */}
              <PrimaryButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="py-4 text-base"
              >
                Sign Up
              </PrimaryButton>

              {/* Support Links in Footer */}
              <div className="pt-2 border-t border-outline-variant flex flex-col items-center gap-3">
                <SupportLink 
                  lastErrorCode="REGISTRATION_PAGE"
                  label="Need help with registration? Contact support"
                />
              </div>

              <div className="rounded-lg bg-astu-teal/5 p-4 border border-astu-teal/10">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-astu-teal mt-0.5" />
                  <p className="text-xs text-on-surface leading-relaxed">
                    <strong>Information:</strong> Your registration profile is cross-verified in real time against ASTU registrar records. Upon successful lookup, an OTP verification code is dispatched to your student email.
                  </p>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </AuthLayout>
  );
}

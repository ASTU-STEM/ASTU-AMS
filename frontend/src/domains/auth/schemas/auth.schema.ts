import * as yup from 'yup';

// Password strength requirements
const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

// Custom password validation message
const passwordMessage = 
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';

// Login schema
export const loginSchema = yup.object().shape({
  emailOrStudentId: yup
    .string()
    .required('Email or Student ID is required')
    .test('email-or-student-id', 'Please enter a valid email or student ID', (value) => {
      if (!value) return false;
      // Check if it's an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if it's a student ID (assuming format like ATR/1234/23 or similar)
      const studentIdRegex = /^[A-Za-z]{2,4}\/\d{4,6}\/\d{2}$|^\d{6,10}$/;
      return emailRegex.test(value) || studentIdRegex.test(value);
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(1, 'Password is required'),
  rememberMe: yup.boolean(),
});

// Signup schema
export const signupSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name should only contain letters and spaces'),
  studentId: yup
    .string()
    .required('Student ID is required')
    .matches(/^[A-Za-z]{2,4}\/\d{4,6}\/\d{2}$|^\d{6,10}$/, 'Please enter a valid Student ID'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .matches(/^[^\s@]+@(astu\.edu\.et|gmail\.com|yahoo\.com|outlook\.com)$/, 
      'Please use your institutional email (astu.edu.et) or a personal email'),
  password: yup
    .string()
    .required('Password is required')
    .min(passwordRequirements.minLength, passwordMessage)
    .matches(/[A-Z]/, passwordMessage)
    .matches(/[a-z]/, passwordMessage)
    .matches(/[0-9]/, passwordMessage)
    .matches(/[^A-Za-z0-9]/, passwordMessage),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  department: yup
    .string()
    .optional(),
  batch: yup
    .string()
    .optional()
    .matches(/^\d{4}$/, 'Batch must be a valid year (e.g., 2024)'),
  activationCode: yup
    .string()
    .optional(),
});

// Types for form values
export interface LoginFormData {
  emailOrStudentId: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  firstName: string;
  studentId: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  batch?: string;
  activationCode?: string;
}

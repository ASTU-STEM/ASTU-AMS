export const APP_NAME = 'ASTU Alumni Management System';
export const APP_SHORT_NAME = 'ASTU-AMS';
export const APP_VERSION = '1.0.0';

export const ROLES = {
  ALUMNI: 'ALUMNI' as const,
  EMPLOYER: 'EMPLOYER' as const,
  REGISTRAR: 'REGISTRAR' as const,
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD' as const,
  ADMIN: 'ADMIN' as const,
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ALUMNI_DASHBOARD: '/alumni/dashboard',
  EMPLOYER_DASHBOARD: '/employer/dashboard',
  REGISTRAR_DASHBOARD: '/registrar/dashboard',
  DEPARTMENT_DASHBOARD: '/department/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SURVEYS: '/admin/surveys',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_BACKUP: '/admin/backup',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_HOMEPAGE: '/admin/homepage',
  ADMIN_GALLERY: '/admin/gallery',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_MODULES: '/admin/modules',
  ADMIN_REPORTS: '/admin/reports',
  EMPLOYERS_PAGE: '/employers',
};

export const SURVEY_INTERVALS = {
  SIX_MONTHS: 6,
  TWELVE_MONTHS: 12,
  TWENTY_FOUR_MONTHS: 24,
} as const;

export const SURVEY_STATUS = {
  PENDING: 'PENDING' as const,
  COMPLETED: 'COMPLETED' as const,
  SKIPPED: 'SKIPPED' as const,
  OVERDUE: 'OVERDUE' as const,
};

export const JOB_STATUS = {
  DRAFT: 'DRAFT' as const,
  PUBLISHED: 'PUBLISHED' as const,
  CLOSED: 'CLOSED' as const,
  FILLED: 'FILLED' as const,
};

export const APPLICATION_STATUS = {
  PENDING: 'PENDING' as const,
  REVIEWING: 'REVIEWING' as const,
  SHORTLISTED: 'SHORTLISTED' as const,
  INTERVIEWED: 'INTERVIEWED' as const,
  OFFERED: 'OFFERED' as const,
  ACCEPTED: 'ACCEPTED' as const,
  REJECTED: 'REJECTED' as const,
  WITHDRAWN: 'WITHDRAWN' as const,
};

export const DOCUMENT_TYPES = {
  TRANSCRIPT: 'TRANSCRIPT' as const,
  CERTIFICATE: 'CERTIFICATE' as const,
  VERIFICATION_LETTER: 'VERIFICATION_LETTER' as const,
  ENROLLMENT_VERIFICATION: 'ENROLLMENT_VERIFICATION' as const,
  RECOMMENDATION: 'RECOMMENDATION' as const,
};

export const DOCUMENT_STATUS = {
  PENDING: 'Pending' as const,
  PROCESSING: 'Processing' as const,
  READY: 'Ready' as const,
  DELIVERED: 'Delivered' as const,
  REJECTED: 'Rejected' as const,
};

export const EVENT_TYPES = {
  CAREER_FAIR: 'CAREER_FAIR' as const,
  WORKSHOP: 'WORKSHOP' as const,
  SEMINAR: 'SEMINAR' as const,
  NETWORKING: 'NETWORKING' as const,
  REUNION: 'REUNION' as const,
  WEBINAR: 'WEBINAR' as const,
};

export const MENTORSHIP_STATUS = {
  AVAILABLE: 'AVAILABLE' as const,
  REQUEST_PENDING: 'REQUEST_PENDING' as const,
  CONNECTED: 'CONNECTED' as const,
  COMPLETED: 'COMPLETED' as const,
};

export const PAYMENT_METHODS = {
  TELEBIRR: 'TELEBIRR' as const,
  BANK_TRANSFER: 'BANK_TRANSFER' as const,
  CASH: 'CASH' as const,
};

export const CURRENCY = 'ETB';

export const THEME_STORAGE_KEY = 'theme';
export const SIDEBAR_STORAGE_PREFIX = '_sidebar_collapsed';
export const AUTH_TOKEN_KEY = 'authToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'user';

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Software Engineering',
  'Electrical & Computer Engineering',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Civil Engineering',
  'Industrial Engineering',
  'Material Science & Engineering',
  'Biotechnology',
  'Applied Physics',
  'Mathematics',
  'Environmental Science',
] as const;

export const GRADUATION_YEARS = Array.from({ length: 30 }, (_, i) => (2026 - i).toString());

export const SALARY_RANGES = [
  'Less than 5,000 ETB',
  '5,000 - 10,000 ETB',
  '10,000 - 20,000 ETB',
  '20,000 - 35,000 ETB',
  '35,000 - 50,000 ETB',
  '50,000 - 75,000 ETB',
  '75,000 - 100,000 ETB',
  'Above 100,000 ETB',
  'Prefer not to say',
] as const;

export const EMPLOYMENT_STATUS = [
  'Employed Full-Time',
  'Employed Part-Time',
  'Self-Employed',
  'Unemployed',
  'Student (Further Education)',
  'Entrepreneur',
  'Freelancer',
  'Intern/Trainee',
] as const;

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

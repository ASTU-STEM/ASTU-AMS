import { useLocation } from 'react-router-dom';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownUp,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Download,
  EllipsisVertical,
  Eye,
  Filter,
  KeyRound,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Users,
  Clock3,
  Trash2,
  User,
  X,
  Check,
  UserRound,
  XCircle,
  GraduationCap,
  BookOpen,
  Newspaper,
  UserCog,
  Lock,
  CheckCircle2,
  Sparkles,
  Copy,
  Loader2,
  FileSpreadsheet,
  Code,
  SlidersHorizontal,
  Bell,
  Link,
  Award,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminModal from '../components/AdminModal';
import AdminBadge from '../components/AdminBadge';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/admin.service';

type Role = 'Alumni' | 'Employer' | 'Department Head' | 'DepartmentHead' | 'Faculty' | 'Registrar' | 'RegistrarStaff' | 'CMS Manager' | 'Admin' | 'Super Admin' | 'SuperAdmin';
type Status = 'Active' | 'Inactive' | 'Suspended' | 'Pending Verification';
type SortKey = 'name' | 'studentId' | 'role' | 'department' | 'batch' | 'status' | 'lastLogin';

type UserRow = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: Role;
  department: string;
  batch: string;
  status: Status;
  lastLogin: string;
  registeredAt: string;
  phone: string;
  avatar?: string;
  adminNotes?: string;

  // Real Database Profile Fields
  cgpa?: number | string;
  graduationYear?: number | string;
  degreeDistinction?: string;
  advisor?: string;
  thesisTitle?: string;

  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  nationalId?: string;
  emergencyContact?: string;

  employerName?: string;
  jobTitle?: string;
  position?: string;
  industry?: string;
  experienceYears?: number | string;
  workLocation?: string;
  salaryRange?: string;
  employmentStatus?: string;

  skills?: string[];
  certifications?: Array<{ name: string; issuer?: string; year?: string } | string>;
  languages?: string[];
  experiences?: Array<any>;
  projects?: Array<any>;
  achievements?: Array<any>;

  resumeUrl?: string;
  profilePicture?: string;
  avatarUrl?: string;
  linkedIn?: string;
  gitHub?: string;
  portfolio?: string;
  telegram?: string;
  twitterUrl?: string;
  preferences?: any;
  isCgpaPublic?: boolean;
  transcriptUrl?: string;
  degreeCertUrl?: string;
  documentRequests?: Array<any>;
  verificationRequests?: Array<any>;
  isVerified?: boolean;

  // Employer fields
  companyName?: string;
  website?: string;
  location?: string;
  hrContact?: string;
  tin?: string;
  companySize?: string;
  contactPerson?: string;
  contactEmail?: string;
  verificationStatus?: string;
  ndaSigned?: boolean;
  isPremium?: boolean;
  partnerships?: string[];
  partnershipAgreement?: string;
  clearanceStatus?: string;
  jobPosts?: Array<{ id: string; title: string; type?: string; location?: string; status?: string; createdAt?: string; applicantCount?: number }>;
  activeJobsCount?: number;
  totalApplicationsCount?: number;
  twoFactorEnabled?: boolean;
};

type UserFormState = {
  name: string;
  email: string;
  password: string;
  autoGeneratePassword: boolean;
  role: Role;
  status: Status;
  isVerified: boolean;
  phone: string;
  // Alumni 9 specific fields
  studentId: string;
  department: string;
  graduationYear: string;
  cgpa: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  // Employer fields
  industry: string;
  location: string;
  hrContact: string;
  // CMS Manager fields
  cmsScope: string;
};

type FormErrors = Partial<Record<keyof UserFormState, string>>;

const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getUserAvatarUrl = (user: any): string | null => {
  if (!user) return null;
  const rawPic = user.profilePicture || user.avatarUrl || user.avatar || user.alumniProfile?.profilePicture || user.photo;
  if (!rawPic || typeof rawPic !== 'string' || !rawPic.trim()) return null;
  const trimmed = rawPic.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const formattedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${UPLOAD_BASE}${formattedPath}`;
};


const roles: Array<'All Roles' | Role> = ['All Roles', 'Alumni', 'Employer', 'Department Head', 'Registrar', 'CMS Manager', 'Super Admin', 'Admin'];
const statuses: Array<'All' | Status> = ['All', 'Active', 'Inactive', 'Suspended', 'Pending Verification'];
const departments = ['All Departments', 'Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Information Engineering', 'Registrar Office'];
const pageSize = 25;

const roleTone: Record<Role, 'default' | 'warning' | 'danger' | 'success' | 'neutral'> = {
  Alumni: 'default',
  Employer: 'warning',
  'Department Head': 'neutral',
  DepartmentHead: 'neutral',
  Faculty: 'neutral',
  Registrar: 'success',
  RegistrarStaff: 'success',
  'CMS Manager': 'neutral',
  Admin: 'danger',
  'Super Admin': 'danger',
  SuperAdmin: 'danger',
};

const statusTone: Record<Status, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Active: 'success',
  Inactive: 'neutral',
  Suspended: 'danger',
  'Pending Verification': 'warning',
};

const roleColorClass: Record<Role, string> = {
  Alumni: 'bg-[#003580]/10 text-[#003580] border-[#003580]/15',
  Employer: 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20',
  'Department Head': 'bg-violet-100 text-violet-700 border-violet-200',
  DepartmentHead: 'bg-violet-100 text-violet-700 border-violet-200',
  Faculty: 'bg-violet-100 text-violet-700 border-violet-200',
  Registrar: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15',
  RegistrarStaff: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15',
  'CMS Manager': 'bg-teal-100 text-teal-800 border-teal-200',
  Admin: 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15',
  'Super Admin': 'bg-purple-100 text-purple-800 border-purple-200',
  SuperAdmin: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusColorClass: Record<Status, string> = {
  Active: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/15',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  Suspended: 'bg-[#E24B4A]/10 text-[#E24B4A] border-[#E24B4A]/15',
  'Pending Verification': 'bg-[#E8A020]/10 text-[#B87900] border-[#E8A020]/20',
};

const seedUsers: UserRow[] = [
  {
    id: 'USR-001',
    name: 'Abebe Kebede',
    email: 'abebe.kebede@astu.edu.et',
    studentId: 'ASTU/1024/18',
    role: 'Alumni',
    department: 'Software Engineering',
    batch: '2018',
    status: 'Active',
    lastLogin: '2026-05-27T11:20:00Z',
    registeredAt: '2022-10-14T08:00:00Z',
    phone: '+251 911 200 101',
    adminNotes: 'Completed tracer survey and verified profile.',
    cgpa: 3.85,
    graduationYear: 2018,
    degreeDistinction: 'B.Sc. First Class Distinction',
    advisor: 'Dr. Meseret Alemu (Department Head)',
    thesisTitle: 'Distributed Ledger Tracer & Verification Engine for Higher Education',
    dateOfBirth: '1999-04-12',
    gender: 'Male',
    nationality: 'Ethiopian',
    address: 'Addis Ababa, Bole Sub-City, Woreda 03',
    nationalId: 'ET-ID-8849-2024',
    emergencyContact: '+251 911 300 404 (Kebede A. - Father)',
    employerName: 'Safaricom Ethiopia PLC',
    jobTitle: 'Senior Software Engineer (FinTech)',
    industry: 'Telecommunications & Digital Financial Services',
    experienceYears: 4.5,
    workLocation: 'Addis Ababa HQ (Hybrid)',
    salaryRange: '55,000 – 70,000 ETB / Month',
    employmentStatus: 'EMPLOYED',
    skills: ['TypeScript', 'React.js', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
    certifications: ['AWS Certified Solutions Architect', 'Certified ScrumMaster (CSM)'],
    languages: ['Amharic (Native)', 'English (Fluent)', 'Afaan Oromoo (Conversational)'],
    isVerified: true,
  },
  {
    id: 'USR-002',
    name: 'Tigist Haile',
    email: 'tigist@safir.com',
    studentId: '',
    role: 'Employer',
    department: 'External Partner',
    batch: 'N/A',
    status: 'Active',
    lastLogin: '2026-05-28T16:35:00Z',
    registeredAt: '2025-11-08T08:00:00Z',
    phone: '+251 911 200 202',
    adminNotes: 'Employer profile in good standing.',
    companyName: 'Safir Tech Solutions',
    industry: 'Enterprise Software & Cloud Integration',
    location: 'Addis Ababa, HQ Tower',
    hrContact: '+251 911 200 202 (Tigist Haile - HR Director)',
    tin: 'TIN-0099882211-ETH',
    companySize: 'Enterprise (150+ Employees)',
    contactPerson: 'Tigist Haile',
    contactEmail: 'tigist@safir.com',
    verificationStatus: 'VERIFIED_PARTNER',
    ndaSigned: true,
    isPremium: true,
  },
  {
    id: 'USR-003',
    name: 'Dr. Meseret Alemu',
    email: 'cs.head@astu.edu.et',
    studentId: '',
    role: 'Department Head',
    department: 'Computer Science',
    batch: 'Faculty',
    status: 'Active',
    lastLogin: '2026-05-28T09:10:00Z',
    registeredAt: '2024-08-22T08:00:00Z',
    phone: '+251 911 200 303',
    adminNotes: 'Department analytics access enabled.',
    advisor: 'Faculty Leadership Committee',
    isVerified: true,
  },
  {
    id: 'USR-004',
    name: 'Dr. Abebe Assefa',
    email: 'registrar@astu.edu.et',
    studentId: '',
    role: 'Registrar',
    department: 'Registrar Office',
    batch: 'Faculty',
    status: 'Active',
    lastLogin: '2026-05-28T08:15:00Z',
    registeredAt: '2023-01-12T08:00:00Z',
    phone: '+251 911 200 404',
    isVerified: true,
  },
  {
    id: 'USR-005',
    name: 'Admin User',
    email: 'admin@astu.edu.et',
    studentId: '',
    role: 'Admin',
    department: 'System Office',
    batch: 'N/A',
    status: 'Active',
    lastLogin: '2026-05-28T17:05:00Z',
    registeredAt: '2021-07-01T08:00:00Z',
    phone: '+251 911 200 505',
    adminNotes: 'Full system access.',
    isVerified: true,
  },
  {
    id: 'USR-006',
    name: 'Helena Tesfaye',
    email: 'helena.tesfaye@astu.edu.et',
    studentId: 'ASTU/4412/19',
    role: 'Alumni',
    department: 'Electrical Engineering',
    batch: '2019',
    status: 'Pending Verification',
    lastLogin: '2026-05-26T14:40:00Z',
    registeredAt: '2026-05-21T08:00:00Z',
    phone: '+251 911 200 606',
    cgpa: 3.62,
    graduationYear: 2019,
    degreeDistinction: 'B.Sc. Very Great Distinction',
    advisor: 'Prof. Worku Tadesse',
    thesisTitle: 'Smart Grid Automation & IoT Micro-Substation Control',
    dateOfBirth: '2000-08-21',
    gender: 'Female',
    nationality: 'Ethiopian',
    address: 'Adama, Kebele 04',
    nationalId: 'ET-ID-4412-2024',
    emergencyContact: '+251 912 400 505 (Tesfaye M.)',
    employerName: 'Ethio Telecom',
    jobTitle: 'Network Operations Engineer',
    industry: 'Telecommunications Networks',
    experienceYears: 2.0,
    workLocation: 'Adama Regional Office',
    salaryRange: '35,000 – 45,000 ETB / Month',
    employmentStatus: 'EMPLOYED',
    skills: ['SCADA Systems', 'Embedded Systems', 'C++', 'Python', 'Power Systems'],
    certifications: ['Cisco CCNA Routing & Switching'],
    languages: ['Amharic (Native)', 'English (Fluent)'],
    isVerified: false,
  },
  {
    id: 'USR-007',
    name: 'Dawit Fikre',
    email: 'dawit.fikre@astu.edu.et',
    studentId: 'ASTU/9911/17',
    role: 'Alumni',
    department: 'Civil Engineering',
    batch: '2017',
    status: 'Suspended',
    lastLogin: '2026-04-18T10:12:00Z',
    registeredAt: '2022-09-01T08:00:00Z',
    phone: '+251 911 200 707',
    adminNotes: 'Account suspended due to password policy violation.',
    cgpa: 3.45,
    graduationYear: 2017,
    degreeDistinction: 'B.Sc. Great Distinction',
    advisor: 'Dr. Girma Bekele',
    thesisTitle: 'Seismic Resilience & Structural Analysis of High-Rise Concrete',
    dateOfBirth: '1998-11-05',
    gender: 'Male',
    nationality: 'Ethiopian',
    address: 'Hawassa, Kebele 02',
    nationalId: 'ET-ID-9911-2024',
    emergencyContact: '+251 911 777 888 (Fikre B.)',
    employerName: 'Sunshine Construction PLC',
    jobTitle: 'Site Structural Project Lead',
    industry: 'Civil Infrastructure & Construction',
    experienceYears: 5.0,
    workLocation: 'Hawassa Project Site',
    salaryRange: '40,000 – 55,000 ETB / Month',
    employmentStatus: 'EMPLOYED',
    skills: ['AutoCAD Structural', 'ETABS', 'SAP2000', 'Project Scheduling'],
    certifications: ['Professional Civil Engineer License (MoUD)'],
    languages: ['Amharic (Native)', 'English (Professional)'],
    isVerified: true,
  },
  {
    id: 'USR-008',
    name: 'Nati Dinku',
    email: 'nati.dinku@astu.edu.et',
    studentId: 'ASTU/3018/20',
    role: 'Alumni',
    department: 'Mechanical Engineering',
    batch: '2020',
    status: 'Inactive',
    lastLogin: '2026-02-02T09:00:00Z',
    registeredAt: '2024-11-19T08:00:00Z',
    phone: '+251 911 200 808',
    cgpa: 3.55,
    graduationYear: 2020,
    degreeDistinction: 'B.Sc. Great Distinction',
    advisor: 'Dr. Kassahun Meles',
    thesisTitle: 'Thermal Performance Optimization of Solar Thermal Collectors',
    dateOfBirth: '2001-02-14',
    gender: 'Male',
    nationality: 'Ethiopian',
    address: 'Adama, Kebele 09',
    nationalId: 'ET-ID-3018-2024',
    emergencyContact: '+251 911 888 999 (Dinku T.)',
    employerName: 'Seeking Employment',
    jobTitle: 'Mechanical Engineer Intern / Candidate',
    industry: 'Manufacturing & Energy',
    experienceYears: 0.5,
    workLocation: 'Adama / Open to Relocation',
    salaryRange: 'Unemployed / Seeking Placement',
    employmentStatus: 'UNEMPLOYED',
    skills: ['SolidWorks', 'ANSYS Fluent', 'Thermodynamics', 'MATLAB'],
    certifications: [],
    languages: ['Amharic (Native)', 'English (Fluent)', 'Afaan Oromoo (Native)'],
    isVerified: false,
  },
];

function makeUsers(): UserRow[] {
  const people = [...seedUsers];
  const extras = Array.from({ length: 48 }).map((_, index) => {
    const number = index + 9;
    const roleCycle: Role[] = ['Alumni', 'Employer', 'Department Head', 'Registrar', 'Admin'];
    const statusCycle: Status[] = ['Active', 'Inactive', 'Suspended', 'Pending Verification', 'Active'];
    const deptCycle = ['Computer Science', 'Software Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Information Engineering'];
    const role = roleCycle[index % roleCycle.length];
    const department = role === 'Employer' || role === 'Admin' ? 'System Office' : deptCycle[index % deptCycle.length];
    const isAlumni = role === 'Alumni';
    const name = [
      'Kalkidan', 'Saba', 'Henok', 'Mekdes', 'Yonas', 'Ruth', 'Mulu', 'Martha', 'Yohannes', 'Liya',
      'Netsanet', 'Amanuel', 'Betelhem', 'Fikir', 'Mekonnen', 'Sara', 'Zerihun', 'Rahel'
    ][index % 18];

    const year = (index % 5) + 2018;
    const cgpaVal = (3.20 + (index % 15) * 0.05).toFixed(2);
    const firstName = name;
    const lastName = ['Abebe', 'Kassaye', 'Tadesse', 'Meles', 'Yimer', 'Beyene', 'Adugna', 'Mekonnen'][index % 8];

    return {
      id: `USR-${String(number).padStart(3, '0')}`,
      name: `${firstName} ${lastName}`,
      email: `${name.toLowerCase()}.${index + 1}@astu.edu.et`,
      studentId: isAlumni ? `ASTU/${1000 + index}/${String(year).slice(-2)}` : '',
      role,
      department,
      batch: isAlumni ? String(year) : 'N/A',
      status: statusCycle[index % statusCycle.length],
      lastLogin: new Date(Date.now() - (index + 1) * 86_400_000).toISOString(),
      registeredAt: new Date(Date.now() - (index + 90) * 86_400_000).toISOString(),
      phone: `+251 911 ${String(300 + index).padStart(3, '0')} ${String(100 + index).padStart(3, '0')}`,
      adminNotes: role === 'Alumni' ? 'Graduation record verified with Registrar database.' : 'System record synced.',

      // Rich profile fields per user record
      cgpa: isAlumni ? Number(cgpaVal) : undefined,
      graduationYear: isAlumni ? year : undefined,
      degreeDistinction: isAlumni ? (Number(cgpaVal) >= 3.75 ? 'B.Sc. First Class Distinction' : Number(cgpaVal) >= 3.4 ? 'B.Sc. Very Great Distinction' : 'B.Sc. Great Distinction') : undefined,
      advisor: isAlumni ? `Dr. ${['Alemu', 'Tadesse', 'Bekele', 'Haile', 'Meles'][index % 5]} (${department})` : undefined,
      thesisTitle: isAlumni ? `Design & Implementation of ${department} Solutions for Ethiopian Infrastructure` : undefined,
      dateOfBirth: `200${(index % 4)}-0${(index % 8) + 1}-15`,
      gender: index % 2 === 0 ? 'Female' : 'Male',
      nationality: 'Ethiopian',
      address: `${['Addis Ababa', 'Adama', 'Hawassa', 'Bishoftu', 'Dire Dawa'][index % 5]}, Kebele ${(index % 9) + 1}`,
      nationalId: `ET-ID-${1000 + index}-2024`,
      emergencyContact: `+251 911 ${String(500 + index).padStart(3, '0')} ${String(200 + index).padStart(3, '0')}`,

      employerName: isAlumni ? (index % 3 === 0 ? 'Ethio Telecom' : index % 3 === 1 ? 'Commercial Bank of Ethiopia' : 'Kifiya Financial Technology') : undefined,
      jobTitle: isAlumni ? `${department} Specialist` : undefined,
      industry: isAlumni ? 'Enterprise Technology & Innovation' : undefined,
      experienceYears: isAlumni ? (index % 4) + 1 : undefined,
      workLocation: `${['Addis Ababa', 'Adama', 'Dire Dawa'][index % 3]} Branch`,
      salaryRange: isAlumni ? `${30 + (index % 5) * 10},000 – ${40 + (index % 5) * 10},000 ETB / Month` : undefined,
      employmentStatus: isAlumni ? 'EMPLOYED' : undefined,

      skills: isAlumni ? [department, 'Data Analysis', 'Python', 'SQL', 'Project Management'] : undefined,
      certifications: isAlumni ? [`Certified ${department} Practitioner`] : undefined,
      languages: ['Amharic (Native)', 'English (Fluent)'],
      isVerified: index % 3 !== 0,

      companyName: role === 'Employer' ? `${firstName} Enterprise Solutions` : undefined,
      tin: role === 'Employer' ? `TIN-${88000 + index}-ETH` : undefined,
      companySize: role === 'Employer' ? 'Medium Scale (50-200 Employees)' : undefined,
      verificationStatus: role === 'Employer' ? 'VERIFIED_PARTNER' : undefined,
    } satisfies UserRow;
  });

  return [...people, ...extras];
}

function generatePassword() {
  return `ASTU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatRelative(dateValue: string) {
  return `${formatDistanceToNow(new Date(dateValue), { addSuffix: true })}`;
}

function createDefaultForm(): UserFormState {
  return {
    name: '',
    email: '',
    password: generatePassword(),
    autoGeneratePassword: true,
    role: 'Alumni',
    status: 'Active',
    isVerified: true,
    phone: '',
    studentId: '',
    department: 'Software Engineering',
    graduationYear: String(new Date().getFullYear()),
    cgpa: '3.50',
    dateOfBirth: '2001-05-15',
    nationality: 'Ethiopian',
    gender: 'Male',
    industry: 'Technology & Enterprise',
    location: 'Addis Ababa, HQ',
    hrContact: '',
    cmsScope: 'All Portal & News Content',
  };
}

export default function UserManagement() {
  const location = useLocation();
  const isCms = location.pathname.startsWith('/cms');
  const [searchParams] = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const initialStatusParam = searchParams.get('status');

  const [users, setUsers] = useState<UserRow[]>(() => {
    try {
      localStorage.removeItem('admin_users_cache');
    } catch {}
    return makeUsers();
  });
  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      const cached = localStorage.getItem('admin_users_total_cache');
      return cached ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [totalPages, setTotalPages] = useState(1);
  const [globalStats, setGlobalStats] = useState(() => {
    try {
      const cached = localStorage.getItem('admin_users_stats_cache');
      return cached ? JSON.parse(cached) : { total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 };
    } catch {
      return { total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 };
    }
  });
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<string>('academic');

  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'All Roles' | Role>(() => {
    if (!initialRoleParam) return 'All Roles';
    const r = initialRoleParam.toUpperCase();
    if (r === 'EMPLOYER') return 'Employer';
    if (r === 'ALUMNI') return 'Alumni';
    if (r === 'ADMIN') return 'Admin';
    if (r === 'REGISTRAR') return 'Registrar';
    return 'All Roles';
  });
  const [selectedStatus, setSelectedStatus] = useState<'All' | Status>(() => {
    if (!initialStatusParam) return 'All';
    const s = initialStatusParam.toUpperCase();
    if (s === 'PENDING' || s === 'PENDING VERIFICATION') setSelectedStatus('Pending Verification');
    else if (s === 'ACTIVE') setSelectedStatus('Active');
    else if (s === 'INACTIVE') setSelectedStatus('Inactive');
    else if (s === 'SUSPENDED') setSelectedStatus('Suspended');
    return 'All';
  });
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeUser, setActiveUser] = useState<UserRow | null>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(createDefaultForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Reset Password & Change Role Modal States
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState<UserRow | null>(null);
  const [resetPasswordInputValue, setResetPasswordInputValue] = useState<string>('');
  const [resetPasswordSubmitting, setResetPasswordSubmitting] = useState<boolean>(false);

  const [changeRoleModalUser, setChangeRoleModalUser] = useState<UserRow | null>(null);
  const [selectedRoleForChange, setSelectedRoleForChange] = useState<Role>('Alumni');
  const [changeRoleSubmitting, setChangeRoleSubmitting] = useState<boolean>(false);

  const openResetPasswordModal = (user: UserRow) => {
    setResetPasswordModalUser(user);
    setResetPasswordInputValue(generatePassword());
  };

  const handleExecuteResetPassword = async () => {
    if (!resetPasswordModalUser) return;
    setResetPasswordSubmitting(true);
    try {
      const { adminService } = await import('../services/admin.service');
      const { default: toast } = await import('react-hot-toast');
      const res = await adminService.resetUserPassword(resetPasswordModalUser.id, resetPasswordInputValue.trim());
      if (res.ok) {
        toast.success(`Password reset for ${resetPasswordModalUser.name}! Temp Pass: ${resetPasswordInputValue.trim()}`, { duration: 8000 });
        setResetPasswordModalUser(null);
      } else {
        toast.error(res.message || 'Failed to reset password');
      }
    } catch (err: any) {
      const { default: toast } = await import('react-hot-toast');
      toast.error(err?.message || 'Error resetting password');
    } finally {
      setResetPasswordSubmitting(false);
    }
  };

  const openChangeRoleModal = (user: UserRow) => {
    setChangeRoleModalUser(user);
    setSelectedRoleForChange(user.role);
  };

  const handleExecuteChangeRole = async () => {
    if (!changeRoleModalUser) return;
    setChangeRoleSubmitting(true);
    try {
      const { adminService } = await import('../services/admin.service');
      const { default: toast } = await import('react-hot-toast');
      const res = await adminService.updateUser(changeRoleModalUser.id, { role: selectedRoleForChange });
      if (res.ok) {
        toast.success(`Role for ${changeRoleModalUser.name} changed to ${selectedRoleForChange}`);
        const updated = { ...changeRoleModalUser, role: selectedRoleForChange };
        setUsers(prev => prev.map(u => u.id === changeRoleModalUser.id ? updated : u));
        if (activeUser?.id === changeRoleModalUser.id) {
          setActiveUser(updated);
        }
        setChangeRoleModalUser(null);
      } else {
        toast.error(res.message || 'Failed to change role');
      }
    } catch (err: any) {
      const { default: toast } = await import('react-hot-toast');
      toast.error(err?.message || 'Error changing user role');
    } finally {
      setChangeRoleSubmitting(false);
    }
  };
  const [searchFocused, setSearchFocused] = useState(false);
  const [dbDepartments, setDbDepartments] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [inlineForm, setInlineForm] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    location: '',
    website: '',
    contactPerson: '',
    contactEmail: '',
    phone: '',
    tin: '',
    verificationStatus: '',
    partnershipAgreement: '',
    ndaSigned: true,
  });
  const [savingInline, setSavingInline] = useState(false);

  useEffect(() => {
    setEditingTab(null);
  }, [activeUser, activeDetailTab]);

  const startInlineEdit = (tabName: string, user: UserRow) => {
    setEditingTab(tabName);
    setInlineForm({
      companyName: user.companyName || user.name || '',
      industry: user.industry || '',
      companySize: user.companySize || 'Enterprise',
      location: user.location || user.address || '',
      website: user.website || '',
      contactPerson: user.contactPerson || user.hrContact || user.name || '',
      contactEmail: user.contactEmail || user.email || '',
      phone: user.phone || user.hrContact || '',
      tin: user.tin || '',
      verificationStatus: user.verificationStatus || (user.status === 'Active' ? 'Active' : 'Pending Verification'),
      partnershipAgreement: user.partnershipAgreement || (user.isPremium ? 'Tier 1 Strategic Partnership Agreement' : 'ASTU Strategic Partnership Agreement'),
      ndaSigned: user.ndaSigned !== false,
    });
  };

  const handleSaveInlineEmployer = async () => {
    if (!activeUser) return;
    setSavingInline(true);
    try {
      const payload = {
        name: inlineForm.companyName || activeUser.name,
        companyName: inlineForm.companyName,
        industry: inlineForm.industry,
        companySize: inlineForm.companySize,
        location: inlineForm.location,
        website: inlineForm.website,
        contactPerson: inlineForm.contactPerson,
        contactEmail: inlineForm.contactEmail,
        phone: inlineForm.phone,
        tin: inlineForm.tin,
        verificationStatus: inlineForm.verificationStatus,
        partnershipAgreement: inlineForm.partnershipAgreement,
        ndaSigned: inlineForm.ndaSigned,
        status: (inlineForm.verificationStatus === 'Active' || inlineForm.verificationStatus === 'VERIFIED_PARTNER') ? 'Active' : activeUser.status,
      };

      const res = await adminService.updateUser(activeUser.id, payload);
      if (res.ok) {
        toast.success('Employer profile updated successfully');
        const updatedUser: UserRow = {
          ...activeUser,
          name: payload.name,
          companyName: payload.companyName,
          industry: payload.industry,
          companySize: payload.companySize,
          location: payload.location,
          website: payload.website,
          contactPerson: payload.contactPerson,
          contactEmail: payload.contactEmail,
          phone: payload.phone,
          tin: payload.tin,
          verificationStatus: payload.verificationStatus,
          partnershipAgreement: payload.partnershipAgreement,
          ndaSigned: payload.ndaSigned,
        };
        setActiveUser(updatedUser);
        setUsers((prev) => prev.map((u) => (u.id === activeUser.id ? updatedUser : u)));
        setEditingTab(null);
      } else {
        toast.error((res as any).message || 'Failed to update employer details');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving changes');
    } finally {
      setSavingInline(false);
    }
  };

  const [inlineStaffForm, setInlineStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'Registrar' as Role,
    status: 'Active' as Status,
  });

  const startInlineEditStaff = (tabName: string, user: UserRow) => {
    setEditingTab(tabName);
    setInlineStaffForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || 'Registrar Office',
      role: user.role,
      status: user.status,
    });
  };

  const handleSaveInlineStaff = async () => {
    if (!activeUser) return;
    setSavingInline(true);
    try {
      const payload = {
        name: inlineStaffForm.name,
        email: inlineStaffForm.email,
        phone: inlineStaffForm.phone,
        department: inlineStaffForm.department,
        role: inlineStaffForm.role,
        status: inlineStaffForm.status,
      };
      const res = await adminService.updateUser(activeUser.id, payload);
      if (res.ok) {
        toast.success('Account details updated successfully');
        const updatedUser: UserRow = {
          ...activeUser,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          department: payload.department,
          role: payload.role,
          status: payload.status,
        };
        setActiveUser(updatedUser);
        setUsers((prev) => prev.map((u) => (u.id === activeUser.id ? updatedUser : u)));
        setEditingTab(null);

        // Sync with local storage user session if logged in as this user
        const storedUserStr = localStorage.getItem('user');
        if (storedUserStr) {
          try {
            const parsed = JSON.parse(storedUserStr);
            if (parsed.id === activeUser.id || parsed.email === activeUser.email || (parsed.role === 'REGISTRAR' && payload.role === 'Registrar')) {
              const nameParts = payload.name.trim().split(' ');
              const updatedAuthUser = {
                ...parsed,
                name: payload.name,
                fullName: payload.name,
                firstName: nameParts[0] || payload.name,
                lastName: nameParts.slice(1).join(' ') || '',
                email: payload.email,
              };
              localStorage.setItem('user', JSON.stringify(updatedAuthUser));
              window.dispatchEvent(new Event('astu-auth-changed'));
            }
          } catch (e) {}
        }
      } else {
        toast.error((res as any).message || 'Failed to update account details');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving changes');
    } finally {
      setSavingInline(false);
    }
  };

  const [isAdvancedFilterModalOpen, setIsAdvancedFilterModalOpen] = useState(false);
  const [activeFilterPortalTab, setActiveFilterPortalTab] = useState<'ALUMNI' | 'EMPLOYER' | 'REGISTRAR' | 'DEPARTMENT' | 'CMS' | 'ADMIN'>('ALUMNI');
  const [advancedFilters, setAdvancedFilters] = useState({
    batchYear: 'All',
    verificationStatus: 'All',
    employmentStatus: 'All',
    degreeLevel: 'All',
    cgpaThreshold: 'All',
    tracerSurvey: 'All',
    workExperience: 'All',
    residenceRegion: 'All',
    industrySector: 'All',
    companySize: 'All',
    hrVerified: 'All',
    activeJobPosts: 'All',
    internshipOffer: 'All',
    mouStatus: 'All',
    jobActivity: 'All',
    securityLevel: 'All',
    clearanceScope: 'All',
    clearanceDuty: 'All',
    auditLogStatus: 'All',
    recordSyncState: 'All',
    facultyScope: 'All',
    supervisoryLevel: 'All',
    academicRank: 'All',
    researchScope: 'All',
    approvalAuthority: 'All',
    cmsRoleScope: 'All',
    publishingRights: 'All',
    publishingAuthority: 'All',
    mediaLicense: 'All',
    adminPrivilege: 'All',
    hasTwoFactor: 'All',
    securityAudit: 'All',
    securityAlert: 'All',
  });

  type ImportLog = {
    id: string;
    syncedAt: string;
    recordsCount: number;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    errors?: string | null;
  };

  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [isImportHistoryOpen, setIsImportHistoryOpen] = useState(false);
  const [loadingImportLogs, setLoadingImportLogs] = useState(false);

  const [adminNotesInput, setAdminNotesInput] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [notesSuccessMsg, setNotesSuccessMsg] = useState<boolean>(false);

  useEffect(() => {
    if (activeUser) {
      setAdminNotesInput(activeUser.adminNotes || '');
      setNotesSuccessMsg(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUser?.id]);

  const handleSaveAdminNotes = async () => {
    if (!activeUser) return;
    setIsSavingNotes(true);
    setNotesSuccessMsg(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${activeUser.id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ notes: adminNotesInput }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedNotes = data.data?.adminNotes ?? adminNotesInput;
        setActiveUser((prev) => (prev ? { ...prev, adminNotes: updatedNotes } : null));
        setUsers((prevList) =>
          prevList.map((u) => (u.id === activeUser.id ? { ...u, adminNotes: updatedNotes } : u))
        );
        setNotesSuccessMsg(true);
        setTimeout(() => setNotesSuccessMsg(false), 3000);
      } else {
        alert(data.message || 'Failed to save administrative notes');
      }
    } catch (error: any) {
      console.error('Error saving admin notes:', error);
      alert('Network error while saving administrative notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const fetchImportLogs = useCallback(async () => {
    try {
      setLoadingImportLogs(true);
      const { adminService } = await import('../services/admin.service');
      const res = await adminService.getSyncLogs();
      if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setImportLogs(res.data as ImportLog[]);
      }
    } catch {
      // silent
    } finally {
      setLoadingImportLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchImportLogs();
  }, [fetchImportLogs]);

  useEffect(() => {
    let isMounted = true;
    import('../services/admin.service').then(({ adminService }) => {
      adminService.getDepartments().then((res) => {
        if (res.ok && res.data) {
          const depts = Array.isArray(res.data) ? res.data : (res.data.departments || []);
          if (depts.length > 0 && isMounted) {
            setDbDepartments(depts);
          }
        }
      });
    });
    return () => { isMounted = false; };
  }, []);

  const departmentList = useMemo(() => {
    if (dbDepartments.length > 0) {
      return dbDepartments.map((d) => d.name);
    }
    return [
      'Computer Science',
      'Software Engineering',
      'Electrical and Computer Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Applied Geology',
    ];
  }, [dbDepartments]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { adminService } = await import('../services/admin.service');
      const [response] = await Promise.all([
        adminService.getUsers({
          page,
          limit: pageSize,
          query: query || undefined,
          role: selectedRole === 'All Roles' ? undefined : selectedRole,
          status: selectedStatus === 'All' ? undefined : selectedStatus,
          department: selectedDepartment === 'All Departments' ? undefined : selectedDepartment,
        }),
        new Promise((resolve) => setTimeout(resolve, 300))
      ]);
      
      if (response.ok && Array.isArray(response.data?.users)) {
        const freshUsers = response.data.users as UserRow[];
        setUsers(freshUsers);
        setTotalCount(response.data.totalCount ?? 0);
        setTotalPages(response.data.totalPages ?? 0);
        if (response.data.stats) {
          setGlobalStats(response.data.stats);
        }
        setActiveUser(prev => {
          if (!prev) return null;
          const matched = freshUsers.find(u => u.id === prev.id || u.email === prev.email);
          return matched || prev;
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, query, selectedRole, selectedStatus, selectedDepartment]);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');
    if (roleParam) {
      const r = roleParam.toUpperCase();
      if (r === 'EMPLOYER') setSelectedRole('Employer');
      else if (r === 'ALUMNI') setSelectedRole('Alumni');
      else if (r === 'ADMIN') setSelectedRole('Admin');
      else if (r === 'REGISTRAR') setSelectedRole('Registrar');
    }
    if (statusParam) {
      const s = statusParam.toUpperCase();
      if (s === 'PENDING' || s === 'PENDING VERIFICATION') setSelectedStatus('Pending Verification');
      else if (s === 'ACTIVE') setSelectedStatus('Active');
      else if (s === 'INACTIVE') setSelectedStatus('Inactive');
      else if (s === 'SUSPENDED') setSelectedStatus('Suspended');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedRole, selectedStatus, selectedDepartment, dateFrom, dateTo, advancedFilters]);

  useEffect(() => {
    const handleClick = () => setMenuUserId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const totalUsersLabel = `${globalStats.total} users`;
  const activeCount = globalStats.active;
  const pendingCount = globalStats.pending;
  const suspendedCount = globalStats.suspended;
  const inactiveCount = globalStats.inactive;

  const advancedFilterCount = useMemo(() => {
    return Object.values(advancedFilters).filter((v) => v !== 'All').length;
  }, [advancedFilters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query) count++;
    if (selectedRole !== 'All Roles') count++;
    if (selectedStatus !== 'All') count++;
    if (selectedDepartment !== 'All Departments') count++;
    if (dateFrom || dateTo) count++;
    count += advancedFilterCount;
    return count;
  }, [query, selectedRole, selectedStatus, selectedDepartment, dateFrom, dateTo, advancedFilterCount]);

  const hasActiveFilters = activeFilterCount > 0;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (query) {
        const q = query.toLowerCase().trim();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchStudentId = (u.studentId || '').toLowerCase().includes(q);
        const matchDept = (u.department || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchStudentId && !matchDept) return false;
      }
      if (selectedRole !== 'All Roles' && u.role !== selectedRole) return false;
      if (selectedStatus !== 'All' && u.status !== selectedStatus) return false;
      if (selectedDepartment !== 'All Departments' && u.department !== selectedDepartment) return false;

      if (advancedFilters.batchYear !== 'All' && u.batch !== advancedFilters.batchYear) {
        return false;
      }
      if (advancedFilters.verificationStatus !== 'All') {
        if (advancedFilters.verificationStatus === 'Verified Alumni' && u.status !== 'Active') return false;
        if (advancedFilters.verificationStatus === 'Pending Identity Check' && u.status !== 'Pending Verification') return false;
      }
      if (advancedFilters.facultyScope !== 'All') {
        if (advancedFilters.facultyScope === 'School of Computing & IT' && !['Software Engineering', 'Computer Science', 'Information Engineering'].includes(u.department)) return false;
        if (advancedFilters.facultyScope === 'School of Electrical Eng.' && u.department !== 'Electrical Engineering') return false;
      }
      return true;
    });
  }, [users, query, selectedRole, selectedStatus, selectedDepartment, advancedFilters]);

  const paginatedUsers = filteredUsers;
  const allPageSelected = paginatedUsers.length > 0 && paginatedUsers.every((user) => selectedIds.includes(user.id));

  const resetFilters = () => {
    setQuery('');
    setSelectedRole('All Roles');
    setSelectedStatus('All');
    setSelectedDepartment('All Departments');
    setDateFrom('');
    setDateTo('');
    setAdvancedFilters({
      batchYear: 'All',
      verificationStatus: 'All',
      employmentStatus: 'All',
      degreeLevel: 'All',
      cgpaThreshold: 'All',
      tracerSurvey: 'All',
      workExperience: 'All',
      residenceRegion: 'All',
      industrySector: 'All',
      companySize: 'All',
      hrVerified: 'All',
      activeJobPosts: 'All',
      internshipOffer: 'All',
      mouStatus: 'All',
      jobActivity: 'All',
      securityLevel: 'All',
      clearanceScope: 'All',
      clearanceDuty: 'All',
      auditLogStatus: 'All',
      recordSyncState: 'All',
      facultyScope: 'All',
      supervisoryLevel: 'All',
      academicRank: 'All',
      researchScope: 'All',
      approvalAuthority: 'All',
      cmsRoleScope: 'All',
      publishingRights: 'All',
      publishingAuthority: 'All',
      mediaLicense: 'All',
      adminPrivilege: 'All',
      hasTwoFactor: 'All',
      securityAudit: 'All',
      securityAlert: 'All',
    });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const updateSelectedIds = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAllPage = () => {
    if (allPageSelected) {
      updateSelectedIds(selectedIds.filter((id) => !paginatedUsers.some((user) => user.id === id)));
      return;
    }

    const pageIds = paginatedUsers.map((user) => user.id);
    updateSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
  };

  // Advanced Multi-Portal Professional Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [allExportUsers, setAllExportUsers] = useState<UserRow[]>([]);
  const [activePortalTab, setActivePortalTab] = useState<'ALL' | 'ALUMNI' | 'REGISTRAR' | 'DEPARTMENT' | 'EMPLOYER' | 'CMS' | 'ADMIN'>('ALL');

  const handleOpenExportModal = useCallback(() => {
    setIsExportLoading(true);
    setAllExportUsers([]);
    setIsExportModalOpen(true);
  }, []);

  useEffect(() => {
    if (!isExportModalOpen) return;
    let isMounted = true;
    setIsExportLoading(true);
    import('../services/admin.service').then(({ adminService }) => {
      adminService.getUsers({ page: 1, limit: 10000 }).then((res) => {
        if (res.ok && isMounted && Array.isArray(res.data.users)) {
          setAllExportUsers(res.data.users as UserRow[]);
        }
        if (isMounted) setIsExportLoading(false);
      }).catch(() => {
        if (isMounted) setIsExportLoading(false);
      });
    });
    return () => { isMounted = false; };
  }, [isExportModalOpen]);
  const [exportFilters, setExportFilters] = useState({
    search: '',
    role: 'All Roles',
    status: 'All',
    department: 'All Departments',
    batchYear: 'All',
    verification: 'All',
    dateRange: 'All',
    industry: 'All',
    lastLogin: 'All',
    source: 'All'
  });

  const PORTAL_COLUMN_MAP: Record<string, string[]> = {
    ALL: ['name', 'email', 'studentId', 'role', 'portal', 'department', 'batch', 'status', 'verificationStatus', 'phone', 'organization', 'industry', 'securityLevel', 'registeredAt', 'lastLogin', 'source'],
    ALUMNI: ['name', 'email', 'studentId', 'department', 'batch', 'verificationStatus', 'industry', 'phone', 'status', 'registeredAt', 'lastLogin'],
    REGISTRAR: ['name', 'email', 'studentId', 'department', 'verificationStatus', 'securityLevel', 'source', 'status', 'phone', 'registeredAt', 'lastLogin'],
    DEPARTMENT: ['name', 'email', 'studentId', 'department', 'securityLevel', 'status', 'verificationStatus', 'phone', 'registeredAt', 'lastLogin'],
    EMPLOYER: ['name', 'email', 'organization', 'industry', 'securityLevel', 'status', 'verificationStatus', 'phone', 'registeredAt', 'lastLogin'],
    CMS: ['name', 'email', 'role', 'department', 'phone', 'status', 'registeredAt', 'lastLogin', 'source'],
    ADMIN: ['name', 'email', 'studentId', 'role', 'portal', 'securityLevel', 'status', 'registeredAt', 'lastLogin', 'source'],
  };

  const DEFAULT_USER_EXPORT_COLUMNS = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'studentId', label: 'Student ID / Staff Code' },
    { key: 'role', label: 'System Role' },
    { key: 'portal', label: 'Portal Access Scope' },
    { key: 'department', label: 'Department / Division' },
    { key: 'batch', label: 'Batch / Year' },
    { key: 'status', label: 'Account Status' },
    { key: 'verificationStatus', label: 'Verification Status' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'organization', label: 'Organization / Company' },
    { key: 'industry', label: 'Industry Sector' },
    { key: 'securityLevel', label: 'Security Role Level' },
    { key: 'registeredAt', label: 'Date Registered' },
    { key: 'lastLogin', label: 'Last Login' },
    { key: 'source', label: 'Data Origin / Source' }
  ];

  const [exportColumns, setExportColumns] = useState<Record<string, boolean>>({
    name: true,
    email: true,
    studentId: true,
    role: true,
    portal: true,
    department: true,
    batch: true,
    status: true,
    verificationStatus: true,
    phone: true,
    organization: true,
    industry: true,
    securityLevel: true,
    registeredAt: true,
    lastLogin: true,
    source: true
  });

  const [columnSequence, setColumnSequence] = useState(DEFAULT_USER_EXPORT_COLUMNS);

  useEffect(() => {
    if (!isExportModalOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isExportModalOpen]);

  const moveColumnSequence = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columnSequence.length) return;
    const updated = [...columnSequence];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setColumnSequence(updated);
  };

  const resetColumnSequence = () => {
    const allowedKeys = PORTAL_COLUMN_MAP[activePortalTab] || PORTAL_COLUMN_MAP.ALL;
    setColumnSequence(DEFAULT_USER_EXPORT_COLUMNS.filter(col => allowedKeys.includes(col.key)));
  };

  const toggleAllExportColumns = (enable: boolean) => {
    const allowedKeys = PORTAL_COLUMN_MAP[activePortalTab] || PORTAL_COLUMN_MAP.ALL;
    const updated: Record<string, boolean> = { ...exportColumns };
    allowedKeys.forEach(key => {
      updated[key] = enable;
    });
    setExportColumns(updated);
  };

  const handlePortalPresetChange = (tab: 'ALL' | 'ALUMNI' | 'REGISTRAR' | 'DEPARTMENT' | 'EMPLOYER' | 'CMS' | 'ADMIN') => {
    setActivePortalTab(tab);
    if (tab === 'ALL') setExportFilters(prev => ({ ...prev, role: 'All Roles' }));
    else if (tab === 'ALUMNI') setExportFilters(prev => ({ ...prev, role: 'Alumni' }));
    else if (tab === 'REGISTRAR') setExportFilters(prev => ({ ...prev, role: 'Registrar' }));
    else if (tab === 'DEPARTMENT') setExportFilters(prev => ({ ...prev, role: 'DepartmentHead' }));
    else if (tab === 'EMPLOYER') setExportFilters(prev => ({ ...prev, role: 'Employer' }));
    else if (tab === 'CMS') setExportFilters(prev => ({ ...prev, role: 'CMS Manager' }));
    else if (tab === 'ADMIN') setExportFilters(prev => ({ ...prev, role: 'Admin' }));

    const allowedKeys = PORTAL_COLUMN_MAP[tab] || PORTAL_COLUMN_MAP.ALL;
    const portalCols = DEFAULT_USER_EXPORT_COLUMNS.filter(col => allowedKeys.includes(col.key));
    setColumnSequence(portalCols);

    const updatedCheckmarks: Record<string, boolean> = {};
    allowedKeys.forEach(key => {
      updatedCheckmarks[key] = true;
    });
    setExportColumns(updatedCheckmarks);
  };

  const resetExportFilters = () => {
    setActivePortalTab('ALL');
    setExportFilters({
      search: '',
      role: 'All Roles',
      status: 'All',
      department: 'All Departments',
      batchYear: 'All',
      verification: 'All',
      dateRange: 'All',
      industry: 'All',
      lastLogin: 'All',
      source: 'All'
    });
  };

  const exportMatchedUsers = useMemo(() => {
    return allExportUsers.filter(user => {
      const matchSearch = !exportFilters.search ||
        `${user.name} ${user.email} ${user.studentId} ${user.department}`.toLowerCase().includes(exportFilters.search.toLowerCase());

      let matchRole = true;
      if (activePortalTab === 'ALUMNI') matchRole = user.role === 'Alumni';
      else if (activePortalTab === 'REGISTRAR') matchRole = user.role === 'Registrar' || user.role === 'RegistrarStaff';
      else if (activePortalTab === 'DEPARTMENT') matchRole = user.role === 'Department Head' || user.role === 'DepartmentHead' || user.role === 'Faculty';
      else if (activePortalTab === 'EMPLOYER') matchRole = user.role === 'Employer';
      else if (activePortalTab === 'CMS') matchRole = user.role === 'CMS Manager';
      else if (activePortalTab === 'ADMIN') matchRole = user.role === 'SuperAdmin' || user.role === 'Admin';
      else if (exportFilters.role !== 'All Roles') matchRole = user.role === exportFilters.role;

      const matchStatus = exportFilters.status === 'All' || user.status === exportFilters.status;
      const matchDept = exportFilters.department === 'All Departments' || user.department === exportFilters.department;
      const matchBatch = exportFilters.batchYear === 'All' || String(user.batch) === exportFilters.batchYear;
      const matchVerif = exportFilters.verification === 'All' ||
        (exportFilters.verification === 'Verified' && user.status === 'Active') ||
        (exportFilters.verification === 'Unverified' && user.status !== 'Active');

      let matchDate = true;
      if (exportFilters.dateRange !== 'All' && user.registeredAt) {
        const createdTime = new Date(user.registeredAt).getTime();
        const now = Date.now();
        if (exportFilters.dateRange === '30d') matchDate = (now - createdTime) <= 30 * 86400000;
        else if (exportFilters.dateRange === '90d') matchDate = (now - createdTime) <= 90 * 86400000;
        else if (exportFilters.dateRange === 'this_year') matchDate = new Date(user.registeredAt).getFullYear() === new Date().getFullYear();
      }

      let matchIndustry = true;
      if (exportFilters.industry !== 'All') {
        const ind = exportFilters.industry.toLowerCase();
        const userDept = (user.department || '').toLowerCase();
        matchIndustry = userDept.includes(ind) || (user.role === 'Employer' && ind.includes('technology'));
      }

      let matchSource = true;
      if (exportFilters.source !== 'All') {
        if (exportFilters.source === 'Admin') matchSource = user.role === 'Admin' || user.role === 'SuperAdmin' || !user.studentId;
        else if (exportFilters.source === 'SelfReg') matchSource = user.role === 'Alumni';
        else if (exportFilters.source === 'SIS') matchSource = !!(user.studentId && user.studentId.startsWith('ASTU'));
      }

      return matchSearch && matchRole && matchStatus && matchDept && matchBatch && matchVerif && matchDate && matchIndustry && matchSource;
    });
  }, [allExportUsers, exportFilters, activePortalTab]);

  const portalMetrics = useMemo(() => {
    return {
      all: allExportUsers.length,
      Alumni: allExportUsers.filter(u => u.role === 'Alumni').length,
      Registrar: allExportUsers.filter(u => u.role === 'Registrar' || u.role === 'RegistrarStaff').length,
      DepartmentHead: allExportUsers.filter(u => u.role === 'Department Head' || u.role === 'DepartmentHead' || u.role === 'Faculty').length,
      Employer: allExportUsers.filter(u => u.role === 'Employer').length,
      CmsManager: allExportUsers.filter(u => u.role === 'CMS Manager').length,
      SuperAdmin: allExportUsers.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin').length,
    };
  }, [allExportUsers]);

  const getDerivedColumnValue = (u: UserRow, colKey: string): string => {
    if (colKey === 'portal') {
      if (u.role === 'Alumni') return 'Alumni Portal';
      if (u.role === 'Registrar' || u.role === 'RegistrarStaff') return 'Registrar & SIS Hub';
      if (u.role === 'Department Head' || u.role === 'DepartmentHead' || u.role === 'Faculty') return 'Department & Faculty Portal';
      if (u.role === 'Employer') return 'Employer & Corporate Network';
      if (u.role === 'SuperAdmin' || u.role === 'Admin') return 'Super Admin Control Center';
      return 'ASTU System Directory';
    }
    if (colKey === 'verificationStatus') {
      return u.status === 'Active' ? 'VERIFIED' : 'UNVERIFIED';
    }
    if (colKey === 'organization') {
      if (u.role === 'Employer') return u.department || 'Corporate Partner Firm';
      if (u.role === 'Registrar' || u.role === 'RegistrarStaff') return 'ASTU Registrar Office';
      if (u.role === 'Department Head' || u.role === 'DepartmentHead' || u.role === 'Faculty') return u.department || 'Academic Faculty';
      if (u.role === 'SuperAdmin' || u.role === 'Admin') return 'ASTU System Control Office';
      return u.department || 'ASTU University';
    }
    if (colKey === 'industry') {
      if (u.role === 'Employer') return 'Technology & Industry';
      if (u.role === 'Alumni') return 'Alumni Network & Careers';
      if (u.role === 'Department Head' || u.role === 'DepartmentHead' || u.role === 'Faculty') return 'Higher Education';
      if (u.role === 'Registrar' || u.role === 'RegistrarStaff') return 'Academic Administration';
      return 'System Administration';
    }
    if (colKey === 'securityLevel') {
      if (u.role === 'SuperAdmin' || u.role === 'Admin') return 'Super Administrator (Level 5)';
      if (u.role === 'Registrar' || u.role === 'RegistrarStaff') return 'Registrar Officer (Level 4)';
      if (u.role === 'Department Head' || u.role === 'DepartmentHead') return 'Department Chair (Level 3)';
      if (u.role === 'Employer') return 'Corporate Recruiter (Level 2)';
      return 'Standard User (Level 1)';
    }
    if (colKey === 'source') {
      return (u.studentId && u.studentId.startsWith('UG/')) ? 'Registrar SIS Sync' : 'System Provisioning';
    }
    let val: any = (u as any)[colKey];
    if (val === null || val === undefined) val = '';
    return String(val);
  };

  const executeExportCSV = async () => {
    const { default: toast } = await import('react-hot-toast');
    toast.loading('Generating multi-portal CSV export...', { id: 'admin-export-toast' });

    const allMatchedRows = exportMatchedUsers;
    if (allMatchedRows.length === 0) {
      toast.error('No system users match your selected export criteria.', { id: 'admin-export-toast' });
      return;
    }

    const activeCols = columnSequence.filter(col => exportColumns[col.key]);
    if (activeCols.length === 0) {
      toast.error('Please select at least one column to export.', { id: 'admin-export-toast' });
      return;
    }

    const headers = activeCols.map(col => `"${col.label}"`).join(',');

    const csvRows = allMatchedRows.map(u => {
      return activeCols.map(col => {
        const val = getDerivedColumnValue(u, col.key);
        const cleanStr = String(val).replace(/"/g, '""');
        return `"${cleanStr}"`;
      }).join(',');
    });

    const csvString = '\uFEFF' + [headers, ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateTag = new Date().toISOString().slice(0, 10);
    const portalTag = activePortalTab !== 'ALL' ? `${activePortalTab}_` : '';
    link.download = `ASTU_System_MultiPortal_Export_${portalTag}${dateTag}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${allMatchedRows.length} users across ${activePortalTab === 'ALL' ? '5 Portals' : activePortalTab + ' Portal'} to CSV!`, { id: 'admin-export-toast' });
    setIsExportModalOpen(false);
  };

  const executeExportJSON = async () => {
    const { default: toast } = await import('react-hot-toast');
    toast.loading('Generating JSON roster dump...', { id: 'admin-export-toast' });

    const allMatchedRows = exportMatchedUsers;
    if (allMatchedRows.length === 0) {
      toast.error('No records match your filters.', { id: 'admin-export-toast' });
      return;
    }

    const activeCols = columnSequence.filter(col => exportColumns[col.key]);
    const jsonData = allMatchedRows.map(u => {
      const rowObj: Record<string, string> = {};
      activeCols.forEach(col => {
        rowObj[col.key] = getDerivedColumnValue(u, col.key);
      });
      return rowObj;
    });

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASTU_System_Directory_${activePortalTab}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${allMatchedRows.length} users to JSON file!`, { id: 'admin-export-toast' });
    setIsExportModalOpen(false);
  };

  const executeCopySummary = async () => {
    const { default: toast } = await import('react-hot-toast');
    const allMatchedRows = exportMatchedUsers;
    if (allMatchedRows.length === 0) {
      toast.error('No records to copy.', { id: 'admin-export-toast' });
      return;
    }

    const summaryText = [
      `ASTU SYSTEM DIRECTORY SUMMARY (${activePortalTab} PORTAL)`,
      `Export Date: ${new Date().toLocaleString()}`,
      `Total Matched Records: ${allMatchedRows.length}`,
      `--------------------------------------------------`,
      ...allMatchedRows.slice(0, 50).map((u, i) => `${i + 1}. ${u.name} | ${u.role} | ${u.email} | ${u.status}`)
    ].join('\n');

    await navigator.clipboard.writeText(summaryText);
    toast.success(`Copied ${allMatchedRows.length} roster summary lines to clipboard!`);
  };

  const openAddModal = () => {
    setEditingUserId(null);
    setForm(createDefaultForm());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (user: UserRow) => {
    setEditingUserId(user.id);
    setForm({
      name: user.companyName || user.name,
      email: user.contactEmail || user.email,
      password: '',
      autoGeneratePassword: true,
      role: user.role,
      department: user.department || 'Software Engineering',
      studentId: user.studentId || '',
      phone: user.phone || user.hrContact || '',
      status: user.status,
      isVerified: user.status === 'Active',
      graduationYear: user.batch !== 'N/A' ? user.batch : String(new Date().getFullYear()),
      cgpa: user.cgpa ? String(user.cgpa) : '3.50',
      dateOfBirth: user.dateOfBirth || '2001-05-15',
      nationality: user.nationality || 'Ethiopian',
      gender: user.gender || 'Male',
      industry: user.industry || '',
      location: user.location || user.workLocation || '',
      hrContact: user.hrContact || user.name,
      cmsScope: 'All Portal & News Content',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!form.name.trim()) errors.name = 'Full name / Organization name is required.';

    if (form.role === 'Alumni') {
      if (!form.studentId.trim()) errors.studentId = 'Student ID is required for alumni.';
      if (!form.department.trim()) errors.department = 'Department is required.';
      if (!form.graduationYear.trim()) errors.graduationYear = 'Graduation batch / year is required.';
      if (!form.cgpa.trim() || isNaN(parseFloat(form.cgpa))) errors.cgpa = 'Valid CGPA is required.';
    } else {
      if (!form.email.trim()) errors.email = 'Email address is required.';
    }

    if (!form.autoGeneratePassword && !form.password.trim() && !editingUserId) {
      errors.password = 'Password is required when not auto-generated.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveUser = async () => {
    if (!validateForm() || submitting) return;

    setSubmitting(true);
    try {
      const { adminService } = await import('../services/admin.service');
      const { default: toast } = await import('react-hot-toast');

      if (editingUserId) {
        const payload: Record<string, any> = {
          name: form.name.trim(),
          email: form.email.trim(),
          status: form.status,
          role: form.role,
          phone: form.phone.trim() || undefined,
          studentId: form.studentId.trim() || undefined,
          department: form.department || undefined,
          graduationYear: form.graduationYear || undefined,
          cgpa: form.cgpa || undefined,
          industry: form.industry.trim() || undefined,
          location: form.location.trim() || undefined,
          hrContact: form.hrContact.trim() || undefined,
        };

        const result = await adminService.updateUser(editingUserId, payload);
        if (result.ok) {
          toast.success('User profile updated successfully');
        } else {
          toast.error(result.message || 'Failed to update user');
          return;
        }
      } else {
        const password = form.password.trim() || generatePassword();
        const payload: Record<string, any> = {
          name: form.name.trim(),
          email: form.email.trim() ? form.email.trim().toLowerCase() : `${form.studentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@alumni.astu.edu.et`,
          role: form.role,
          password: password,
          phone: form.phone.trim() || undefined,
          status: form.status,
          isVerified: form.isVerified,
        };

        if (form.role === 'Alumni') {
          payload.studentId = form.studentId.trim();
          payload.department = form.department;
          payload.graduationYear = form.graduationYear.trim();
          payload.cgpa = form.cgpa.trim();
          payload.dateOfBirth = form.dateOfBirth;
          payload.nationality = form.nationality.trim() || 'Ethiopian';
          payload.gender = form.gender;
        } else if (form.role === 'Employer') {
          payload.industry = form.industry;
          payload.location = form.location;
          payload.hrContact = form.hrContact || form.name;
        } else if (form.role === 'Department Head') {
          payload.department = form.department;
        } else if (form.role === 'CMS Manager') {
          payload.cmsScope = form.cmsScope;
        }

        const result = await adminService.createUser(payload);
        if (result.ok) {
          toast.success(`User provisioned successfully as ${form.role}`);
        } else {
          toast.error(result.message || 'Failed to create user');
          return;
        }
      }

      setModalOpen(false);
      setEditingUserId(null);
      await fetchUsers();
    } catch (error: any) {
      const { default: toast } = await import('react-hot-toast');
      toast.error(error?.message || 'An error occurred while saving user');
    } finally {
      setSubmitting(false);
    }
  };

  const bulkAction = async (action: 'activate' | 'suspend' | 'delete' | 'export') => {
    const selected = users.filter((user) => selectedIds.includes(user.id));

    if (action === 'export') {
      handleOpenExportModal();
      return;
    }

    const { adminService } = await import('../services/admin.service');
    const { default: toast } = await import('react-hot-toast');
    
    setLoading(true);
    let result;
    
    if (action === 'delete') {
      // For now we'll do delete sequentially or wait for backend support, wait, delete is single user only in our backend. Let's do it sequentially:
      for (const id of selectedIds) {
        await adminService.deleteUser(id);
      }
      toast.success('Deleted selected users');
    } else {
      const apiAction = action === 'activate' ? 'verify' : 'suspend'; // verify handles both active and verification
      result = await adminService.bulkUpdateStatus(selectedIds, apiAction);
      if (result.ok) {
        toast.success(`Successfully updated ${selectedIds.length} users`);
      } else {
        toast.error(result.message || 'Failed to update users');
      }
    }
    
    updateSelectedIds([]);
    await fetchUsers();
  };

  const handleRowAction = async (user: UserRow, action: string) => {
    const { adminService } = await import('../services/admin.service');
    const { default: toast } = await import('react-hot-toast');
    
    if (action === 'Suspend') {
      const isCurrentlyActive = user.status === 'Active';
      const apiAction = isCurrentlyActive ? 'suspend' : 'activate';
      const result = await adminService.updateUserStatus(user.id, apiAction);
      if (result.ok) {
        const nextStatus = isCurrentlyActive ? 'Suspended' : 'Active';
        toast.success(`User ${user.name} status updated to ${nextStatus}`);
        const updated = { ...user, status: nextStatus as Status };
        setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
        if (activeUser?.id === user.id) setActiveUser(updated);
        fetchUsers();
      } else {
        toast.error(result.message || 'Error updating user status');
      }
    } else if (action === 'Delete') {
      if (window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
        const result = await adminService.deleteUser(user.id);
        if (result.ok) {
          toast.success(`User ${user.name} deleted successfully`);
          setUsers(prev => prev.filter(u => u.id !== user.id));
          if (activeUser?.id === user.id) setActiveUser(null);
          fetchUsers();
        } else {
          toast.error(result.message || 'Error deleting user');
        }
      }
    } else if (action === 'Reset Password') {
      openResetPasswordModal(user);
    } else if (action === 'Change Role') {
      openChangeRoleModal(user);
    } else if (action === 'Edit Profile' || action === 'Edit') {
      openEditModal(user);
    } else if (action === 'View Profile') {
      setActiveUser(user);
    }
  };

  const getRowActions = (user: UserRow) => [
    { label: 'View Profile', icon: Eye, onClick: () => setActiveUser(user) },
    { label: 'Edit Profile', icon: PencilLine, onClick: () => openEditModal(user) },
    { label: 'Reset Password', icon: KeyRound, onClick: () => openResetPasswordModal(user) },
    { label: 'Change Role', icon: Shield, onClick: () => openChangeRoleModal(user) },
    { label: user.status === 'Active' ? 'Suspend Account' : 'Activate Account', icon: UserRound, onClick: () => handleRowAction(user, 'Suspend') },
    { label: 'Delete User', icon: Trash2, onClick: () => handleRowAction(user, 'Delete') },
  ];

  const totalCountNum = globalStats.total || totalCount || 45;
  const activePercentage = totalCountNum > 0 ? ((activeCount / totalCountNum) * 100).toFixed(1) : '0';
  const suspendedPercentage = totalCountNum > 0 ? ((suspendedCount / totalCountNum) * 100).toFixed(1) : '0';
  const pendingPercentage = totalCountNum > 0 ? ((pendingCount / totalCountNum) * 100).toFixed(1) : '0';
  const statsLine = `${totalCountNum} users — ${activeCount.toLocaleString()} Active · ${pendingCount} Pending · ${suspendedCount} Suspended · ${inactiveCount} Inactive`;

  const summaryCards = [
    {
      label: 'Total Users',
      value: totalCountNum.toLocaleString(),
      meta: 'Registered System Accounts',
      icon: Users,
      accent: '#003366',
      cardAccent: 'border-t-[#003366]',
      gradient: 'from-[#003366]/10 to-[#003366]/5',
    },
    {
      label: 'Active',
      value: activeCount.toLocaleString(),
      meta: `${activePercentage}% active rate`,
      icon: Check,
      accent: '#22C55E',
      cardAccent: 'border-t-[#22C55E]',
      gradient: 'from-[#22C55E]/10 to-[#22C55E]/5',
    },
    {
      label: 'Suspended',
      value: suspendedCount.toLocaleString(),
      meta: `${suspendedPercentage}% restriction rate`,
      icon: Shield,
      accent: '#DC2626',
      cardAccent: 'border-t-[#DC2626]',
      gradient: 'from-[#DC2626]/10 to-[#DC2626]/5',
    },
    {
      label: 'Pending',
      value: pendingCount.toLocaleString(),
      meta: `${pendingPercentage}% awaiting review`,
      icon: Clock3,
      accent: '#F97316',
      cardAccent: 'border-t-[#F97316]',
      gradient: 'from-[#F97316]/10 to-[#F97316]/5',
    },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
      <AdminPageHeader
        title="User Management"
        subtitle="Manage all system accounts, roles, and access permissions"
        breadcrumbs={isCms ? [{ label: 'Alumni Office' }, { label: 'Alumni Directory' }] : [{ label: 'Admin' }, { label: 'User Management' }]}
        actions={
          <>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-[#002866] px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#002866]" />
              <span>Add User</span>
            </button>
            <button
              type="button"
              onClick={handleOpenExportModal}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/40 px-4 py-2.5 text-sm font-semibold backdrop-blur-md shadow-xs transition-all cursor-pointer"
            >
              <Download className="h-4 w-4 text-white" />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      {/* Last CSV / SIS Import Info Banner */}
      {(() => {
        const latestLog = importLogs[0];
        const displayCount = latestLog ? latestLog.recordsCount : (totalCount || 45);
        const displayDate = latestLog && latestLog.syncedAt
          ? format(new Date(latestLog.syncedAt), 'MMMM d, yyyy')
          : 'May 15, 2026';
        const displayStatus = latestLog ? latestLog.status : 'SUCCESS';

        return (
          <div className="rounded-xl border border-emerald-300/60 border-l-[4px] border-l-emerald-600 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-950 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 font-medium flex-wrap">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
              <span>
                <strong>Last CSV import:</strong>{' '}
                <span className="font-extrabold text-emerald-900">{displayCount} records</span> ·{' '}
                <span>{displayDate}</span> ·{' '}
                <span className="text-emerald-800">by Registrar Office (SIS DB Sync)</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                displayStatus === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                displayStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {displayStatus}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                fetchImportLogs();
                setIsImportHistoryOpen(true);
              }}
              className="font-bold text-emerald-700 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto shrink-0"
            >
              <span>View Import History</span>
              <ChevronRight className="h-3.5 w-3.5 text-emerald-700" />
            </button>
          </div>
        );
      })()}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{card.label}</p>
                  <div className="mt-1 text-3xl font-black tracking-tight text-slate-900">{card.value}</div>
                  <p className="mt-1 text-xs font-bold truncate max-w-[180px]" style={{ color: card.accent }}>
                    {card.meta}
                  </p>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 shrink-0"
                  style={{ backgroundColor: `${card.accent}12`, color: card.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Master Unified Directory Card: Pure Pearl White & Royal Indigo Accent Panel */}
      <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-0 text-slate-900 transition-all">
        {/* Top Decorative Gradient Accent Bar & Shimmer Loading Indicator */}
        <div className="relative h-1 w-full overflow-hidden bg-slate-100">
          {(loading || isFiltering) ? (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 animate-[pulse_1s_infinite]" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-[#001F4D] via-indigo-600 to-sky-500" />
          )}
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-blue-50/60 blur-2xl pointer-events-none" />

        {/* Filter Engine Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 relative z-10 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#001F4D] to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-900/10 shrink-0">
              <Filter className={`h-4.5 w-4.5 text-sky-300 ${(loading || isFiltering) ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Directory Filter & Query Engine</h3>
                {(loading || isFiltering) ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs transition-all animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                    Filtering...
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                Filter system accounts by role, account status, academic division, or registration timeframe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdvancedFilterModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#001F4D] to-indigo-700 hover:from-indigo-900 hover:to-indigo-800 text-white border border-indigo-700/50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-900/10 hover:shadow-lg"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-300" />
              <span>Filter More {advancedFilterCount > 0 ? `(${advancedFilterCount})` : ''}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className={`h-3.5 w-3.5 text-indigo-600 ${(loading || isFiltering) ? 'animate-spin' : ''}`} />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="p-5 bg-slate-50/40 border-b border-slate-100 space-y-3.5 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
            {/* 1. Search Query */}
            <div className="lg:col-span-4 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">1. Search Query</label>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-indigo-500/70 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search by name, email, student ID..."
                  className="w-full pl-10 pr-9 py-2 bg-white text-slate-900 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold placeholder:text-slate-400 shadow-2xs transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Target Role */}
            <div className="lg:col-span-2 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">2. Portal Role</label>
              <div className="relative flex items-center">
                <UserCog className="absolute left-3.5 h-4 w-4 text-indigo-500/70 pointer-events-none" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role | 'All Roles')}
                  className="w-full pl-10 pr-8 py-2 bg-white text-slate-900 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold shadow-2xs transition-all appearance-none cursor-pointer"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 3. Status */}
            <div className="lg:col-span-2 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">3. Status</label>
              <div className="relative flex items-center">
                <Shield className="absolute left-3.5 h-4 w-4 text-indigo-500/70 pointer-events-none" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Status | 'All')}
                  className="w-full pl-10 pr-8 py-2 bg-white text-slate-900 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold shadow-2xs transition-all appearance-none cursor-pointer"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 4. Department */}
            <div className="lg:col-span-4 space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">4. Academic Division / Dept</label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-3.5 h-4 w-4 text-indigo-500/70 pointer-events-none shrink-0" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-white text-slate-900 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold shadow-2xs transition-all appearance-none cursor-pointer truncate"
                >
                  {['All Departments', ...departmentList].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none shrink-0" />
              </div>
            </div>

            {/* 5. Date Range (From & To) */}
            <div className="lg:col-span-12 space-y-1 pt-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">5. Registration Timeframe (Date Range)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <div className="relative flex items-center">
                  <CalendarDays className="absolute left-3 h-3.5 w-3.5 text-indigo-500/70 pointer-events-none" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white text-slate-900 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  />
                </div>
                <div className="relative flex items-center">
                  <CalendarDays className="absolute left-3 h-3.5 w-3.5 text-indigo-500/70 pointer-events-none" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white text-slate-900 border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">Active Criteria:</span>
              {query && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-slate-800 border border-slate-200 rounded-full text-xs font-semibold shadow-2xs">
                  <span>Query: "{query}"</span>
                  <button type="button" onClick={() => setQuery('')} className="hover:text-indigo-600 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedRole !== 'All Roles' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-slate-800 border border-slate-200 rounded-full text-xs font-semibold shadow-2xs">
                  <span>Role: {selectedRole}</span>
                  <button type="button" onClick={() => setSelectedRole('All Roles')} className="hover:text-indigo-600 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedStatus !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-slate-800 border border-slate-200 rounded-full text-xs font-semibold shadow-2xs">
                  <span>Status: {selectedStatus}</span>
                  <button type="button" onClick={() => setSelectedStatus('All')} className="hover:text-indigo-600 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedDepartment !== 'All Departments' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-slate-800 border border-slate-200 rounded-full text-xs font-semibold shadow-2xs">
                  <span>Dept: {selectedDepartment}</span>
                  <button type="button" onClick={() => setSelectedDepartment('All Departments')} className="hover:text-indigo-600 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-slate-800 border border-slate-200 rounded-full text-xs font-semibold shadow-2xs">
                  <span>Dates: {dateFrom || '...'} to {dateTo || '...'}</span>
                  <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); }} className="hover:text-indigo-600 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Directory Sub-Header Bar (Counts & Pagination Range) */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-slate-50 via-slate-50/90 to-indigo-50/30 flex items-center justify-between flex-wrap gap-2.5 text-xs relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-[#001F4D] text-white font-extrabold text-[10px] uppercase tracking-wider shadow-2xs">
              USER ROSTER
            </span>
            <span className="font-extrabold text-slate-900 text-xs">
              {totalCountNum.toLocaleString()} Total Accounts
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[11px] shadow-2xs">
                {activeCount.toLocaleString()} Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-[11px] shadow-2xs">
                {pendingCount.toLocaleString()} Pending
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200 font-bold text-[11px] shadow-2xs">
                {(inactiveCount + suspendedCount).toLocaleString()} Inactive
              </span>
            </div>
          </div>

          <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold shadow-2xs">
            Showing <strong className="text-slate-900 font-extrabold">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}</strong> of{' '}
            <strong className="text-slate-900 font-extrabold">{totalCount}</strong> users
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/80 px-6 py-3 border-b border-blue-200">
            <div className="text-xs font-bold text-blue-900">{selectedIds.length} accounts selected</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => bulkAction('activate')} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs">
                Activate Selected
              </button>
              <button type="button" onClick={() => bulkAction('suspend')} className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs">
                Suspend Selected
              </button>
              <button type="button" onClick={() => bulkAction('export')} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold shadow-2xs flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                Export Selected
              </button>
              <button type="button" onClick={() => bulkAction('delete')} className="rounded-lg border border-rose-300 bg-white hover:bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="admin-card overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-12 border-b border-slate-200 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={selectAllPage}
                    className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                    aria-label="Select all rows on page"
                  />
                </th>
                {[
                  { key: 'name', label: 'User', sortable: true, width: 'min-w-[280px]' },
                  { key: 'studentId', label: 'Student ID', sortable: true },
                  { key: 'role', label: 'Role', sortable: true },
                  { key: 'department', label: 'Department', sortable: true },
                  { key: 'batch', label: 'Batch / Year', sortable: true },
                  { key: 'status', label: 'Status', sortable: true },
                  { key: 'lastLogin', label: 'Last Login', sortable: true },
                  { key: 'actions', label: 'Actions', sortable: false },
                ].map((column) => (
                  <th
                    key={column.key}
                    className={`border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 ${column.width ?? ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => column.sortable && toggleSort(column.key as SortKey)}
                      className="inline-flex items-center gap-1.5"
                      disabled={!column.sortable}
                    >
                      {column.label}
                      {column.sortable && <ArrowDownUp className="h-3.5 w-3.5" />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(loading || isFiltering) ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-row-${idx}`} className="border-b border-slate-100 animate-pulse">
                    <td className="px-4 py-4 align-middle">
                      <div className="h-4 w-4 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 w-32 rounded bg-slate-200" />
                          <div className="h-3 w-44 rounded bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4 align-middle"><div className="h-6 w-20 rounded-full bg-slate-200" /></td>
                    <td className="px-4 py-4 align-middle"><div className="h-4 w-36 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4 align-middle"><div className="h-4 w-12 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4 align-middle"><div className="h-6 w-16 rounded-full bg-slate-200" /></td>
                    <td className="px-4 py-4 align-middle"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4 align-middle"><div className="h-8 w-8 rounded-lg bg-slate-100" /></td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-700">No users found</p>
                        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">Try adjusting your search or filter criteria to find what you are looking for.</p>
                      </div>
                      <button type="button" onClick={resetFilters} className="mt-2 rounded-[8px] bg-[#003580] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 transition-all">
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`cursor-pointer border-b border-slate-100 transition-all hover:bg-slate-50/80 ${
                    activeUser?.id === user.id ? 'bg-[#003580]/5 shadow-inner' : ''
                  } ${isFiltering ? 'opacity-60 animate-pulse' : ''}`}
                  onClick={() => setActiveUser(user)}
                >
                  <td className="px-4 py-4 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={(event) => {
                        event.stopPropagation();
                        toggleRow(user.id);
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="h-4 w-4 rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                      aria-label={`Select ${user.name}`}
                    />
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const avatar = getUserAvatarUrl(user);
                        return (
                          <div className="relative h-11 w-11 shrink-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003580]/10 text-sm font-semibold text-[#003580]">
                              {initials(user.name)}
                            </div>
                            {avatar && (
                              <img
                                src={avatar}
                                alt={user.name}
                                className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-2xs absolute inset-0 z-10"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        );
                      })()}
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-slate-600">{user.studentId || 'N/A'}</td>
                  <td className="px-4 py-4 align-top">
                    <AdminBadge variant={roleTone[user.role]} className={roleColorClass[user.role]}>
                      {user.role}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600">{user.department}</td>
                  <td className="px-4 py-4 align-top text-slate-600">{user.batch}</td>
                  <td className="px-4 py-4 align-top">
                    <AdminBadge variant={statusTone[user.status]} className={statusColorClass[user.status]}>
                      {user.status}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-600">{formatRelative(user.lastLogin)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="relative" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setMenuUserId((current) => (current === user.id ? null : user.id))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-slate-500 hover:bg-slate-100"
                        aria-label={`Open actions for ${user.name}`}
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </button>

                      {menuUserId === user.id && (
                        <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                          {getRowActions(user).map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.label}
                                type="button"
                                onClick={() => {
                                  setMenuUserId(null);
                                  action.onClick();
                                }}
                                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                                  action.label.includes('Delete')
                                    ? 'text-[#E24B4A] hover:bg-rose-50 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginatedUsers.length} of {totalCount} filtered users
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <div className="rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
              Page {page} of {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <AdminModal
        open={modalOpen}
        title={editingUserId ? 'Edit User Profile' : 'Provision New System User'}
        onClose={() => setModalOpen(false)}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 font-medium border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Target Role: <strong className="text-[#003580] font-bold">{form.role}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all active:scale-98"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={saveUser}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#002866] to-[#003580] px-5 py-2 text-xs font-bold text-white hover:from-[#001e4d] hover:to-[#002866] transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>{editingUserId ? 'Saving Changes...' : 'Provisioning Account...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{editingUserId ? 'Save Changes' : 'Create User Account'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Role Selection Cards */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2.5">
              Select User Role & Account Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {([
                { role: 'Alumni', desc: 'Graduates', icon: GraduationCap },
                { role: 'Employer', desc: 'Partners', icon: Building2 },
                { role: 'Registrar', desc: 'Records', icon: BookOpen },
                { role: 'Department Head', desc: 'Faculty', icon: Users },
                { role: 'CMS Manager', desc: 'Media & News', icon: Newspaper },
                { role: 'Super Admin', desc: 'Root Executive', icon: ShieldCheck },
                { role: 'Admin', desc: 'ICT Specialist', icon: Shield },
              ] as const).map(({ role: r, desc, icon: RoleIcon }) => {
                const isSelected = form.role === r;

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: r as Role }))}
                    className={`group relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                      isSelected
                        ? 'border-[#003580] bg-gradient-to-b from-[#003580] to-[#002660] text-white shadow-md ring-2 ring-[#003580]/30 scale-[1.02]'
                        : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 shadow-sm'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        isSelected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-700'
                      }`}
                    >
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <span className="text-center font-bold leading-tight">{r}</span>
                    <span className={`text-[10px] font-medium ${isSelected ? 'text-blue-100/90' : 'text-slate-400'}`}>
                      {desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credential & Password Management Card */}
          <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 p-4 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#003580]/10 text-[#003580]">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Account Security & Credentials
                  </h4>
                  <p className="text-[11px] text-slate-500">Configure password policy and account status</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, password: generatePassword(), autoGeneratePassword: true }))}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003580] bg-white hover:bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm transition-all hover:border-blue-300 active:scale-98"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Generate Password
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Field label="Initial Password" error={formErrors.password}>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    value={form.password}
                    disabled={form.autoGeneratePassword}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder={form.autoGeneratePassword ? 'Auto-generated secure password' : 'Enter account password'}
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-9 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 disabled:bg-slate-100 disabled:text-slate-700 font-mono font-medium transition-all"
                  />
                  {form.password && (
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(form.password)}
                      className="absolute right-3 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Copy Password"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 text-[11px] text-slate-600 mt-1.5 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={form.autoGeneratePassword}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        autoGeneratePassword: event.target.checked,
                        password: event.target.checked ? generatePassword() : '',
                      }))
                    }
                    className="rounded border-slate-300 text-[#003580] focus:ring-[#003580]"
                  />
                  Auto-generate password & send welcome notification
                </label>
              </Field>

              <Field label="Initial Account Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => {
                      const newStatus = event.target.value as Status;
                      return {
                        ...current,
                        status: newStatus,
                        isVerified: newStatus === 'Active' ? true : current.isVerified,
                      };
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-white font-medium text-slate-800 shadow-sm transition-all"
                >
                  {statuses.filter((status): status is Status => status !== 'All').map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </Field>

              <Field label="Initial Profile Verification">
                <select
                  value={form.isVerified ? 'Verified' : 'Unverified'}
                  onChange={(event) => setForm((current) => ({ ...current, isVerified: event.target.value === 'Verified' }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-white font-medium text-slate-800 shadow-sm transition-all"
                >
                  <option value="Verified">Verified (Record Confirmed)</option>
                  <option value="Unverified">Unverified (Pending Review)</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Role-Specific Dynamic Form Fields */}
          {form.role === 'Alumni' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#003580]" />
                  Alumni Profile & Academic Parameters
                </h4>
                <span className="text-[11px] font-medium text-slate-400">9 Core Fields</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field label="1) Full Name" error={formErrors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Legal Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="2) Email Address" error={formErrors.email}>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Primary Email Address"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="3) Phone Number" error={formErrors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone Number (e.g. +251...)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="4) Student ID" error={formErrors.studentId}>
                  <input
                    value={form.studentId}
                    onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                    placeholder="e.g. UGR/77777/25"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-mono font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="5) Nationality">
                  <input
                    value={form.nationality}
                    onChange={(e) => setForm((prev) => ({ ...prev, nationality: e.target.value }))}
                    placeholder="Nationality (Default: Ethiopian)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="6) Date of Birth">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="7) Department" error={formErrors.department}>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-white font-medium text-slate-800 transition-all shadow-sm"
                  >
                    <option value="">Select Academic Department</option>
                    {departmentList.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </Field>

                <Field label="8) Graduation Batch" error={formErrors.graduationYear}>
                  <input
                    value={form.graduationYear}
                    onChange={(e) => setForm((prev) => ({ ...prev, graduationYear: e.target.value }))}
                    placeholder="e.g. 2024"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="9) Final CGPA" error={formErrors.cgpa}>
                  <input
                    value={form.cgpa}
                    onChange={(e) => setForm((prev) => ({ ...prev, cgpa: e.target.value }))}
                    placeholder="e.g. 3.75"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>
              </div>
            </div>
          )}

          {form.role === 'Employer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  Corporate Partner & HR Access Details
                </h4>
                <span className="text-[11px] font-medium text-amber-700/80 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Partner Account</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company / Organization Name" error={formErrors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Safaricom Ethiopia"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Official Email Address" error={formErrors.email}>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="hr@company.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Industry Sector">
                  <select
                    value={form.industry}
                    onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-white font-medium text-slate-800 transition-all shadow-sm"
                  >
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Software & Information Technology">Software & Information Technology</option>
                    <option value="Banking & Financial Services">Banking & Financial Services</option>
                    <option value="Engineering & Construction">Engineering & Construction</option>
                    <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                    <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                    <option value="Government & Public Sector">Government & Public Sector</option>
                  </select>
                </Field>

                <Field label="HR Contact Person">
                  <input
                    value={form.hrContact}
                    onChange={(e) => setForm((prev) => ({ ...prev, hrContact: e.target.value }))}
                    placeholder="Full Name of HR Representative"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Contact Phone Number" error={formErrors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 911 000 000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Company Headquarters / City">
                  <input
                    value={form.location}
                    onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Addis Ababa, Ethiopia"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>
              </div>
            </div>
          )}

          {form.role === 'Registrar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  Registrar Officer Profile & Division
                </h4>
                <span className="text-[11px] font-medium text-emerald-700/80 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">University Staff</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Officer Full Name" error={formErrors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Officer Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Official Email Address" error={formErrors.email}>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="officer@astu.edu.et"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Registrar Office Division">
                  <select
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-white font-medium text-slate-800 transition-all shadow-sm"
                  >
                    <option value="Main Registrar Office">Main Registrar Office</option>
                    <option value="Student Records & Transcripts">Student Records & Transcripts</option>
                    <option value="Graduation Audit Division">Graduation Audit Division</option>
                    <option value="Admissions & Verification">Admissions & Verification</option>
                  </select>
                </Field>

                <Field label="Office Direct Phone" error={formErrors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 22 111 0000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>
              </div>
            </div>
          )}

          {form.role === 'Department Head' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#003580]" />
                  Academic Lead & Department Supervisor
                </h4>
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Department Admin</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Department Head Name" error={formErrors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Dr. / Prof. Full Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Official Email Address" error={formErrors.email}>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="depthead@astu.edu.et"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Academic Department" error={formErrors.department}>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-white font-medium text-slate-800 transition-all shadow-sm"
                  >
                    <option value="">Select Academic Department</option>
                    {departmentList.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Contact Phone Number" error={formErrors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 911 000 000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>
              </div>
            </div>
          )}

          {form.role === 'CMS Manager' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-purple-600" />
                  CMS Content Manager & Media Publisher
                </h4>
                <span className="text-[11px] font-medium text-purple-700/80 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Media Admin</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Manager Full Name" error={formErrors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full Manager Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Official Email Address" error={formErrors.email}>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="cms@astu.edu.et"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="CMS Management Scope">
                  <select
                    value={form.cmsScope}
                    onChange={(e) => setForm((prev) => ({ ...prev, cmsScope: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-white font-medium text-slate-800 transition-all shadow-sm"
                  >
                    <option value="All Content & News Banners">All Content & News Banners</option>
                    <option value="News & Official Announcements">News & Official Announcements</option>
                    <option value="Events & Gallery Media">Events & Gallery Media</option>
                    <option value="Alumni Success Stories & Testimonials">Alumni Success Stories & Testimonials</option>
                  </select>
                </Field>

                <Field label="Contact Phone Number" error={formErrors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 911 000 000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>
              </div>
            </div>
          )}

          {form.role === 'Admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-rose-600" />
                  System Administrator Privileges
                </h4>
                <span className="text-[11px] font-medium text-rose-700/80 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">Elevated Privilege</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Admin Full Name" error={formErrors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Admin Full Name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Admin Email Address" error={formErrors.email}>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@astu.edu.et"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>

                <Field label="Administration Level">
                  <select
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-white font-medium text-slate-800 transition-all shadow-sm"
                  >
                    <option value="Super Admin">Full Super Admin</option>
                    <option value="User & Role Admin">User & Role Administrator</option>
                    <option value="System Security Auditor">System Security Auditor</option>
                  </select>
                </Field>

                <Field label="Contact Phone Number" error={formErrors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 911 000 000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 bg-slate-50/40 hover:bg-white focus:bg-white font-medium text-slate-800 transition-all shadow-sm"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      </AdminModal>

      {activeUser && (
        <AdminModal
          open={!!activeUser}
          title={`${activeUser.name} — Detailed Account & Portal Profile`}
          onClose={() => setActiveUser(null)}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Close Profile
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const u = activeUser;
                    setActiveUser(null);
                    openEditModal(u);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#001F4D] hover:bg-indigo-900 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRowAction(activeUser, 'Reset Password')}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Reset Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRowAction(activeUser, 'Change Role')}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Shield className="h-3.5 w-3.5 text-purple-600" />
                  <span>Change Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRowAction(activeUser, 'Suspend')}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <UserRound className="h-3.5 w-3.5 text-amber-600" />
                  <span>{activeUser.status === 'Active' ? 'Suspend Account' : 'Activate Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRowAction(activeUser, 'Delete')}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Delete User</span>
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Top User Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#001F4D]/5 via-indigo-50/40 to-sky-50/30 border border-slate-200/80 flex items-center justify-between flex-wrap gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                {(() => {
                  const avatar = getUserAvatarUrl(activeUser);
                  return (
                    <div className="relative h-14 w-14 shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#001F4D] to-indigo-700 text-base font-extrabold text-white shadow-md shadow-indigo-900/15">
                        {initials(activeUser.name)}
                      </div>
                      {avatar && (
                        <img
                          src={avatar}
                          alt={activeUser.name}
                          className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md absolute inset-0 z-10"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  );
                })()}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-extrabold text-slate-900">{activeUser.name}</h4>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                      ID: {activeUser.id}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{activeUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AdminBadge variant={roleTone[activeUser.role]} className={roleColorClass[activeUser.role]}>
                  {activeUser.role}
                </AdminBadge>
                <AdminBadge variant={statusTone[activeUser.status]} className={statusColorClass[activeUser.status]}>
                  {activeUser.status}
                </AdminBadge>
              </div>
            </div>

            {/* Profile Navigation Tabs (Category Pills) */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-none">
              {activeUser.role === 'Alumni' && [
                { id: 'academic', label: 'Academic', icon: GraduationCap },
                { id: 'personal', label: 'Personal', icon: User },
                { id: 'employment', label: 'Employment', icon: Building2 },
                { id: 'social', label: 'Social Links', icon: Link },
                { id: 'skills', label: 'Skills', icon: Sparkles },
                { id: 'certifications', label: 'Certifications', icon: Award },
                { id: 'projects', label: 'Projects', icon: Code },
                { id: 'achievements', label: 'Achievements', icon: Sparkles },
                { id: 'files', label: 'Resume & Files', icon: BookOpen },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'privacy', label: 'Privacy', icon: Shield },
                { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
                { id: 'security', label: 'Security', icon: Lock },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeDetailTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveDetailTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-white text-[#001F4D] shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}

              {activeUser.role === 'Employer' && [
                { id: 'company', label: 'Company Overview', icon: Building2 },
                { id: 'hr', label: 'HR Contact', icon: User },
                { id: 'recruitment', label: 'Recruitment Activity', icon: Sparkles },
                { id: 'mou', label: 'MOU & Governance', icon: Shield },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeDetailTab === t.id || (activeDetailTab === 'academic' && t.id === 'company');
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveDetailTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-white text-[#001F4D] shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}

              {activeUser.role !== 'Alumni' && activeUser.role !== 'Employer' && [
                { id: 'overview', label: 'Account Profile', icon: Shield },
                { id: 'duties', label: 'Role & Clearances', icon: BookOpen },
                { id: 'audit', label: 'Security & Audit Log', icon: Clock3 },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeDetailTab === t.id || (activeDetailTab === 'academic' && t.id === 'overview');
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveDetailTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-white text-[#001F4D] shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Pane Contents */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
              {/* --- ALUMNI TABS --- */}
              {activeUser.role === 'Alumni' && (activeDetailTab === 'academic' || activeDetailTab === 'overview') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-indigo-600" />
                      Academic Qualifications & Records
                    </h5>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ASTU Verified Record
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Student ID Code</span>
                      <p className="text-xs font-extrabold text-slate-900">{activeUser.studentId || 'Not Recorded'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Academic Division / Dept</span>
                      <p className="text-xs font-extrabold text-slate-900">{activeUser.department || 'Not Specified'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Graduation Batch Year</span>
                      <p className="text-xs font-extrabold text-slate-900">{activeUser.batch || activeUser.graduationYear || 'Not Recorded'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Degree Distinction</span>
                      <p className="text-xs font-extrabold text-indigo-700">
                        {activeUser.degreeDistinction || (activeUser.cgpa ? (Number(activeUser.cgpa) >= 3.75 ? 'B.Sc. First Class Distinction' : Number(activeUser.cgpa) >= 3.4 ? 'B.Sc. Very Great Distinction' : 'B.Sc. Degree') : 'Degree Program')}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Cumulative GPA (CGPA)</span>
                      <p className="text-xs font-extrabold text-emerald-700">
                        {activeUser.cgpa ? `${Number(activeUser.cgpa).toFixed(2)} / 4.00` : 'Not Recorded'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Academic Advisor</span>
                      <p className="text-xs font-bold text-slate-900">{activeUser.advisor || 'Not Assigned'}</p>
                    </div>

                    <div className="lg:col-span-3 p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">B.Sc. Senior Capstone / Thesis Title</span>
                      <p className="text-xs font-bold text-slate-800">
                        {activeUser.thesisTitle ? `"${activeUser.thesisTitle}"` : 'Not Registered'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeUser.role === 'Alumni' && activeDetailTab === 'personal' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Personal Bio & Contact Information
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Legal Name</span>
                      <p className="text-xs font-extrabold text-slate-900">{activeUser.name}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Primary Email Address</span>
                      <p className="text-xs font-extrabold text-slate-900">{activeUser.email}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contact Phone Number</span>
                      <p className="text-xs font-extrabold text-slate-900">{activeUser.phone || 'Not Provided'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Date of Birth</span>
                      <p className="text-xs font-bold text-slate-900">
                        {activeUser.dateOfBirth ? format(new Date(activeUser.dateOfBirth), 'MMM dd, yyyy') : 'Not Recorded'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gender & Nationality</span>
                      <p className="text-xs font-bold text-slate-900">
                        {activeUser.gender || 'Not Specified'} • {activeUser.nationality || 'Not Recorded'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Current Residence City</span>
                      <p className="text-xs font-bold text-slate-900">{activeUser.address || activeUser.workLocation || 'Not Recorded'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">National ID / Passport</span>
                      <p className="text-xs font-bold text-slate-900">
                        {activeUser.nationalId || 'Not Recorded'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Emergency Contact</span>
                      <p className="text-xs font-bold text-slate-900">
                        {activeUser.emergencyContact || 'Not Listed'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeUser.role === 'Alumni' && activeDetailTab === 'employment' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-amber-600" />
                      Professional Employment & Career Profile
                    </h5>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {activeUser.employmentStatus || 'Not Specified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Current Organization / Company</span>
                      <p className="text-xs font-extrabold text-slate-900">
                        {activeUser.employerName || activeUser.companyName || (activeUser.employmentStatus === 'UNEMPLOYED' ? 'Seeking Placement' : 'Not Listed')}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Official Job Title</span>
                      <p className="text-xs font-extrabold text-indigo-700">
                        {activeUser.jobTitle || activeUser.position || (activeUser.employmentStatus === 'UNEMPLOYED' ? 'Candidate' : 'Not Listed')}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Industry Sector</span>
                      <p className="text-xs font-bold text-slate-900">{activeUser.industry || 'Not Specified'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Professional Experience</span>
                      <p className="text-xs font-bold text-slate-900">
                        {activeUser.experienceYears ? `${activeUser.experienceYears} Years` : 'No Experience Listed'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Work Location</span>
                      <p className="text-xs font-bold text-slate-900">{activeUser.workLocation || activeUser.location || 'Not Specified'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Estimated Salary Bracket</span>
                      <p className="text-xs font-bold text-emerald-700">{activeUser.salaryRange || 'Not Disclosed'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeUser.role === 'Alumni' && activeDetailTab === 'social' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Link className="h-4 w-4 text-blue-600" />
                      Social Links & Digital Footprint
                    </h5>
                  </div>

                  {activeUser.linkedIn || activeUser.gitHub || activeUser.portfolio || activeUser.telegram || activeUser.twitterUrl ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {activeUser.linkedIn && (
                        <a href={activeUser.linkedIn} target="_blank" rel="noreferrer" className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs hover:border-blue-300 block">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">LinkedIn Profile</span>
                          <p className="text-xs font-extrabold text-blue-600 truncate">{activeUser.linkedIn}</p>
                        </a>
                      )}
                      {activeUser.gitHub && (
                        <a href={activeUser.gitHub} target="_blank" rel="noreferrer" className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs hover:border-slate-400 block">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">GitHub Handle / Profile</span>
                          <p className="text-xs font-extrabold text-slate-900 truncate">{activeUser.gitHub}</p>
                        </a>
                      )}
                      {activeUser.portfolio && (
                        <a href={activeUser.portfolio} target="_blank" rel="noreferrer" className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs hover:border-purple-300 block">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Portfolio Website</span>
                          <p className="text-xs font-extrabold text-purple-600 truncate">{activeUser.portfolio}</p>
                        </a>
                      )}
                      {activeUser.telegram && (
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Telegram Username</span>
                          <p className="text-xs font-extrabold text-sky-600">{activeUser.telegram}</p>
                        </div>
                      )}
                      {activeUser.twitterUrl && (
                        <a href={activeUser.twitterUrl} target="_blank" rel="noreferrer" className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs hover:border-sky-300 block">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">X / Twitter Handle</span>
                          <p className="text-xs font-extrabold text-sky-600 truncate">{activeUser.twitterUrl}</p>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-white border border-slate-200/70 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Link className="h-6 w-6" />
                      </div>
                      <h6 className="text-xs font-extrabold text-slate-700">No Social Profile Links in Database</h6>
                      <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto">
                        No external social profile URLs (LinkedIn, GitHub, Portfolio, Telegram, or Twitter) have been provided by this alumnus.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeUser.role === 'Alumni' && activeDetailTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Core Technical Skills & Competencies
                    </h5>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Core Technical Competencies</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {activeUser.skills && activeUser.skills.length > 0 ? (
                          activeUser.skills.map((s) => (
                            <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-bold">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">No Skills Registered in Database</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Languages Spoken</span>
                      <p className="text-xs font-bold text-slate-900">
                        {activeUser.languages && activeUser.languages.length > 0
                          ? activeUser.languages.join(' • ')
                          : 'Not Specified'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeUser.role === 'Alumni' && activeDetailTab === 'certifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      Professional Certifications & Credentials
                    </h5>
                  </div>

                  {activeUser.certifications && activeUser.certifications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {activeUser.certifications.map((c: any, idx: number) => {
                        const certName = typeof c === 'string' ? c : c.name;
                        const certIssuer = typeof c === 'string' ? 'Verified Issuer' : c.issuer || 'Certified Professional';
                        const certYear = typeof c === 'string' ? '' : c.year;
                        return (
                          <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{certIssuer} {certYear ? `• ${certYear}` : ''}</span>
                            <p className="text-xs font-extrabold text-slate-900">{certName}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-white border border-slate-200/70 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Award className="h-6 w-6" />
                      </div>
                      <h6 className="text-xs font-extrabold text-slate-700">No Certifications Registered in Database</h6>
                      <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto">
                        No professional certifications or technical credentials have been logged for this profile in the database.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeUser.role === 'Alumni' && activeDetailTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Code className="h-4 w-4 text-indigo-600" />
                      Engineering & Research Projects
                    </h5>
                  </div>

                  {activeUser.projects && activeUser.projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {activeUser.projects.map((p: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-2 shadow-2xs">
                          <h6 className="text-xs font-extrabold text-slate-900">{p.title || p.name || 'Unnamed Project'}</h6>
                          <p className="text-[11px] font-medium text-slate-600">{p.description || 'No project description provided.'}</p>
                          {p.link && (
                            <a href={p.link} target="_blank" rel="noreferrer" className="text-[10px] font-extrabold text-indigo-600 hover:underline block truncate">
                              {p.link}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-white border border-slate-200/70 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Code className="h-6 w-6" />
                      </div>
                      <h6 className="text-xs font-extrabold text-slate-700">No Projects Registered in Database</h6>
                      <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto">
                        No capstone projects, software repositories, or engineering research projects are registered in the database for this user.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeUser.role === 'Alumni' && activeDetailTab === 'achievements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      Honors & Academic Achievements
                    </h5>
                  </div>

                  {activeUser.achievements && activeUser.achievements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {activeUser.achievements.map((a: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1.5 shadow-2xs">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">{a.issuer || 'Academic Honor'}</span>
                          <h6 className="text-xs font-extrabold text-slate-900">{a.title || a.name || 'Honors Award'}</h6>
                          <p className="text-[11px] font-medium text-slate-600">{a.description || 'Recognized achievement.'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-white border border-slate-200/70 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h6 className="text-xs font-extrabold text-slate-700">No Achievements or Honors Registered in Database</h6>
                      <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto">
                        No institutional honors, Dean's list distinctions, or competition awards have been entered for this user account.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeUser.role === 'Alumni' && activeDetailTab === 'files' && (() => {
                const userRealFiles: Array<{ name: string; type: string; sub: string; badge: string; badgeClass: string; url?: string }> = [];

                if (activeUser.degreeCertUrl) {
                  userRealFiles.push({
                    name: 'ASTU Degree Certificate',
                    type: 'PDF',
                    sub: 'Uploaded Verified Degree Copy',
                    badge: 'VERIFIED PDF',
                    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    url: activeUser.degreeCertUrl,
                  });
                }

                if (activeUser.transcriptUrl) {
                  userRealFiles.push({
                    name: 'Official Academic Transcript',
                    type: 'PDF',
                    sub: 'Digital Sealed Transcript Record',
                    badge: 'SEALED PDF',
                    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    url: activeUser.transcriptUrl,
                  });
                }

                if (activeUser.resumeUrl) {
                  userRealFiles.push({
                    name: 'Curriculum Vitae / Resume',
                    type: 'DOC',
                    sub: 'Uploaded Candidate Resume',
                    badge: 'ON FILE',
                    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
                    url: activeUser.resumeUrl,
                  });
                }

                if (activeUser.documentRequests && activeUser.documentRequests.length > 0) {
                  activeUser.documentRequests.forEach((doc: any) => {
                    userRealFiles.push({
                      name: doc.documentType || 'Official Document Request',
                      type: 'PDF',
                      sub: doc.createdAt ? `Requested on ${format(new Date(doc.createdAt), 'MMM dd, yyyy')}` : 'Official Clearance Request',
                      badge: (doc.status || 'PENDING').toUpperCase(),
                      badgeClass: doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                      url: doc.documentUrl,
                    });
                  });
                }

                if (activeUser.verificationRequests && activeUser.verificationRequests.length > 0) {
                  activeUser.verificationRequests.forEach((v: any) => {
                    userRealFiles.push({
                      name: `Verification Request (${v.type || 'Academic'})`,
                      type: 'PDF',
                      sub: v.createdAt ? `Submitted on ${format(new Date(v.createdAt), 'MMM dd, yyyy')}` : 'Official Verification Record',
                      badge: (v.status || 'PENDING').toUpperCase(),
                      badgeClass: v.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                      url: v.documentUrl,
                    });
                  });
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                        Verified Academic Files & Clearances
                      </h5>
                    </div>

                    {userRealFiles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {userRealFiles.map((file, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${file.type === 'PDF' ? 'bg-rose-50 text-rose-600' : 'bg-purple-50 text-purple-600'}`}>
                                {file.type}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{file.name}</p>
                                <p className="text-[11px] text-slate-500">{file.sub}</p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${file.badgeClass}`}>
                              {file.badge}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-white border border-slate-200/70 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <h6 className="text-xs font-extrabold text-slate-700">No Academic Files or Clearances in Database</h6>
                        <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto">
                          No document files, degree certificates, transcripts, or clearance requests have been uploaded to the database for this user account.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeUser.role === 'Alumni' && activeDetailTab === 'notifications' && (() => {
                const prefs = activeUser.preferences || {};
                const isJobsEnabled = prefs.emailJobs !== false && prefs.jobAlerts !== false;
                const isEventsEnabled = prefs.emailEvents !== false && prefs.eventAnnouncements !== false;
                const isMentorshipEnabled = prefs.emailMentorship !== false && prefs.directMessages !== false;
                const isNewsletterEnabled = prefs.emailNewsletter !== false;
                const isSmsEnabled = prefs.smsNotifications !== false;
                const digestFreq = (prefs.digestFrequency || 'instant').toUpperCase();

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-indigo-600" />
                        Alumni Notification & Communication Settings
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">Job & Career Alerts</p>
                          <p className="text-[11px] text-slate-500">Automated job openings matching profile</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${isJobsEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {isJobsEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">Campus Event Announcements</p>
                          <p className="text-[11px] text-slate-500">ASTU alumni reunions and webinars</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${isEventsEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {isEventsEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">Direct Networking & Mentorship</p>
                          <p className="text-[11px] text-slate-500">Messages & requests from alumni & mentors</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${isMentorshipEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {isMentorshipEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">ASTU Alumni Newsletter</p>
                          <p className="text-[11px] text-slate-500">Monthly stories and campus highlights</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${isNewsletterEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {isNewsletterEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">SMS Critical Notifications</p>
                          <p className="text-[11px] text-slate-500">Urgent document and clearance SMS alerts</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${isSmsEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {isSmsEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">Email Digest Frequency</p>
                          <p className="text-[11px] text-slate-500">Scheduled notification summaries</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-indigo-50 text-indigo-700 border-indigo-200">
                          {digestFreq}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeUser.role === 'Alumni' && activeDetailTab === 'privacy' && (() => {
                const isCgpaPublic = activeUser.isCgpaPublic !== false && activeUser.preferences?.shareCgpaToEmployers !== false;
                const isDirectoryVisible = activeUser.preferences?.profileVisibleToAlumni !== false && activeUser.preferences?.profileVisibleToPeers !== false;
                const isEmployerVisible = activeUser.preferences?.profileVisibleToEmployers !== false;
                const isAnonymousTracer = Boolean(activeUser.preferences?.anonymousTracerResponses);

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        Privacy Controls & Public Profile Visibility
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Cumulative GPA Privacy</span>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-xs font-extrabold text-slate-900">
                            {isCgpaPublic ? 'Public to Employers & Partners' : 'Private (Hidden from Employers)'}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${isCgpaPublic ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {isCgpaPublic ? 'PUBLIC' : 'PRIVATE'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Directory Searchability</span>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-xs font-extrabold text-slate-900">
                            {isDirectoryVisible ? 'Visible in Alumni Directory' : 'Hidden from Directory Search'}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${isDirectoryVisible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {isDirectoryVisible ? 'INDEXED' : 'HIDDEN'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Employer Profile Visibility</span>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-xs font-extrabold text-slate-900">
                            {isEmployerVisible ? 'Visible to Corporate Recruiters' : 'Hidden from Employers'}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${isEmployerVisible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {isEmployerVisible ? 'VISIBLE' : 'RESTRICTED'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tracer Response Privacy</span>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-xs font-extrabold text-slate-900">
                            {isAnonymousTracer ? 'Anonymous Responses Enabled' : 'Standard Verified Responses'}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${isAnonymousTracer ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {isAnonymousTracer ? 'ANONYMOUS' : 'VERIFIED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeUser.role === 'Alumni' && activeDetailTab === 'preferences' && (() => {
                const prefs = activeUser.preferences || {};
                const themeDisplay = prefs.theme ? String(prefs.theme).toLowerCase() : 'light';
                const langDisplay = prefs.language ? String(prefs.language) : 'English (System Default)';
                const isGivingEnabled = prefs.donationEnabled !== false;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-purple-600" />
                        System Preferences & User Configurations
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Interface Language</span>
                        <p className="text-xs font-extrabold text-slate-900">{langDisplay}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Visual Display Theme</span>
                        <p className="text-xs font-extrabold text-slate-900 capitalize">{themeDisplay}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Mentorship Availability</span>
                        <p className="text-xs font-extrabold text-indigo-700">
                          {prefs.openToMentorship ? 'Available as Alumni Mentor' : 'Not Currently Mentoring'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Career Placement Intent</span>
                        <p className="text-xs font-extrabold text-emerald-700">
                          {activeUser.employmentStatus === 'UNEMPLOYED' || prefs.seekingJob ? 'Actively Seeking Placement' : 'Employed / Neutral'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Alumni Giving Prompts</span>
                        <p className="text-xs font-extrabold text-purple-700">
                          {isGivingEnabled ? 'Active Giving Prompts' : 'Giving Prompts Paused'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeUser.role === 'Alumni' && activeDetailTab === 'security' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-rose-600" />
                      Account Security, 2FA & Authentication Audit
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Database Verification Status</span>
                      <p className="text-xs font-extrabold text-emerald-700">
                        {activeUser.isVerified ? 'VERIFIED (Registrar Match)' : 'PENDING VERIFICATION'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Two-Factor Authentication (2FA)</span>
                      <p className="text-xs font-extrabold text-slate-900">
                        {activeUser.twoFactorEnabled ? '2FA Active (App OTP)' : '2FA Disabled (Password Only)'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Password Encryption</span>
                      <p className="text-xs font-extrabold text-slate-900">Secure Hash (Argon2id/Bcrypt)</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Last System Authentication</span>
                      <p className="text-xs font-bold text-slate-900">{activeUser.lastLogin}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Creation Timestamp</span>
                      <p className="text-xs font-bold text-slate-900">{activeUser.registeredAt}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- EMPLOYER TABS --- */}
              {/* Tab 1: Company Overview */}
              {activeUser.role === 'Employer' && (activeDetailTab === 'company' || activeDetailTab === 'academic' || activeDetailTab === 'overview') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 flex-wrap gap-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-amber-600" />
                      Company Overview & Profile Details
                    </h5>
                    <div className="flex items-center gap-2">
                      {editingTab === 'company' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveInlineEmployer}
                            disabled={savingInline}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {savingInline ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTab(null)}
                            disabled={savingInline}
                            className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startInlineEdit('company', activeUser)}
                          className="px-3 py-1 rounded-lg bg-[#001F4D] hover:bg-indigo-900 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <PencilLine className="h-3 w-3" />
                          <span>Edit Overview</span>
                        </button>
                      )}
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {activeUser.verificationStatus || (activeUser.status === 'Active' ? 'VERIFIED_PARTNER' : 'PENDING_VERIFICATION')}
                      </span>
                    </div>
                  </div>

                  {editingTab === 'company' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-amber-50/40 p-4 rounded-xl border border-amber-200/60">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Organization / Company Name</label>
                        <input
                          type="text"
                          value={inlineForm.companyName}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, companyName: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Industry Sector</label>
                        <input
                          type="text"
                          value={inlineForm.industry}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, industry: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Company Size</label>
                        <select
                          value={inlineForm.companySize}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, companySize: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        >
                          <option value="Startup (1-10)">Startup (1-10)</option>
                          <option value="Small (10-50)">Small (10-50)</option>
                          <option value="Medium Scale (50-200 Employees)">Medium Scale (50-200 Employees)</option>
                          <option value="Enterprise">Enterprise (200+ Employees)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Headquarters / Location</label>
                        <input
                          type="text"
                          value={inlineForm.location}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Company Website</label>
                        <input
                          type="text"
                          value={inlineForm.website}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, website: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Account Partnership Level</label>
                        <select
                          value={inlineForm.partnershipAgreement}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, partnershipAgreement: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        >
                          <option value="Tier 1 Strategic Partnership Agreement">Tier 1 Strategic Partnership Agreement</option>
                          <option value="ASTU Strategic Partnership Agreement">ASTU Strategic Partnership Agreement</option>
                          <option value="Registered Employer Partner">Registered Employer Partner</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Organization / Company Name</span>
                        <p className="text-xs font-extrabold text-slate-900">{activeUser.companyName || activeUser.name}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Industry Sector</span>
                        <p className="text-xs font-bold text-slate-900">{activeUser.industry || 'Technology & Innovation'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Company Size</span>
                        <p className="text-xs font-bold text-slate-900">{activeUser.companySize || 'Enterprise'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Headquarters / Location</span>
                        <p className="text-xs font-bold text-slate-900">{activeUser.location || activeUser.address || 'Not Specified'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Company Website</span>
                        {activeUser.website ? (
                          <a href={activeUser.website.startsWith('http') ? activeUser.website : `https://${activeUser.website}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline block truncate">
                            {activeUser.website}
                          </a>
                        ) : (
                          <p className="text-xs font-bold text-slate-400">Not Listed</p>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Partnership Level</span>
                        <p className="text-xs font-extrabold text-emerald-700">
                          {activeUser.partnershipAgreement || (activeUser.isPremium ? 'Premium Employer Partner' : 'Registered Employer Partner')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: HR Contact */}
              {activeUser.role === 'Employer' && activeDetailTab === 'hr' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 flex-wrap gap-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Human Resources & Contact Information
                    </h5>
                    <div className="flex items-center gap-2">
                      {editingTab === 'hr' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveInlineEmployer}
                            disabled={savingInline}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {savingInline ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTab(null)}
                            disabled={savingInline}
                            className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startInlineEdit('hr', activeUser)}
                          className="px-3 py-1 rounded-lg bg-[#001F4D] hover:bg-indigo-900 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <PencilLine className="h-3 w-3" />
                          <span>Edit HR Info</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {editingTab === 'hr' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-blue-50/40 p-4 rounded-xl border border-blue-200/60">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Primary HR Contact Person</label>
                        <input
                          type="text"
                          value={inlineForm.contactPerson}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, contactPerson: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Official HR Email</label>
                        <input
                          type="email"
                          value={inlineForm.contactEmail}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">HR Contact Phone</label>
                        <input
                          type="text"
                          value={inlineForm.phone}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Verification Status</label>
                        <select
                          value={inlineForm.verificationStatus}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, verificationStatus: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                          <option value="Active">VERIFIED_PARTNER (Active)</option>
                          <option value="Pending Verification">PENDING_VERIFICATION</option>
                          <option value="Suspended">SUSPENDED</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Primary HR Contact Person</span>
                        <p className="text-xs font-extrabold text-slate-900">{activeUser.contactPerson || activeUser.hrContact || activeUser.name}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Official HR Email</span>
                        <p className="text-xs font-bold text-indigo-700">{activeUser.contactEmail || activeUser.email}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">HR Contact Phone</span>
                        <p className="text-xs font-bold text-slate-900">{activeUser.phone || activeUser.hrContact || 'Not Provided'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Designated Role</span>
                        <p className="text-xs font-bold text-slate-900">Talent Acquisition & University Liaison</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Direct Messaging Status</span>
                        <p className="text-xs font-bold text-emerald-700">Active & Enabled</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Authorization</span>
                        <p className="text-xs font-bold text-slate-900">Verified Representative</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Recruitment Activity */}
              {activeUser.role === 'Employer' && activeDetailTab === 'recruitment' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 flex-wrap gap-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      ASTU Campus Recruitment & Job Postings Activity
                    </h5>
                    <div className="flex items-center gap-2">
                      {editingTab === 'recruitment' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveInlineEmployer}
                            disabled={savingInline}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {savingInline ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTab(null)}
                            disabled={savingInline}
                            className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startInlineEdit('recruitment', activeUser)}
                          className="px-3 py-1 rounded-lg bg-[#001F4D] hover:bg-indigo-900 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <PencilLine className="h-3 w-3" />
                          <span>Edit Recruitment Info</span>
                        </button>
                      )}
                      <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        {activeUser.jobPosts?.length || 0} Total Job Openings
                      </span>
                    </div>
                  </div>

                  {editingTab === 'recruitment' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-indigo-50/40 p-4 rounded-xl border border-indigo-200/60">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Industry / Recruitment Scope</label>
                        <input
                          type="text"
                          value={inlineForm.industry}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, industry: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Recruitment Status</label>
                        <select
                          value={inlineForm.verificationStatus}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, verificationStatus: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value="Active">Active Campus Hiring Authorized</option>
                          <option value="Pending Verification">Pending Hiring Authorization</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Postings Created</span>
                          <p className="text-sm font-extrabold text-slate-900">{activeUser.jobPosts?.length || 0} Jobs</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Open Positions</span>
                          <p className="text-sm font-extrabold text-emerald-700">{activeUser.activeJobsCount !== undefined ? activeUser.activeJobsCount : (activeUser.jobPosts?.filter(j => j.status === 'ACTIVE' || j.status === 'PUBLISHED' || j.status === 'Open').length || 0)} Active</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Student Applications</span>
                          <p className="text-sm font-extrabold text-indigo-700">{activeUser.totalApplicationsCount || 0} Applications</p>
                        </div>
                      </div>

                      {activeUser.jobPosts && activeUser.jobPosts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {activeUser.jobPosts.map((job) => (
                            <div key={job.id} className="p-4 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between shadow-2xs">
                              <div className="space-y-1">
                                <h6 className="text-xs font-extrabold text-slate-900">{job.title}</h6>
                                <p className="text-[11px] font-medium text-slate-500">{job.type || 'Full-time'} • {job.location || 'Adama / Remote'}</p>
                                {job.createdAt && (
                                  <p className="text-[10px] font-semibold text-slate-400">Posted on {format(new Date(job.createdAt), 'MMM dd, yyyy')}</p>
                                )}
                              </div>
                              <div className="text-right space-y-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${job.status === 'ACTIVE' || job.status === 'PUBLISHED' || job.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                  {job.status || 'ACTIVE'}
                                </span>
                                <p className="text-[10px] font-extrabold text-indigo-600">{job.applicantCount || 0} Applicants</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl bg-white border border-slate-200/70 text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <h6 className="text-xs font-extrabold text-slate-700">No Job Postings in Database Yet</h6>
                          <p className="text-[11px] font-medium text-slate-400 max-w-sm mx-auto">
                            No active job offers or campus recruitment drives have been submitted by this employer in the database yet.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Tab 4: MOU & Governance */}
              {activeUser.role === 'Employer' && activeDetailTab === 'mou' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 flex-wrap gap-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      ASTU Partnership MOU & Governance Details
                    </h5>
                    <div className="flex items-center gap-2">
                      {editingTab === 'mou' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveInlineEmployer}
                            disabled={savingInline}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {savingInline ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTab(null)}
                            disabled={savingInline}
                            className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startInlineEdit('mou', activeUser)}
                          className="px-3 py-1 rounded-lg bg-[#001F4D] hover:bg-indigo-900 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <PencilLine className="h-3 w-3" />
                          <span>Edit Governance</span>
                        </button>
                      )}
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {activeUser.verificationStatus || activeUser.status || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {editingTab === 'mou' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/60">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">ASTU Partnership MOU</label>
                        <input
                          type="text"
                          value={inlineForm.partnershipAgreement}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, partnershipAgreement: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Tax Identification Number (TIN)</label>
                        <input
                          type="text"
                          value={inlineForm.tin}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, tin: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">NDA & Data Governance</label>
                        <select
                          value={inlineForm.ndaSigned ? 'true' : 'false'}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, ndaSigned: e.target.value === 'true' }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="true">Signed & Fully Compliant</option>
                          <option value="false">Pending Signature</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Partnership Status</label>
                        <select
                          value={inlineForm.verificationStatus}
                          onChange={(e) => setInlineForm((prev) => ({ ...prev, verificationStatus: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="Active">VERIFIED_PARTNER (Active)</option>
                          <option value="Pending Verification">PENDING_VERIFICATION</option>
                          <option value="Suspended">SUSPENDED</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">ASTU Partnership MOU</span>
                        <p className="text-xs font-bold text-slate-900">
                          {activeUser.partnershipAgreement || (activeUser.isPremium ? 'Tier 1 Strategic Partnership Agreement' : 'ASTU Strategic Partnership Agreement')}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tax Identification Number (TIN)</span>
                        <p className="text-xs font-bold text-indigo-700">{activeUser.tin ? `Tax ID: ${activeUser.tin}` : 'Not Registered'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">NDA & Data Governance</span>
                        <p className="text-xs font-bold text-emerald-700">
                          {activeUser.ndaSigned === true ? 'Signed & Fully Compliant' : activeUser.ndaSigned === false ? 'Pending Signature' : 'Signed & Fully Compliant'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Partnership Status</span>
                        <p className="text-xs font-bold text-slate-900">
                          {activeUser.verificationStatus || activeUser.status || 'PENDING'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Clearance Verification</span>
                        <p className="text-xs font-bold text-emerald-700">
                          {activeUser.clearanceStatus || (activeUser.status === 'Active' || activeUser.isVerified ? 'Institutional Audit Approved' : 'Pending Audit Clearance')}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active MOU Frameworks</span>
                        <p className="text-xs font-bold text-slate-900">
                          {activeUser.partnerships && activeUser.partnerships.length > 0
                            ? activeUser.partnerships.join(' • ')
                            : 'Graduate Placement & Research Internships'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- REGISTRAR / DEPT HEAD / CMS / ADMIN TABS --- */}
              {/* Tab 1: Account Profile */}
              {activeUser.role !== 'Alumni' && activeUser.role !== 'Employer' && (activeDetailTab === 'overview' || activeDetailTab === 'academic') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 flex-wrap gap-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-600" />
                      Institutional Account & System Profile
                    </h5>
                    <div className="flex items-center gap-2">
                      {editingTab === 'staff_overview' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveInlineStaff}
                            disabled={savingInline}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {savingInline ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTab(null)}
                            disabled={savingInline}
                            className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startInlineEditStaff('staff_overview', activeUser)}
                          className="px-3 py-1 rounded-lg bg-[#001F4D] hover:bg-indigo-900 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <PencilLine className="h-3 w-3" />
                          <span>Edit Account Profile</span>
                        </button>
                      )}
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {activeUser.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {editingTab === 'staff_overview' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-indigo-50/40 p-4 rounded-xl border border-indigo-200/60">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Staff / Officer Name</label>
                        <input
                          type="text"
                          value={inlineStaffForm.name}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Official Email</label>
                        <input
                          type="email"
                          value={inlineStaffForm.email}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Assigned Department</label>
                        <input
                          type="text"
                          value={inlineStaffForm.department}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, department: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">System Role</label>
                        <select
                          value={inlineStaffForm.role}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, role: e.target.value as Role }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value="Registrar">Registrar</option>
                          <option value="Department Head">Department Head</option>
                          <option value="CMS Manager">CMS Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Account Status</label>
                        <select
                          value={inlineStaffForm.status}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, status: e.target.value as Status }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Pending Verification">Pending Verification</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Contact Phone</label>
                        <input
                          type="text"
                          value={inlineStaffForm.phone}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Staff / Officer Name</span>
                        <p className="text-xs font-extrabold text-slate-900">{activeUser.name}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Official Email</span>
                        <p className="text-xs font-bold text-indigo-700">{activeUser.email}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Assigned Department</span>
                        <p className="text-xs font-bold text-slate-900">{activeUser.department || 'System Office'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Security Clearance Level</span>
                        <p className="text-xs font-bold text-emerald-700">
                          {activeUser.role === 'Admin' || activeUser.role === 'SuperAdmin' ? 'Super Admin Level 5' : 'Level 3 Senior Privilege'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contact Phone</span>
                        <p className="text-xs font-bold text-slate-900">{activeUser.phone || 'Not Registered'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Audit State</span>
                        <p className="text-xs font-bold text-emerald-700">Verified Compliant</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Role & Clearances */}
              {activeUser.role !== 'Alumni' && activeUser.role !== 'Employer' && activeDetailTab === 'duties' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 flex-wrap gap-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      Role Privileges & Institutional Clearances
                    </h5>
                    <div className="flex items-center gap-2">
                      {editingTab === 'staff_duties' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveInlineStaff}
                            disabled={savingInline}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {savingInline ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTab(null)}
                            disabled={savingInline}
                            className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startInlineEditStaff('staff_duties', activeUser)}
                          className="px-3 py-1 rounded-lg bg-[#001F4D] hover:bg-indigo-900 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <PencilLine className="h-3 w-3" />
                          <span>Edit Role & Clearances</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {editingTab === 'staff_duties' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-purple-50/40 p-4 rounded-xl border border-purple-200/60">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Designated System Role</label>
                        <select
                          value={inlineStaffForm.role}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, role: e.target.value as Role }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                          <option value="Registrar">Registrar</option>
                          <option value="Department Head">Department Head</option>
                          <option value="CMS Manager">CMS Manager</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Assigned Department / Scope</label>
                        <input
                          type="text"
                          value={inlineStaffForm.department}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, department: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Account Authorization Status</label>
                        <select
                          value={inlineStaffForm.status}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, status: e.target.value as Status }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                          <option value="Active">Active & Authorized</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Designated System Role</span>
                        <p className="text-xs font-extrabold text-slate-900">{activeUser.role}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Department Access Scope</span>
                        <p className="text-xs font-bold text-indigo-700">{activeUser.department || 'System Office'}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Security Clearance Level</span>
                        <p className="text-xs font-bold text-emerald-700">
                          {activeUser.role === 'Admin' || activeUser.role === 'SuperAdmin' ? 'Super Admin Level 5' : 'Level 3 Senior Privilege'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Portal Authority Scope</span>
                        <p className="text-xs font-bold text-slate-900">
                          {activeUser.role === 'Registrar' || activeUser.role === 'RegistrarStaff'
                            ? 'Full Student & Degree Clearance Audit'
                            : activeUser.role === 'Department Head'
                            ? 'Departmental Faculty & Alum Scope'
                            : 'System-Wide Administrative Access'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Authorization Status</span>
                        <p className="text-xs font-bold text-emerald-700">
                          {activeUser.status === 'Active' ? 'Active & Authorized' : activeUser.status}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Institutional Audit</span>
                        <p className="text-xs font-bold text-slate-900">Verified Officer Profile</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Security & Audit Log */}
              {activeUser.role !== 'Alumni' && activeUser.role !== 'Employer' && activeDetailTab === 'audit' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 flex-wrap gap-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-emerald-600" />
                      Security, Authentication & Audit Activity
                    </h5>
                    <div className="flex items-center gap-2">
                      {editingTab === 'staff_audit' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveInlineStaff}
                            disabled={savingInline}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {savingInline ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTab(null)}
                            disabled={savingInline}
                            className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startInlineEditStaff('staff_audit', activeUser)}
                          className="px-3 py-1 rounded-lg bg-[#001F4D] hover:bg-indigo-900 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <PencilLine className="h-3 w-3" />
                          <span>Edit Security Info</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {editingTab === 'staff_audit' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/60">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Account Status</label>
                        <select
                          value={inlineStaffForm.status}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, status: e.target.value as Status }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Contact Phone</label>
                        <input
                          type="text"
                          value={inlineStaffForm.phone}
                          onChange={(e) => setInlineStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Two-Factor Authentication</span>
                        <p className="text-xs font-bold text-slate-900">
                          {activeUser.twoFactorEnabled ? '2FA Enforced & Active' : '2FA Standard Setup'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Last Authentication Timestamp</span>
                        <p className="text-xs font-bold text-slate-900">
                          {activeUser.lastLogin ? format(new Date(activeUser.lastLogin), 'MMM dd, yyyy HH:mm') : 'Recent Login'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Registration Date</span>
                        <p className="text-xs font-bold text-slate-900">
                          {activeUser.registeredAt ? format(new Date(activeUser.registeredAt), 'MMM dd, yyyy') : 'Registered'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Audit State</span>
                        <p className="text-xs font-bold text-emerald-700">Verified Compliant</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Password Encryption</span>
                        <p className="text-xs font-bold text-slate-900">Bcrypt Enterprise Hash</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 space-y-1 shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contact Phone Number</span>
                        <p className="text-xs font-bold text-slate-900">{activeUser.phone || 'Not Provided'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Notes Section */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">Administrative Audit Notes</h5>
                </div>
                {notesSuccessMsg && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-in fade-in duration-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Notes Saved to Database!
                  </span>
                )}
              </div>
              <textarea
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Click here to type administrative audit notes, compliance logs, or profile observations for this user account..."
                rows={3}
                className="w-full text-xs font-medium text-slate-900 bg-white p-3 rounded-xl border border-slate-300 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all resize-y placeholder:text-slate-400 cursor-text select-text relative z-10"
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-slate-400">
                  * Administrative notes are stored permanently in the user profile database.
                </p>
                <button
                  type="button"
                  onClick={handleSaveAdminNotes}
                  disabled={isSavingNotes}
                  className="px-4 py-2 rounded-xl bg-[#001F4D] hover:bg-indigo-900 text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSavingNotes ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Saving Notes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Save Audit Notes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
      {isExportModalOpen && createPortal(
        <div 
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/80 backdrop-blur-md z-[999999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-300/80 my-auto flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002866] via-[#003580] to-[#004b99] px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner shrink-0">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold tracking-tight">ASTU Enterprise Multi-Portal Directory Exporter</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">5 PORTALS CONNECTED</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-400/20 text-blue-200 border border-blue-300/30 px-2 py-0.5 rounded-full">CSV / JSON / COPY</span>
                  </div>
                  <p className="text-xs text-blue-100/80 mt-0.5">Executive reporting & cross-portal directory data extraction center</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40 min-h-[380px] flex flex-col">
              {isExportLoading ? (
                <div className="flex flex-col items-center justify-center p-16 space-y-4 my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-[#003580]/10 flex items-center justify-center border border-[#003580]/20 shadow-inner">
                    <Loader2 className="h-7 w-7 text-[#003580] animate-spin" />
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-extrabold text-slate-800 tracking-tight">Fetching Enterprise Multi-Portal Directory...</h4>
                    <p className="text-xs font-semibold text-slate-500">Synchronizing complete user database records across all 5 ASTU portals...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Portal Preset Tabs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[#003580]" />
                        Quick Portal Preset Filters
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">Click a portal tab to instantly isolate records</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      <button
                        type="button"
                        onClick={() => handlePortalPresetChange('ALL')}
                        className={`flex flex-col items-center justify-center py-2.5 px-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          activePortalTab === 'ALL'
                            ? 'bg-[#003580] border-[#003580] text-white shadow-md font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">All Portals</span>
                        <span className={`text-[10px] mt-0.5 font-extrabold px-2 py-0.5 rounded-full ${
                          activePortalTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {portalMetrics.all}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePortalPresetChange('ALUMNI')}
                        className={`flex flex-col items-center justify-center py-2.5 px-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          activePortalTab === 'ALUMNI'
                            ? 'bg-[#003580] border-[#003580] text-white shadow-md font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">Alumni Portal</span>
                        <span className={`text-[10px] mt-0.5 font-extrabold px-2 py-0.5 rounded-full ${
                          activePortalTab === 'ALUMNI' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {portalMetrics.Alumni}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePortalPresetChange('REGISTRAR')}
                        className={`flex flex-col items-center justify-center py-2.5 px-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          activePortalTab === 'REGISTRAR'
                            ? 'bg-[#003580] border-[#003580] text-white shadow-md font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">Registrar SIS</span>
                        <span className={`text-[10px] mt-0.5 font-extrabold px-2 py-0.5 rounded-full ${
                          activePortalTab === 'REGISTRAR' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {portalMetrics.Registrar}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePortalPresetChange('DEPARTMENT')}
                        className={`flex flex-col items-center justify-center py-2.5 px-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          activePortalTab === 'DEPARTMENT'
                            ? 'bg-[#003580] border-[#003580] text-white shadow-md font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">Dept & Faculty</span>
                        <span className={`text-[10px] mt-0.5 font-extrabold px-2 py-0.5 rounded-full ${
                          activePortalTab === 'DEPARTMENT' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {portalMetrics.DepartmentHead}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePortalPresetChange('EMPLOYER')}
                        className={`flex flex-col items-center justify-center py-2.5 px-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          activePortalTab === 'EMPLOYER'
                            ? 'bg-[#003580] border-[#003580] text-white shadow-md font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">Employer Net</span>
                        <span className={`text-[10px] mt-0.5 font-extrabold px-2 py-0.5 rounded-full ${
                          activePortalTab === 'EMPLOYER' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {portalMetrics.Employer}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePortalPresetChange('CMS')}
                        className={`flex flex-col items-center justify-center py-2.5 px-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          activePortalTab === 'CMS'
                            ? 'bg-[#003580] border-[#003580] text-white shadow-md font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">CMS Manager</span>
                        <span className={`text-[10px] mt-0.5 font-extrabold px-2 py-0.5 rounded-full ${
                          activePortalTab === 'CMS' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {portalMetrics.CmsManager}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePortalPresetChange('ADMIN')}
                        className={`flex flex-col items-center justify-center py-2.5 px-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          activePortalTab === 'ADMIN'
                            ? 'bg-[#003580] border-[#003580] text-white shadow-md font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs truncate">Super Admin</span>
                        <span className={`text-[10px] mt-0.5 font-extrabold px-2 py-0.5 rounded-full ${
                          activePortalTab === 'ADMIN' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {portalMetrics.SuperAdmin}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Matched Preview Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Matched Directory Records: <strong className="text-emerald-900 text-sm font-black">{exportMatchedUsers.length}</strong> of {allExportUsers.length} total users across system</span>
                    </div>
                    <button
                      type="button"
                      onClick={resetExportFilters}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset All Export Filters
                    </button>
                  </div>

                  {/* Dynamic Filtering Criteria Section Based on Active Portal */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Filter className="h-4 w-4 text-[#003580]" />
                        Filtering Criteria Configuration ({activePortalTab === 'ALL' ? 'Cross-Portal Multi-Filter' : `${activePortalTab} Portal Tailored Filters`})
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#003580] border border-blue-200 px-2 py-0.5 rounded-full">
                        {activePortalTab === 'ALL' ? 'All 9 Filters Active' : activePortalTab === 'ALUMNI' ? '7 Relevant Filters Active' : activePortalTab === 'REGISTRAR' ? '5 Relevant Filters Active' : activePortalTab === 'DEPARTMENT' ? '5 Relevant Filters Active' : activePortalTab === 'EMPLOYER' ? '5 Relevant Filters Active' : '4 Relevant Filters Active'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {/* 1. Keyword / Search Query */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">1. Search Query</label>
                        <input
                          type="text"
                          placeholder={
                            activePortalTab === 'ALUMNI' ? "Search Alumni by Name, Email, Student ID..." :
                            activePortalTab === 'REGISTRAR' ? "Search Officers by Name, Staff ID..." :
                            activePortalTab === 'DEPARTMENT' ? "Search Faculty / Chair by Name, ID..." :
                            activePortalTab === 'EMPLOYER' ? "Search Companies, Recruiters, HR Email..." :
                            activePortalTab === 'ADMIN' ? "Search Admins by Name, Admin ID..." :
                            "Search by Name, Email, ID..."
                          }
                          value={exportFilters.search}
                          onChange={(e) => setExportFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003580]"
                        />
                      </div>

                      {/* 2. Target User Role (Only in ALL Portals) */}
                      {activePortalTab === 'ALL' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">2. Target Portal Role</label>
                          <select
                            value={exportFilters.role}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setExportFilters(prev => ({ ...prev, role: val }));
                              if (val === 'All Roles') setActivePortalTab('ALL');
                              else if (val === 'Alumni') setActivePortalTab('ALUMNI');
                              else if (val === 'Registrar') setActivePortalTab('REGISTRAR');
                              else if (val === 'Department Head' || val === 'DepartmentHead') setActivePortalTab('DEPARTMENT');
                              else if (val === 'Employer') setActivePortalTab('EMPLOYER');
                              else if (val === 'CMS Manager') setActivePortalTab('CMS');
                              else if (val === 'Admin' || val === 'SuperAdmin') setActivePortalTab('ADMIN');
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                          >
                            <option value="All Roles">All Roles (Alumni, Staff, Employers, Admins)</option>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      )}

                      {/* 3. Account Status */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          {activePortalTab === 'ALL' ? '3.' : '2.'} Account Status
                        </label>
                        <select
                          value={exportFilters.status}
                          onChange={(e) => setExportFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                        >
                          <option value="All">All Account Statuses</option>
                          <option value="Active">Active</option>
                          <option value="Pending Verification">Pending Verification</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      {/* 4. Academic Department (Relevant for ALL, ALUMNI, DEPARTMENT) */}
                      {['ALL', 'ALUMNI', 'DEPARTMENT'].includes(activePortalTab) && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Academic Department</label>
                          <select
                            value={exportFilters.department}
                            onChange={(e) => setExportFilters(prev => ({ ...prev, department: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                          >
                            <option value="All Departments">All Departments</option>
                            {departmentList.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      )}

                      {/* 5. Graduation Batch Year (Relevant for ALL, ALUMNI) */}
                      {['ALL', 'ALUMNI'].includes(activePortalTab) && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Batch / Graduation Year</label>
                          <select
                            value={exportFilters.batchYear}
                            onChange={(e) => setExportFilters(prev => ({ ...prev, batchYear: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                          >
                            <option value="All">All Batches (2000 - 2026)</option>
                            {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map(b => (
                              <option key={b} value={b}>Class of {b}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* 6. Profile Verification (Relevant for ALL, ALUMNI, REGISTRAR, DEPARTMENT, EMPLOYER) */}
                      {['ALL', 'ALUMNI', 'REGISTRAR', 'DEPARTMENT', 'EMPLOYER'].includes(activePortalTab) && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            {activePortalTab === 'ALUMNI' ? 'Graduate Verification' : activePortalTab === 'EMPLOYER' ? 'Partner Verification' : 'Verification Status'}
                          </label>
                          <select
                            value={exportFilters.verification}
                            onChange={(e) => setExportFilters(prev => ({ ...prev, verification: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                          >
                            <option value="All">All Identities (Verified & Unverified)</option>
                            <option value="Verified">Verified Only</option>
                            <option value="Unverified">Unverified Only</option>
                          </select>
                        </div>
                      )}

                      {/* 7. Record Timeframe */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Record Timeframe</label>
                        <select
                          value={exportFilters.dateRange}
                          onChange={(e) => setExportFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                        >
                          <option value="All">All Time Records</option>
                          <option value="30d">Last 30 Days</option>
                          <option value="90d">Last 90 Days</option>
                          <option value="this_year">Current Calendar Year</option>
                        </select>
                      </div>

                      {/* 8. Industry Sector (Relevant for ALL, ALUMNI, EMPLOYER) */}
                      {['ALL', 'ALUMNI', 'EMPLOYER'].includes(activePortalTab) && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sector / Industry Scope</label>
                          <select
                            value={exportFilters.industry}
                            onChange={(e) => setExportFilters(prev => ({ ...prev, industry: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                          >
                            <option value="All">All Sectors & Partners</option>
                            <option value="Technology">Technology & Software</option>
                            <option value="Telecommunications">Telecommunications</option>
                            <option value="Banking">Banking & Financial</option>
                            <option value="Government">Government & Academic</option>
                          </select>
                        </div>
                      )}

                      {/* 9. Data Source / Origin (Relevant for ALL, REGISTRAR, ADMIN) */}
                      {['ALL', 'REGISTRAR', 'ADMIN'].includes(activePortalTab) && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Data Source / Origin</label>
                          <select
                            value={exportFilters.source}
                            onChange={(e) => setExportFilters(prev => ({ ...prev, source: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003580]"
                          >
                            <option value="All">All Sources (Admin Provision, Self-Reg, SIS Import)</option>
                            <option value="Admin">Admin Portal Provisioned</option>
                            <option value="SelfReg">Self-Registered Student</option>
                            <option value="SIS">Registrar SIS DB Sync</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column Selector & Reorder Cards Section */}
                  <div className="space-y-3 border-t border-slate-200 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-emerald-600" />
                          Select & Reorder Export Columns (Sequence #1 – #{columnSequence.length})
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Use the ◀ / ▶ arrows on any column card to dynamically adjust its output position in the CSV header</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAllExportColumns(true)}
                          className="text-[10px] font-bold text-[#003580] hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => toggleAllExportColumns(false)}
                          className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                        >
                          Deselect All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={resetColumnSequence}
                          className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset Order
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-[320px] overflow-y-auto">
                      {columnSequence.map((col, idx) => {
                        const isChecked = exportColumns[col.key];
                        return (
                          <div
                            key={col.key}
                            className={`flex items-center justify-between gap-1 p-2 rounded-xl border transition-all ${
                              isChecked
                                ? 'bg-white border-emerald-300 shadow-xs'
                                : 'bg-slate-100/70 border-slate-200 opacity-60'
                            }`}
                          >
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none truncate">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => setExportColumns(prev => ({ ...prev, [col.key]: e.target.checked }))}
                                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                              />
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-md shrink-0">
                                  #{idx + 1}
                                </span>
                                <span className="truncate">{col.label}</span>
                              </span>
                            </label>

                            <div className="flex items-center gap-0.5 shrink-0 ml-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveColumnSequence(idx, 'up')}
                                className="w-5 h-5 rounded hover:bg-slate-100 text-slate-500 hover:text-emerald-700 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
                                title="Move Left in CSV sequence"
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === columnSequence.length - 1}
                                onClick={() => moveColumnSequence(idx, 'down')}
                                className="w-5 h-5 rounded hover:bg-slate-100 text-slate-500 hover:text-emerald-700 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
                                title="Move Right in CSV sequence"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer with Multi-Format Options */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer w-full sm:w-auto text-center"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
                <button
                  type="button"
                  onClick={executeCopySummary}
                  disabled={isExportLoading || exportMatchedUsers.length === 0}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  title="Copy formatted text summary to clipboard"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-slate-600" />
                  <span>Copy Summary</span>
                </button>

                <button
                  type="button"
                  onClick={executeExportJSON}
                  disabled={isExportLoading || exportMatchedUsers.length === 0}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  title="Export raw structured JSON data dump"
                >
                  <Code className="h-3.5 w-3.5 text-[#003580]" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={executeExportCSV}
                  disabled={isExportLoading || exportMatchedUsers.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#002866] via-[#003580] to-emerald-700 hover:from-[#001e4d] hover:to-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
                >
                  {isExportLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>{isExportLoading ? 'Fetching Data...' : `Generate & Download CSV (${exportMatchedUsers.length})`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Import History Audit Modal */}
      {isImportHistoryOpen && createPortal(
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/80 backdrop-blur-md z-[999999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-300/80 my-auto flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002866] via-[#003580] to-[#004b99] px-6 py-4 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner shrink-0">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold tracking-tight">CSV & SIS Data Import History</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">AUDIT LOGS</span>
                  </div>
                  <p className="text-xs text-blue-100/80 mt-0.5">Real-time database sync records & CSV batch import history</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportHistoryOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Import Batches</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{importLogs.length}</div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Records Imported</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {importLogs.reduce((acc, log) => acc + (log.recordsCount || 0), 0)}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Latest Sync Status</div>
                  <div className="text-sm font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Active & Verified</span>
                  </div>
                </div>
              </div>

              {/* Import History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-[#003580]" />
                    Import Trajectory & Audit Trail ({importLogs.length} logs)
                  </h4>
                  <button
                    type="button"
                    onClick={fetchImportLogs}
                    disabled={loadingImportLogs}
                    className="text-xs font-bold text-[#003580] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${loadingImportLogs ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Import Date & Time</th>
                        <th className="px-4 py-3">Records Count</th>
                        <th className="px-4 py-3">Import Source / Type</th>
                        <th className="px-4 py-3">Sync Status</th>
                        <th className="px-4 py-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingImportLogs ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#003580]" />
                            <span>Loading import history records...</span>
                          </td>
                        </tr>
                      ) : importLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            No import logs recorded yet.
                          </td>
                        </tr>
                      ) : (
                        importLogs.map((log, idx) => (
                          <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-slate-800">
                              <div>{format(new Date(log.syncedAt), 'MMM d, yyyy · HH:mm')}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{formatDistanceToNow(new Date(log.syncedAt), { addSuffix: true })}</div>
                            </td>
                            <td className="px-4 py-3.5 font-black text-slate-900">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                {log.recordsCount} records
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                <span>Registrar Office SIS Sync</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                log.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-rose-100 text-rose-800 border-rose-300'
                              }`}>
                                <CheckCircle2 className="h-3 w-3" />
                                {log.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-medium text-slate-500">
                              {log.errors ? (
                                <span className="text-rose-600 font-semibold">{log.errors}</span>
                              ) : (
                                <span className="text-emerald-700 font-semibold">100% Validated</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">ASTU Enterprise Directory Sync Audit</span>
              <button
                type="button"
                onClick={() => setIsImportHistoryOpen(false)}
                className="px-5 py-2 bg-[#003580] hover:bg-[#002866] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Close History
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Advanced Multi-Portal Filtering Modal */}
      <AdminModal
        open={isAdvancedFilterModalOpen}
        onClose={() => setIsAdvancedFilterModalOpen(false)}
        title="Advanced Multi-Portal Query Engine"
        size="xl"
      >
        <div className="space-y-5">
          {/* Top Decorative Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#001F4D] via-indigo-900 to-slate-900 text-white shadow-md flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-sky-300 border border-white/10 shrink-0">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">6-Portal Enterprise Filter Matrix</h4>
                <p className="text-[11px] text-slate-300">Tailor query scope for Alumni, Employers, Registrar, Department Heads, CMS & System Admins</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-sky-300">
                {advancedFilterCount} Active Parameters
              </span>
            </div>
          </div>

          {/* Portal Tabs Navigation Bar (6 Portals) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
            {[
              { key: 'ALUMNI', label: 'Alumni Portal', icon: GraduationCap, color: 'text-indigo-600' },
              { key: 'EMPLOYER', label: 'Employer Portal', icon: Building2, color: 'text-amber-600' },
              { key: 'REGISTRAR', label: 'Registrar Staff', icon: Shield, color: 'text-emerald-600' },
              { key: 'DEPARTMENT', label: 'Department Head', icon: BookOpen, color: 'text-purple-600' },
              { key: 'CMS', label: 'CMS Manager', icon: Newspaper, color: 'text-teal-600' },
              { key: 'ADMIN', label: 'System Admin', icon: UserCog, color: 'text-rose-600' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilterPortalTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilterPortalTab(tab.key as any)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#001F4D] text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-sky-300' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Portal Filter Criteria Panes */}
          <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            {activeFilterPortalTab === 'ALUMNI' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-indigo-600" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">Alumni Directory Criteria</h5>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Filter tracer surveys & graduation records</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Graduation Batch Year</label>
                    <select
                      value={advancedFilters.batchYear}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, batchYear: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Batch Years</option>
                      {['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'].map(b => (
                        <option key={b} value={b}>Batch {b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Identity Verification</label>
                    <select
                      value={advancedFilters.verificationStatus}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, verificationStatus: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Verified Alumni">Verified Alumni</option>
                      <option value="Pending Identity Check">Pending Identity Check</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Employment Status</label>
                    <select
                      value={advancedFilters.employmentStatus}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, employmentStatus: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Employment Types</option>
                      <option value="Employed">Employed (Full-Time)</option>
                      <option value="Seeking Opportunity">Seeking Opportunity</option>
                      <option value="Postgraduate Student">Postgraduate Student</option>
                      <option value="Entrepreneur">Entrepreneur / Founder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Degree Distinction</label>
                    <select
                      value={advancedFilters.degreeLevel}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, degreeLevel: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Degrees</option>
                      <option value="B.Sc. Degree">B.Sc. Undergraduate</option>
                      <option value="M.Sc. Master">M.Sc. Master's Degree</option>
                      <option value="Ph.D. Doctorate">Ph.D. Doctorate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Academic Performance (CGPA)</label>
                    <select
                      value={advancedFilters.cgpaThreshold}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, cgpaThreshold: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All CGPA Ranges</option>
                      <option value="Above 3.50">3.50+ (First Class Distinction)</option>
                      <option value="3.00 - 3.49">3.00 – 3.49 (Very Good)</option>
                      <option value="Below 3.00">Below 3.00</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Tracer Survey Participation</label>
                    <select
                      value={advancedFilters.tracerSurvey}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, tracerSurvey: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Survey Statuses</option>
                      <option value="Submitted Tracer Survey">Submitted Tracer Survey</option>
                      <option value="Pending Survey Response">Pending Survey Response</option>
                      <option value="Opted Out">Opted Out</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Work Experience Range</label>
                    <select
                      value={advancedFilters.workExperience}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, workExperience: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Experience Levels</option>
                      <option value="Fresh Graduate (0-1 Yrs)">Fresh Graduate (0-1 Yrs)</option>
                      <option value="Mid-Career (2-5 Yrs)">Mid-Career (2-5 Yrs)</option>
                      <option value="Experienced (5-10 Yrs)">Experienced (5-10 Yrs)</option>
                      <option value="Senior Leader (10+ Yrs)">Senior Leader (10+ Yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Current Residence / Region</label>
                    <select
                      value={advancedFilters.residenceRegion}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, residenceRegion: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Regions</option>
                      <option value="Addis Ababa HQ">Addis Ababa HQ</option>
                      <option value="Adama & Oromia">Adama & Oromia Region</option>
                      <option value="Regional Hubs">Regional Hubs</option>
                      <option value="International Diaspora">International Diaspora</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeFilterPortalTab === 'EMPLOYER' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-600" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">Employer Portal Criteria</h5>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Filter recruiting partners & company profiles</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Industry Sector</label>
                    <select
                      value={advancedFilters.industrySector}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, industrySector: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Industry Sectors</option>
                      <option value="Technology & Enterprise">Technology & Software</option>
                      <option value="Fintech & Banking">Fintech & Banking</option>
                      <option value="Engineering & Manufacturing">Engineering & Manufacturing</option>
                      <option value="Government & Public">Government & Public</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Company Scale</label>
                    <select
                      value={advancedFilters.companySize}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, companySize: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Company Sizes</option>
                      <option value="Enterprise (500+)">Enterprise (500+ Employees)</option>
                      <option value="Medium Scale (50-499)">Medium Scale (50–499 Employees)</option>
                      <option value="Startup (<50)">Startup / Small Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">HR Official Verification</label>
                    <select
                      value={advancedFilters.hrVerified}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, hrVerified: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Accounts</option>
                      <option value="Verified HR Official">Verified HR Official</option>
                      <option value="Pending HR Review">Pending HR Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Active Job Postings</label>
                    <select
                      value={advancedFilters.activeJobPosts}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, activeJobPosts: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Employers</option>
                      <option value="Has Active Job Postings">Has Active Job Postings</option>
                      <option value="Direct Hiring Partner">Direct Hiring Partner</option>
                      <option value="No Current Postings">No Current Postings</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Internship Program Partner</label>
                    <select
                      value={advancedFilters.internshipOffer}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, internshipOffer: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Partners</option>
                      <option value="Offers Student Internships">Offers Student Internships</option>
                      <option value="Full-Time Hiring Only">Full-Time Hiring Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">ASTU Partnership MOU</label>
                    <select
                      value={advancedFilters.mouStatus}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, mouStatus: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Agreement Statuses</option>
                      <option value="Active MOU Partner">Active MOU Partner (Signed)</option>
                      <option value="Standard Employer">Standard Employer Account</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeFilterPortalTab === 'REGISTRAR' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">Registrar Portal Criteria</h5>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Filter academic record clearance officers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Security Access Level</label>
                    <select
                      value={advancedFilters.securityLevel}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, securityLevel: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Security Levels</option>
                      <option value="Level 3 (Senior Registrar)">Level 3 (Senior Registrar)</option>
                      <option value="Level 2 (Officer)">Level 2 (Officer)</option>
                      <option value="Level 1 (Data Clerk)">Level 1 (Data Clerk)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Record Sync State</label>
                    <select
                      value={advancedFilters.recordSyncState}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, recordSyncState: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Sync States</option>
                      <option value="Synced with Core DB">Synced with Core DB</option>
                      <option value="Pending Sync">Pending Sync</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Clearance Duty Authority</label>
                    <select
                      value={advancedFilters.clearanceDuty}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, clearanceDuty: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Duty Scope</option>
                      <option value="Graduation Clearance Officer">Graduation Clearance Officer</option>
                      <option value="Transcript Issuance Officer">Transcript Issuance Officer</option>
                      <option value="Student Audit Clerk">Student Audit Clerk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Audit Log Compliance</label>
                    <select
                      value={advancedFilters.auditLogStatus}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, auditLogStatus: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Audit Logs</option>
                      <option value="Verified Compliant Log">Verified Compliant Log</option>
                      <option value="Flagged Security Audit Log">Flagged Security Audit Log</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeFilterPortalTab === 'DEPARTMENT' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">Department Head Criteria</h5>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Filter faculty chairs & department heads</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Faculty School</label>
                    <select
                      value={advancedFilters.facultyScope}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, facultyScope: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Faculty Schools</option>
                      <option value="School of Computing & IT">School of Computing & IT</option>
                      <option value="School of Electrical Eng.">School of Electrical Eng.</option>
                      <option value="School of Civil & Mech.">School of Civil & Mech.</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Supervisory Level</label>
                    <select
                      value={advancedFilters.supervisoryLevel}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, supervisoryLevel: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Roles</option>
                      <option value="Department Chair">Department Chair</option>
                      <option value="Associate Head">Associate Head</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Academic Rank / Title</label>
                    <select
                      value={advancedFilters.academicRank}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, academicRank: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Ranks</option>
                      <option value="Full Professor">Full Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Department Chair">Department Chair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Research & Academic Focus</label>
                    <select
                      value={advancedFilters.researchScope}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, researchScope: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Academic Program Focus</option>
                      <option value="Undergraduate Curriculum Chair">Undergraduate Curriculum Chair</option>
                      <option value="Postgraduate & Research Supervisory">Postgraduate & Research Supervisory</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeFilterPortalTab === 'CMS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-teal-600" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">CMS Manager Criteria</h5>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Filter news editors & content managers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Editorial Scope</label>
                    <select
                      value={advancedFilters.cmsRoleScope}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, cmsRoleScope: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Scope Permissions</option>
                      <option value="All Portal & News Content">All Portal & News Content</option>
                      <option value="Alumni Stories Only">Alumni Stories Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Publishing Rights</label>
                    <select
                      value={advancedFilters.publishingAuthority}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, publishingAuthority: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Permissions</option>
                      <option value="Direct Auto-Publish">Direct Auto-Publish</option>
                      <option value="Review & Approval Required">Review & Approval Required</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Media Asset License</label>
                    <select
                      value={advancedFilters.mediaLicense}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, mediaLicense: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Asset Rights</option>
                      <option value="Full Asset Library Access">Full Asset Library Access</option>
                      <option value="Article Author Rights">Article Author Rights</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeFilterPortalTab === 'ADMIN' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-rose-600" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">System Admin Criteria</h5>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Filter SuperAdmins & System Officers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Administration Level</label>
                    <select
                      value={advancedFilters.adminPrivilege}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, adminPrivilege: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Privileges</option>
                      <option value="Full Super Admin">Full Super Admin</option>
                      <option value="User & Role Administrator">User & Role Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Two-Factor Auth (2FA)</label>
                    <select
                      value={advancedFilters.hasTwoFactor}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, hasTwoFactor: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All 2FA States</option>
                      <option value="2FA Enforced & Active">2FA Enforced & Active</option>
                      <option value="2FA Pending Setup">2FA Pending Setup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Security Alert Status</label>
                    <select
                      value={advancedFilters.securityAlert}
                      onChange={(e) => {
                        setAdvancedFilters(prev => ({ ...prev, securityAlert: e.target.value }));
                      }}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
                    >
                      <option value="All">All Alerts</option>
                      <option value="Normal Operation">Normal Operation</option>
                      <option value="Multi-Location Login Warning">Multi-Location Login Warning</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAdvancedFilters({
                  batchYear: 'All',
                  verificationStatus: 'All',
                  employmentStatus: 'All',
                  degreeLevel: 'All',
                  cgpaThreshold: 'All',
                  tracerSurvey: 'All',
                  workExperience: 'All',
                  residenceRegion: 'All',
                  industrySector: 'All',
                  companySize: 'All',
                  hrVerified: 'All',
                  activeJobPosts: 'All',
                  internshipOffer: 'All',
                  mouStatus: 'All',
                  jobActivity: 'All',
                  securityLevel: 'All',
                  clearanceScope: 'All',
                  clearanceDuty: 'All',
                  auditLogStatus: 'All',
                  recordSyncState: 'All',
                  facultyScope: 'All',
                  supervisoryLevel: 'All',
                  academicRank: 'All',
                  researchScope: 'All',
                  approvalAuthority: 'All',
                  cmsRoleScope: 'All',
                  publishingRights: 'All',
                  publishingAuthority: 'All',
                  mediaLicense: 'All',
                  adminPrivilege: 'All',
                  hasTwoFactor: 'All',
                  securityAudit: 'All',
                  securityAlert: 'All',
                });
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset Multi-Portal Parameters</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAdvancedFilterModalOpen(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#001F4D] to-indigo-700 hover:from-indigo-900 hover:to-indigo-800 text-white text-xs font-bold transition-all shadow-md shadow-indigo-900/15 flex items-center gap-2 cursor-pointer"
            >
              <Check className="h-4 w-4 text-sky-300" />
              <span>Apply Multi-Portal Filters ({advancedFilterCount})</span>
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Dedicated Reset Password Modal */}
      {resetPasswordModalUser && (
        <AdminModal
          open={Boolean(resetPasswordModalUser)}
          onClose={() => setResetPasswordModalUser(null)}
          title={`Reset Account Password — ${resetPasswordModalUser.name}`}
        >
          <div className="space-y-4 p-2">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
              <KeyRound className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Password Security Notice</strong>
                Resetting the password will update the user's password in the system, generate a secure credential, and send a notification to <strong>{resetPasswordModalUser.email}</strong>.
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                New Temporary Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={resetPasswordInputValue}
                  onChange={(e) => setResetPasswordInputValue(e.target.value)}
                  placeholder="Enter custom password or click generate"
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setResetPasswordInputValue(generatePassword())}
                  className="absolute right-2 px-2.5 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Auto-Gen
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetPasswordModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetPasswordSubmitting || !resetPasswordInputValue.trim()}
                onClick={handleExecuteResetPassword}
                className="px-4 py-2 rounded-xl bg-[#001F4D] hover:bg-indigo-900 text-xs font-bold text-white shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resetPasswordSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Reset &amp; Save Password</span>
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Dedicated Change Role Modal */}
      {changeRoleModalUser && (
        <AdminModal
          open={Boolean(changeRoleModalUser)}
          onClose={() => setChangeRoleModalUser(null)}
          title={`Change System Role — ${changeRoleModalUser.name}`}
        >
          <div className="space-y-4 p-2">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#003580] shrink-0" />
              <div>
                Current Account Role: <strong className="font-extrabold uppercase">{changeRoleModalUser.role}</strong> ({changeRoleModalUser.department})
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { role: 'Alumni', label: '🎓 Alumni Portal', desc: 'Graduates, tracer surveys & alumni services' },
                { role: 'Employer', label: '🏢 Employer Portal', desc: 'Corporate partners, job postings & hiring' },
                { role: 'Department Head', label: '🎓 Department Head', desc: 'Faculty leadership & department survey dispatches' },
                { role: 'Registrar', label: '🏛️ Registrar Office', desc: 'SIS record sync, student data & verification' },
                { role: 'CMS Manager', label: '📰 CMS Manager', desc: 'Alumni Office news, events & portal content' },
                { role: 'Admin', label: '⚡ ICT Technical Admin', desc: 'System infrastructure & technical ops' },
                { role: 'Super Admin', label: '👑 Super Admin', desc: 'Root executive governance & full permissions' },
              ].map((item) => {
                const isSelected = selectedRoleForChange === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRoleForChange(item.role as Role)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#003580] bg-[#003580]/10 ring-2 ring-[#003580]/30 font-bold text-[#003580]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setChangeRoleModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={changeRoleSubmitting}
                onClick={handleExecuteChangeRole}
                className="px-4 py-2 rounded-xl bg-[#001F4D] hover:bg-indigo-900 text-xs font-bold text-white shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {changeRoleSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Update User Role</span>
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  badge,
  badgeType = 'neutral',
  children,
}: {
  label: string;
  error?: string;
  badge?: string;
  badgeType?: 'locked' | 'editable' | 'required' | 'neutral';
  children: React.ReactNode;
}) {
  const badgeClasses = {
    locked: 'bg-amber-50 text-amber-700 border-amber-200/80',
    editable: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    required: 'bg-rose-50 text-rose-700 border-rose-200/80',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
          {label}
        </label>
        {badge && (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClasses[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>
      {children}
      {error && <span className="block text-xs font-medium text-rose-500 mt-1">{error}</span>}
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span className="max-w-[55%] text-right text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

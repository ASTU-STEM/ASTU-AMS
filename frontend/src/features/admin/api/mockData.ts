import { format, formatDistanceToNow } from 'date-fns';

export function formatRelativeTimestamp(value: string | Date) {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export function formatHoverTimestamp(value: string | Date) {
  return format(new Date(value), 'PPpp');
}

const departments = [
  'Software Engineering',
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
];

const statuses = ['Active', 'Pending Verification', 'Suspended', 'Inactive'] as const;
const batches = ['2020', '2021', '2022', '2023', '2024'];

const alumniNames = [
  'Abebe Kebede',
  'Mekdes Ayele',
  'Tigist Haile',
  'Dawit Getachew',
  'Saron Demissie',
  'Henok Asfaw',
  'Liya Kebede',
  'Mikias Tadesse',
  'Rahel Solomon',
  'Samuel Bekele',
  'Biruktawit Tesfaye',
  'Fikiru Yilma',
  'Marta Wolde',
  'Yohannes Alemu',
  'Selamawit Tadesse',
  'Natan Kassa',
  'Hanna Girma',
  'Mulugeta Adane',
  'Elsabet Degu',
  'Tesfaye Yigzaw',
];

export const alumniUsers = alumniNames.map((name, index) => {
  const department = departments[index % departments.length];
  const batch = batches[index % batches.length];
  const status = statuses[index % statuses.length];
  const yearsAgo = 1 + (index % 4);
  const loginHours = 4 + index * 2;

  return {
    id: `USR-${String(index + 1).padStart(3, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@astu.edu.et`,
    studentId: `ASTU/${1000 + index}/20${18 + (index % 5)}`,
    role: 'Alumni',
    department,
    batch,
    status,
    lastLogin: new Date(Date.now() - loginHours * 60 * 60 * 1000).toISOString(),
    registeredAt: new Date(Date.now() - yearsAgo * 365 * 24 * 60 * 60 * 1000).toISOString(),
    phone: `+251 91${100 + index} ${200 + index}`,
    adminNotes: index % 3 === 0 ? 'Verified by registrar workflow.' : 'Profile synced with graduation records.',
  };
});

export const employers = [
  { id: 'EMP-001', name: 'Ethio Telecom', sector: 'Telecommunications', contact: 'hr@ethiotelecom.et', alumniHired: 34 },
  { id: 'EMP-002', name: 'Safaricom Ethiopia', sector: 'Telecommunications', contact: 'talent@safaricom.et', alumniHired: 29 },
  { id: 'EMP-003', name: 'INSA', sector: 'Public Sector', contact: 'careers@insa.gov.et', alumniHired: 25 },
  { id: 'EMP-004', name: 'Ethiopian Airlines', sector: 'Aviation', contact: 'recruitment@ethiopianairlines.com', alumniHired: 21 },
  { id: 'EMP-005', name: 'Huawei Ethiopia', sector: 'Technology', contact: 'jobs@huawei.com', alumniHired: 18 },
];

export const departmentStats = [
  { id: 'DEP-001', name: 'Software Engineering', college: 'Computing', head: 'Dr. Meseret Alemu', totalGraduates: 824, employmentRate: 92, activeAlumni: 641, avgSalary: 20500, topSector: 'Software' },
  { id: 'DEP-002', name: 'Computer Science', college: 'Computing', head: 'Dr. Sisay Mengesha', totalGraduates: 910, employmentRate: 88, activeAlumni: 703, avgSalary: 19800, topSector: 'Data & AI' },
  { id: 'DEP-003', name: 'Electrical Engineering', college: 'Engineering', head: 'Dr. Tadesse Bekele', totalGraduates: 680, employmentRate: 84, activeAlumni: 512, avgSalary: 18400, topSector: 'Energy' },
  { id: 'DEP-004', name: 'Mechanical Engineering', college: 'Engineering', head: 'Dr. Hana Asefa', totalGraduates: 610, employmentRate: 81, activeAlumni: 468, avgSalary: 17500, topSector: 'Manufacturing' },
  { id: 'DEP-005', name: 'Civil Engineering', college: 'Engineering', head: 'Dr. Alemu Kassa', totalGraduates: 555, employmentRate: 79, activeAlumni: 401, avgSalary: 16900, topSector: 'Construction' },
  { id: 'DEP-006', name: 'Chemical Engineering', college: 'Engineering', head: 'Dr. Helen Fekadu', totalGraduates: 442, employmentRate: 77, activeAlumni: 333, avgSalary: 17250, topSector: 'Industry' },
];

export const surveyResponses = Array.from({ length: 10 }).map((_, index) => ({
  id: `SUR-R-${index + 1}`,
  surveyName: `${[6, 12, 24][index % 3]}-Month Tracer Survey`,
  batch: batches[index % batches.length],
  respondent: alumniUsers[index].name,
  responseDate: new Date(Date.now() - (index + 1) * 36 * 60 * 60 * 1000).toISOString(),
  completion: 58 + (index % 5) * 7,
  salaryRange: ['ETB 10k-15k', 'ETB 15k-20k', 'ETB 20k-25k'][index % 3],
  employmentStatus: ['Employed', 'Self-Employed', 'Further Study', 'Unemployed'][index % 4],
}));

export const jobPostings = Array.from({ length: 10 }).map((_, index) => {
  const types = ['Full-time', 'Internship', 'Part-time'] as const;
  const statusList = ['Active', 'Scheduled', 'Closed'] as const;
  return {
    id: `JOB-${String(index + 1).padStart(3, '0')}`,
    title: [
      'Backend Engineer',
      'Data Analyst Intern',
      'Systems Administrator',
      'Graduate Trainee',
      'Project Coordinator',
      'QA Engineer',
      'Network Engineer',
      'Product Designer',
      'IT Support Officer',
      'Research Assistant',
    ][index],
    employer: employers[index % employers.length].name,
    type: types[index % types.length],
    postedAt: new Date(Date.now() - (index + 2) * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000).toISOString(),
    applicants: 12 + index * 4,
    status: statusList[index % statusList.length],
    featured: index % 4 === 0,
  };
});

export const systemLogs = Array.from({ length: 20 }).map((_, index) => {
  const actionTypes = ['Login', 'Data Import', 'User Action', 'Error', 'System', 'API'] as const;
  const severities = ['Info', 'Warning', 'Error', 'Success'] as const;
  const roles = ['Admin', 'Registrar', 'Department Head', 'Employer', 'Alumni'] as const;
  return {
    id: `LOG-${String(index + 1).padStart(3, '0')}`,
    timestamp: new Date(Date.now() - (index + 1) * 35 * 60 * 1000).toISOString(),
    userEmail: index % 5 === 0 ? 'admin@astu.edu.et' : `user${index + 1}@astu.edu.et`,
    role: roles[index % roles.length],
    action: actionTypes[index % actionTypes.length],
    details:
      index % 4 === 0
        ? 'Background sync completed successfully.'
        : index % 4 === 1
          ? 'Imported alumni batch file and validated 245 records.'
          : index % 4 === 2
            ? 'Updated role permissions for department staff.'
            : 'A validation error was captured during form submission.',
    ipAddress: `154.78.22.${10 + index}`,
    severity: severities[index % severities.length],
    requestId: `REQ-${String(1000 + index)}`,
    payload: `{"row":${index + 1},"source":"mock"}`,
  };
});

export const dashboardOverview = {
  stats: [
    { label: 'Total Alumni', value: '4,827', trend: '+124 this year', tone: 'blue' as const },
    { label: 'Total Employers', value: '312', trend: '+18 this month', tone: 'gold' as const },
    { label: 'Survey Completion', value: '68.4%', trend: '+5.2% vs last year', tone: 'green' as const },
    { label: 'Active Jobs', value: '47', trend: '12 expiring soon', tone: 'purple' as const },
  ],
  employmentRateByDepartment: [
    { department: 'SE', value: 92 },
    { department: 'ME', value: 84 },
    { department: 'CE', value: 89 },
    { department: 'EE', value: 77 },
    { department: 'CHE', value: 95 },
    { department: 'IE', value: 81 },
  ],
  surveyCompletion: [
    { name: 'Completed', value: 68, color: '#1D9E75' },
    { name: 'Pending', value: 22, color: '#E8A020' },
    { name: 'Never Responded', value: 10, color: '#E24B4A' },
  ],
  employmentTrends: [
    { year: '2020', employed: 61, selfEmployed: 14 },
    { year: '2021', employed: 65, selfEmployed: 16 },
    { year: '2022', employed: 70, selfEmployed: 18 },
    { year: '2023', employed: 74, selfEmployed: 20 },
    { year: '2024', employed: 79, selfEmployed: 23 },
  ],
  hiringCompanies: [
    { name: 'Ethio Telecom', hires: 34 },
    { name: 'Safaricom', hires: 29 },
    { name: 'INSA', hires: 25 },
    { name: 'Ethiopian Airlines', hires: 21 },
    { name: 'Huawei', hires: 18 },
    { name: 'UN Ethiopia', hires: 15 },
    { name: 'CBE', hires: 12 },
  ],
  activities: [
    { type: 'success', text: 'CSV import completed - 245 records', time: '2 minutes ago' },
    { type: 'info', text: 'New employer registered: Safaricom', time: '17 minutes ago' },
    { type: 'warning', text: 'Survey #3 sent to 2024 batch', time: '41 minutes ago' },
    { type: 'success', text: 'Role permissions updated for registrar staff', time: '1 hour ago' },
    { type: 'warning', text: 'Backup queue rescheduled for midnight', time: '3 hours ago' },
    { type: 'danger', text: 'Suspicious login attempt blocked', time: '5 hours ago' },
  ],
  pendingActions: [
    { label: '142 alumni accounts pending verification', action: 'Verify', tone: '#003580' },
    { label: '8 document requests awaiting approval', action: 'Review', tone: '#E8A020' },
    { label: '3 new employer registrations', action: 'Approve', tone: '#1D9E75' },
    { label: 'Survey Wave 3 due in 5 days', action: 'Manage', tone: '#7C3AED' },
  ],
  skillGaps: [
    { skill: 'Cloud Computing', value: 78 },
    { skill: 'DevOps', value: 71 },
    { skill: 'AI/ML', value: 65 },
    { skill: 'Cyber Security', value: 58 },
    { skill: 'Data Engineering', value: 52 },
  ],
};

export const analyticsOverview = {
  keyMetrics: [
    { label: 'Overall Employment Rate', value: '76.8%', tone: 'blue' as const },
    { label: 'Average Time to Hire', value: '4.2 months', tone: 'gold' as const },
    { label: 'Avg Starting Salary', value: 'ETB 18,500/mo', tone: 'green' as const },
    { label: 'Alumni Response Rate', value: '68.4%', tone: 'purple' as const },
  ],
  employmentByDepartmentYear: [
    { department: 'Software Engineering', y2022: 84, y2023: 88, y2024: 92 },
    { department: 'Computer Science', y2022: 78, y2023: 84, y2024: 88 },
    { department: 'Electrical Engineering', y2022: 72, y2023: 79, y2024: 84 },
    { department: 'Mechanical Engineering', y2022: 70, y2023: 76, y2024: 81 },
    { department: 'Civil Engineering', y2022: 68, y2023: 73, y2024: 79 },
    { department: 'Chemical Engineering', y2022: 66, y2023: 71, y2024: 77 },
  ],
  skillGapTop10: [
    { skill: 'Cloud Computing', value: 92 },
    { skill: 'DevOps', value: 88 },
    { skill: 'AI / ML', value: 84 },
    { skill: 'Cyber Security', value: 79 },
    { skill: 'Data Engineering', value: 74 },
    { skill: 'Communication', value: 69 },
    { skill: 'Leadership', value: 65 },
    { skill: 'Project Management', value: 61 },
    { skill: 'Product Thinking', value: 55 },
    { skill: 'Research Methods', value: 49 },
  ],
  skillGapHeatMap: departments.map((department, index) => ({
    department,
    cloud: 40 + index * 5,
    devops: 35 + index * 4,
    ai: 30 + index * 6,
    security: 28 + index * 4,
    data: 42 + index * 3,
  })),
  employerRadar: [
    { subject: 'Technical', score: 4.5 },
    { subject: 'Communication', score: 4.1 },
    { subject: 'Leadership', score: 3.9 },
    { subject: 'Teamwork', score: 4.3 },
    { subject: 'Problem Solving', score: 4.6 },
    { subject: 'Innovation', score: 4.0 },
  ],
  employerFeedbackEntries: Array.from({ length: 6 }).map((_, index) => ({
    company: employers[index % employers.length].name,
    score: 4.1 + (index % 3) * 0.2,
    note: index % 2 === 0 ? 'Strong technical foundation.' : 'Needs better communication readiness.',
    submittedAt: new Date(Date.now() - (index + 1) * 8 * 24 * 60 * 60 * 1000).toISOString(),
  })),
  geoDistribution: [
    { name: 'Addis Ababa', value: 41 },
    { name: 'Adama', value: 15 },
    { name: 'Dire Dawa', value: 12 },
    { name: 'Mekelle', value: 9 },
    { name: 'Nairobi', value: 8 },
  ],
  timeToHireTrend: [
    { batch: '2018', months: 6.5 },
    { batch: '2019', months: 6.1 },
    { batch: '2020', months: 5.7 },
    { batch: '2021', months: 5.2 },
    { batch: '2022', months: 4.8 },
    { batch: '2023', months: 4.4 },
    { batch: '2024', months: 4.2 },
  ],
  departmentYearTable: [
    { department: 'Software Engineering', grads: 824, employed: 758, selfEmployed: 42, unemployed: 24, rate: '92%', vsLastYear: '+4.2%' },
    { department: 'Computer Science', grads: 910, employed: 801, selfEmployed: 53, unemployed: 56, rate: '88%', vsLastYear: '+3.8%' },
    { department: 'Electrical Engineering', grads: 680, employed: 571, selfEmployed: 41, unemployed: 68, rate: '84%', vsLastYear: '+3.1%' },
    { department: 'Mechanical Engineering', grads: 610, employed: 494, selfEmployed: 39, unemployed: 77, rate: '81%', vsLastYear: '+2.4%' },
  ],
  jobsPostedByMonth: [
    { month: 'Jan', jobs: 12 },
    { month: 'Feb', jobs: 15 },
    { month: 'Mar', jobs: 19 },
    { month: 'Apr', jobs: 22 },
    { month: 'May', jobs: 17 },
    { month: 'Jun', jobs: 24 },
  ],
  applicationFunnel: [
    { stage: 'Posted', value: 120 },
    { stage: 'Applied', value: 86 },
    { stage: 'Shortlisted', value: 35 },
    { stage: 'Hired', value: 18 },
  ],
};

export const surveyManagementMock = {
  surveys: [
    { id: 'SUR-001', name: '6-Month Tracer Survey', targetBatch: '2024', type: '6-Month', sent: 240, responded: 162, completion: 68, status: 'Active' },
    { id: 'SUR-002', name: '12-Month Employment Survey', targetBatch: '2023', type: '12-Month', sent: 220, responded: 134, completion: 61, status: 'Closed' },
    { id: 'SUR-003', name: '24-Month Career Survey', targetBatch: '2022', type: '24-Month', sent: 198, responded: 118, completion: 60, status: 'Scheduled' },
  ],
  waves: [
    { batch: '2024', surveyType: '6-Month', scheduledDate: '2026-06-03', recipients: 240, status: 'Scheduled' },
    { batch: '2023', surveyType: '12-Month', scheduledDate: '2026-06-12', recipients: 220, status: 'Processing' },
    { batch: '2022', surveyType: '24-Month', scheduledDate: '2026-06-20', recipients: 198, status: 'Sent' },
  ],
  analytics: {
    completion: [
      { name: 'Completed', value: 68, color: '#1D9E75' },
      { name: 'Pending', value: 22, color: '#E8A020' },
      { name: 'Never Responded', value: 10, color: '#E24B4A' },
    ],
    responseTrend: [
      { month: 'Jan', value: 32 },
      { month: 'Feb', value: 41 },
      { month: 'Mar', value: 53 },
      { month: 'Apr', value: 59 },
      { month: 'May', value: 68 },
      { month: 'Jun', value: 72 },
    ],
    employmentStatus: [
      { name: 'Employed', value: 63 },
      { name: 'Self-Employed', value: 19 },
      { name: 'Further Study', value: 11 },
      { name: 'Unemployed', value: 7 },
    ],
    salaryRange: [
      { range: '10k-15k', value: 12 },
      { range: '15k-20k', value: 28 },
      { range: '20k-25k', value: 31 },
      { range: '25k+', value: 17 },
    ],
    industryDistribution: [
      { industry: 'Technology', value: 34 },
      { industry: 'Telecom', value: 20 },
      { industry: 'Finance', value: 17 },
      { industry: 'Construction', value: 13 },
      { industry: 'Public Sector', value: 10 },
      { industry: 'Manufacturing', value: 6 },
    ],
  },
};

export const adminMockData = {
  alumniUsers,
  employers,
  departments: departmentStats,
  surveyResponses,
  jobPostings,
  systemLogs,
  dashboardOverview,
  analyticsOverview,
  surveyManagement: surveyManagementMock,
};

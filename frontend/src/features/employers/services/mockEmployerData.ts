import { CompanyProfile, EmployerJob, CandidateApplication, GraduateFeedback, Message } from '../types/employer.types';

const defaultProfile: CompanyProfile = {
  name: 'Google Ethiopia Innovation Hub',
  registrationNumber: 'EIT-9928-2024',
  industry: 'Technology & Software Development',
  website: 'https://google.com.et',
  location: 'Addis Ababa, ICT Park',
  hrName: 'Selamawit Girma',
  hrEmail: 'selamawit.g@google.com',
  hrPhone: '+251 912 345 678',
  logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
  description: 'Google Ethiopia is focused on empowering local developers, fostering tech entrepreneurship, and deploying localized cloud and search offerings across East Africa.'
};

const defaultJobs: EmployerJob[] = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    type: 'Full-Time',
    location: 'Addis Ababa (Hybrid)',
    salaryRange: '120,000 - 150,000 ETB/mo',
    experienceRequired: '3-5 years',
    description: 'We are seeking a senior systems builder to construct developer checkout web panels, transaction logs, and cloud microservices.',
    skillsRequired: ['React', 'TypeScript', 'Node.js', 'Go', 'Kubernetes'],
    status: 'Open',
    postedDate: '5 days ago',
    applicationsCount: 24,
    shortlistedCount: 8,
    viewsCount: 342
  },
  {
    id: 2,
    title: 'Product Manager',
    type: 'Full-Time',
    location: 'Remote',
    salaryRange: '90,000 - 110,000 ETB/mo',
    experienceRequired: '2-4 years',
    description: 'Lead engineering roadmaps, aggregate feature requests, and run design sprints for mobile wallets.',
    skillsRequired: ['Agile', 'Product Strategy', 'Figma', 'Analytics'],
    status: 'Open',
    postedDate: '2 weeks ago',
    applicationsCount: 18,
    shortlistedCount: 6,
    viewsCount: 256
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    type: 'Full-Time',
    location: 'Addis Ababa',
    salaryRange: '80,000 - 100,000 ETB/mo',
    experienceRequired: '1-3 years',
    description: 'Craft beautiful customer user flows, high-fidelity mockups, and run user research surveys.',
    skillsRequired: ['Figma', 'UI Design', 'Wireframing', 'Prototyping'],
    status: 'Open',
    postedDate: '1 week ago',
    applicationsCount: 32,
    shortlistedCount: 10,
    viewsCount: 418
  }
];

const defaultApplications: CandidateApplication[] = [
  {
    id: 1,
    jobId: 1,
    jobTitle: 'Senior Full-Stack Engineer',
    alumnusName: 'Abebe Bikila',
    alumnusEmail: 'abebe.bikila@astu.edu.et',
    cgpa: '3.78',
    department: 'Computer Science and Engineering',
    graduationYear: '2024',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'SQL'],
    status: 'Shortlisted',
    appliedDate: '3 days ago',
    cvFileName: 'Abebe_Bikila_CV.pdf'
  },
  {
    id: 2,
    jobId: 1,
    jobTitle: 'Senior Full-Stack Engineer',
    alumnusName: 'Kalkidan Yosef',
    alumnusEmail: 'kalkidan.yosef@astu.edu.et',
    cgpa: '3.82',
    department: 'Computer Science and Engineering',
    graduationYear: '2023',
    skills: ['React', 'Redux', 'Python', 'Docker'],
    status: 'Pending',
    appliedDate: '2 days ago',
    cvFileName: 'Kalkidan_CV.pdf'
  },
  {
    id: 3,
    jobId: 3,
    jobTitle: 'UX/UI Designer',
    alumnusName: 'Elias Tadesse',
    alumnusEmail: 'elias.t@astu.edu.et',
    cgpa: '3.54',
    department: 'Electrical and Computer Engineering',
    graduationYear: '2024',
    skills: ['Figma', 'Photoshop', 'CSS', 'HTML'],
    status: 'Pending',
    appliedDate: '4 days ago',
    cvFileName: 'Elias_Tadesse_Portfolio.pdf'
  }
];

const defaultFeedback: GraduateFeedback[] = [
  {
    id: 1,
    alumnusName: 'Abebe Bikila',
    department: 'Computer Science and Engineering',
    technicalSkills: 5,
    communication: 4,
    leadership: 4,
    teamwork: 5,
    problemSolving: 5,
    comments: 'Abebe is an exceptional problem solver. His foundational training at ASTU in algorithm optimization is outstanding. Communication is solid.',
    submittedAt: 'May 12, 2026'
  }
];

const defaultMessages: Message[] = [
  {
    id: 1,
    sender: 'Alumni',
    senderName: 'Abebe Bikila',
    text: 'Hello, I submitted my application for the Fullstack role. I am extremely eager to join and wanted to ask about the tech stack details.',
    timestamp: '10:30 AM',
    unread: true
  },
  {
    id: 2,
    sender: 'Employer',
    senderName: 'Selamawit Girma',
    text: 'Hi Abebe, we build with React, TypeScript, and Go on the backend. Your skills align nicely.',
    timestamp: '11:15 AM',
    unread: false
  }
];

// Helper methods for LocalStorage access
export const getCompanyProfile = (): CompanyProfile => {
  const profileStr = localStorage.getItem('employer_profile');
  if (profileStr) {
    try { return JSON.parse(profileStr); } catch { return defaultProfile; }
  }
  return defaultProfile;
};

export const saveCompanyProfile = (profile: CompanyProfile): void => {
  localStorage.setItem('employer_profile', JSON.stringify(profile));
};

export const getEmployerJobs = (): EmployerJob[] => {
  const jobsStr = localStorage.getItem('employer_jobs');
  if (jobsStr) {
    try { return JSON.parse(jobsStr); } catch { return defaultJobs; }
  }
  return defaultJobs;
};

export const saveEmployerJobs = (jobs: EmployerJob[]): void => {
  localStorage.setItem('employer_jobs', JSON.stringify(jobs));
};

export const getCandidateApplications = (): CandidateApplication[] => {
  const appsStr = localStorage.getItem('employer_applications');
  if (appsStr) {
    try { return JSON.parse(appsStr); } catch { return defaultApplications; }
  }
  return defaultApplications;
};

export const saveCandidateApplications = (apps: CandidateApplication[]): void => {
  localStorage.setItem('employer_applications', JSON.stringify(apps));
};

export const getGraduateFeedback = (): GraduateFeedback[] => {
  const fbStr = localStorage.getItem('employer_feedback');
  if (fbStr) {
    try { return JSON.parse(fbStr); } catch { return defaultFeedback; }
  }
  return defaultFeedback;
};

export const saveGraduateFeedback = (fb: GraduateFeedback[]): void => {
  localStorage.setItem('employer_feedback', JSON.stringify(fb));
};

export const getEmployerMessages = (): Message[] => {
  const msgStr = localStorage.getItem('employer_messages');
  if (msgStr) {
    try { return JSON.parse(msgStr); } catch { return defaultMessages; }
  }
  return defaultMessages;
};

export const saveEmployerMessages = (msg: Message[]): void => {
  localStorage.setItem('employer_messages', JSON.stringify(msg));
};

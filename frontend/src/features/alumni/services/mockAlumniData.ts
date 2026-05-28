import { 
  AlumniProfile, 
  CareerMilestone, 
  JobMatch, 
  TracerSurvey, 
  Mentor, 
  CareerEvent, 
  DocumentRequest, 
  AlumniPreferences 
} from '../types/alumni.types';

// Default mock profile with social links, CGPA, and salary range
const defaultProfile: AlumniProfile = {
  fullName: 'Abebe Bikila',
  email: 'abebe.bikila@astu.edu.et',
  phone: '+251 911 234 567',
  studentId: 'ASTU/1024/14',
  batch: "Class of '18",
  department: 'Computer Science and Engineering',
  cgpa: '3.78',
  currentRole: 'Junior Fullstack Engineer',
  company: 'Chapa Financial Technologies',
  salaryRange: '30,001 - 60,000 ETB',
  bio: 'A passionate ASTU Computer Science and Engineering alumnus interested in building scalable fintech solutions, APIs, and modern responsive React web applications.',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7rhHWBnOkWV1xWVC1HCSOzZwYhELqmvpSOzjKGmJ3QT9TkogaTK1A-VFzyS2wFdRCyz1RPhDUnlP_MiltJbq474wk-J0Hy58LqjlIXdUewPZ7RW2ySloQgh-_OSmwjVC1CDIGlrJYVf-girKkZdSApD6aHXWeguIrLeNIpZr62hAY5d6aFvI83jB92w3mmbGBsn4lIuvqN0WRJVdQ_EoXDHNzeJEbPEco-5mwZoLz4ZRrnorLI2LyJrUdUUoGmyjMYj7_ay9KPUjw',
  skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'SQL'],
  resume: {
    fileName: 'Abebe_Bikila_CV.pdf',
    fileSize: '1.2 MB',
    uploadedAt: 'May 12, 2026'
  },
  linkedInUrl: 'https://linkedin.com/in/abebe-bikila-astu',
  gitHubUrl: 'https://github.com/abebe-bikila'
};

// Default career progression timeline
const defaultMilestones: CareerMilestone[] = [
  {
    id: 1,
    year: '2025 - Present',
    title: 'Junior Fullstack Engineer',
    company: 'Chapa Financial Technologies',
    description: 'Work on developer checkout experiences, API integrations, and frontend payment forms.',
    type: 'professional'
  },
  {
    id: 2,
    year: '2024',
    title: 'BSc in Computer Science and Engineering',
    company: 'Adama Science and Technology University',
    description: 'Graduated with Great Distinction. Completed thesis project on Automated Tracer Study Systems.',
    type: 'academic'
  },
  {
    id: 3,
    year: '2023',
    title: 'Software DevOps Intern',
    company: 'Safaricom Telecommunications',
    description: 'Assisted in building frontend customer portals and deploying CI/CD deployment pipelines.',
    type: 'professional'
  }
];

// Job listings with Internships and Saved status
const defaultJobs: JobMatch[] = [
  {
    id: 1,
    title: 'Senior Software Engineer (FinTech)',
    company: 'Ethio Telecom Innovation Lab',
    location: 'Addis Ababa (Hybrid)',
    salary: '120,000 - 150,000 ETB/mo',
    postedDate: '2 days ago',
    match: '92%',
    description: 'Ethio Telecom is looking for a talented Senior Software Engineer to join our newly established digital financial services division. You will work on expanding Telebirr Core features and micro-services.',
    requirements: [
      '5+ years experience in software development with Node.js, Spring Boot, or Go.',
      'Strong knowledge of microservices architecture and Kubernetes.',
      'Previous experience with high-throughput transactional database engines.',
      'BSc or MSc in Computer Science, Engineering, or a related technical discipline.'
    ],
    benefits: [
      'Top-tier salary package with performance bonuses.',
      'Full comprehensive health cover for you and your direct dependents.',
      'Continuous learning budget with sponsored technical certifications.',
      'State-of-the-art office spaces inside Addis Ababa Innovation Center.'
    ],
    applied: false,
    saved: false,
    type: 'Full-Time'
  },
  {
    id: 2,
    title: 'Graduate Product Manager Intern',
    company: 'GetirGetyar Tech',
    location: 'Remote',
    salary: '25,000 - 35,000 ETB/mo',
    postedDate: '5 days ago',
    match: '87%',
    description: 'GetirGetyar is seeking a passionate product management intern to help direct roadmap goals and compile user feature requests.',
    requirements: [
      'Current student or recent graduate in CSE, ECE, or Business Management.',
      'Keen interest in e-commerce, product analysis, and wireframing.',
      'Outstanding communication and data-driven analytical skills.'
    ],
    benefits: [
      '100% remote flexibility with home office stipends.',
      'Path to permanent Full-Time role upon completion.',
      'Direct mentorship from co-founders and executive leadership.'
    ],
    applied: false,
    saved: true,
    type: 'Internship'
  },
  {
    id: 3,
    title: 'Data Scientist / AI Specialist',
    company: 'DataCon Africa',
    location: 'Addis Ababa (On-site)',
    salary: '110,000 - 140,000 ETB/mo',
    postedDate: '1 week ago',
    match: '89%',
    description: 'DataCon is building data pipelines and analytical engines for banking and telecommunications groups across East Africa. Join us to develop predictive models and generative AI bots.',
    requirements: [
      'Strong programming proficiency in Python, R, or Scala.',
      'Solid experience with machine learning toolkits (Scikit-Learn, PyTorch).',
      'Knowledge of cloud services (AWS or Azure ML Studio).',
      'A degree from an institution known for tech excellence like ASTU.'
    ],
    benefits: [
      'Access to state-of-the-art computing hardware.',
      'Flexible working arrangements with core remote days.',
      'Generous gym and swimming club corporate memberships.',
      'Supported research publications and conference attendance.'
    ],
    applied: false,
    saved: false,
    type: 'Full-Time'
  },
  {
    id: 4,
    title: 'Web Frontend Developer Intern',
    company: 'Chapa Financial Technologies',
    location: 'Addis Ababa',
    salary: '20,000 - 30,000 ETB/mo',
    postedDate: '3 days ago',
    match: '95%',
    description: 'Safaricom is expanding its customer-facing web interfaces. We need a frontend engineer expert in React, Tailwind, and State Management libraries to build responsive dashboards.',
    requirements: [
      'Strong knowledge of React, TypeScript, and CSS layouts.',
      'Good eye for pixel-perfect implementations of Figma wireframes.',
      'Excellent collaborative and agile workflow mindset.'
    ],
    benefits: [
      'Subsidized transport and lunch allowances.',
      'Sponsored technical certifications.',
      'Dynamic creative work environment.'
    ],
    applied: false,
    saved: false,
    type: 'Internship'
  }
];

// Automated Tracer Survey Status: 6-Month, 12-Month, 24-Month
const defaultSurveys: TracerSurvey[] = [
  {
    id: 1,
    title: 'ASTU 6-Month Graduate Tracer Study',
    description: 'Monitors early-stage employment status, transition times from college to career, and entry-level salary distributions.',
    deadline: 'December 30, 2024',
    status: 'COMPLETED',
    completedAt: 'Dec 15, 2024',
    type: '6-Month',
    questions: []
  },
  {
    id: 2,
    title: 'ASTU 12-Month Longitudinal Career Tracer Study',
    description: 'Monitors intermediate-stage career progression, employment rates, job search durations, and curriculum alignment with daily tasks.',
    deadline: 'March 15, 2026',
    status: 'PENDING',
    type: '12-Month',
    questions: [
      {
        id: 'emp_status',
        text: 'What is your current primary employment status?',
        type: 'select',
        options: ['Employed Full-Time', 'Employed Part-Time', 'Self-Employed (Entrepreneur)', 'Unemployed & Seeking Work', 'Enrolled in Graduate Studies']
      },
      {
        id: 'search_duration',
        text: 'How long did it take you to secure your first job after graduating from ASTU?',
        type: 'select',
        options: ['Secured before graduation', '1-3 months', '4-6 months', '7-12 months', 'More than 1 year']
      },
      {
        id: 'salary_range',
        text: 'What is your current gross monthly salary range (ETB)?',
        type: 'select',
        options: ['Under 15,000 ETB', '15,000 - 30,000 ETB', '30,001 - 60,000 ETB', '60,001 - 100,000 ETB', 'Over 100,000 ETB']
      },
      {
        id: 'skill_relevance',
        text: 'Rate the relevance of ASTU technical and practical training to your current job requirements:',
        type: 'select',
        options: ['Extremely Relevant', 'Highly Relevant', 'Neutral', 'Slightly Relevant', 'Irrelevant']
      },
      {
        id: 'curriculum_usefulness',
        text: 'In your opinion, what crucial technologies or topics should ASTU introduce in the syllabus?',
        type: 'text'
      }
    ]
  },
  {
    id: 3,
    title: 'ASTU 24-Month Industry Curriculum Feedback Tracer',
    description: 'A deep audit measuring long-term technological skill-gaps and industry training relevance for quality audits.',
    deadline: 'September 30, 2026',
    status: 'PENDING',
    type: '24-Month',
    questions: [
      {
        id: 'career_progression',
        text: 'Have you received any professional promotion or job transition in the last 12 months?',
        type: 'select',
        options: ['Yes, promoted internally', 'Yes, changed company for higher role', 'No change', 'Not applicable']
      },
      {
        id: 'skill_gap_feedback',
        text: 'Identify the largest technical skill gaps you observed when transitioning from ASTU labs to advanced corporate projects:',
        type: 'text'
      }
    ]
  }
];

// Mentors with scheduled sessions mock
const defaultMentors: Mentor[] = [
  {
    id: 1,
    name: 'Dr. Yosef Kebede',
    role: 'Senior Staff Engineer',
    company: 'Google',
    batch: "Class of '10",
    department: 'Electrical and Computer Engineering',
    skills: ['System Design', 'Cloud Infrastructure', 'Go', 'Python'],
    bio: 'Yosef has over 12 years of experience building massive scale distributed systems. He is passionate about mentoring junior developers and guiding ASTU engineering students in their career plans.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    status: 'AVAILABLE',
    sessions: [
      {
        id: 1,
        date: 'June 5, 2026',
        time: '4:00 PM - 5:00 PM',
        topic: 'Resume Architecture & Google Interview Prep',
        status: 'Scheduled',
        meetLink: 'https://meet.google.com/abc-defg-hij'
      }
    ]
  },
  {
    id: 2,
    name: 'Helina Sileshi',
    role: 'Co-Founder & Chief Architect',
    company: 'Summit Tech Solutions',
    batch: "Class of '14",
    department: 'Computer Science and Engineering',
    skills: ['Mobile Architecture', 'React Native', 'Node.js', 'FinTech'],
    bio: 'Helina co-founded a prominent software house in East Africa. She enjoys sharing startup insights, technology scaling advice, and helping young computer science graduates structure their portfolios.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    status: 'CONNECTED',
    sessions: []
  },
  {
    id: 3,
    name: 'Michael Tilahun',
    role: 'Director of Artificial Intelligence',
    company: 'DataCon Africa',
    batch: "Class of '12",
    department: 'Mechanical and Vehicle Engineering',
    skills: ['Machine Learning', 'Computer Vision', 'Robotics', 'Matlab'],
    bio: 'Michael pivoted from mechanical systems to machine learning and AI architecture. He can mentor on the math behind neural networks, model deployments, and switching career paths successfully.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    status: 'AVAILABLE',
    sessions: []
  }
];

// Document Services (Transcripts, Certificates, Verification requests)
const defaultDocuments: DocumentRequest[] = [
  {
    id: 1,
    type: 'Official Transcript',
    requestDate: 'May 10, 2026',
    status: 'Approved',
    notes: 'Official transcript signed, stamped, and dispatched to Addis Ababa University registrar.'
  },
  {
    id: 2,
    type: 'Degree Verification',
    requestDate: 'May 24, 2026',
    status: 'In Progress',
    notes: 'Awaiting signature verification from Department Head office.'
  }
];

// Settings preferences
const defaultPreferences: AlumniPreferences = {
  emailJobs: true,
  emailSurveys: true,
  emailMentorship: true,
  profileVisibleToEmployers: true,
  profileVisibleToPeers: true
};

const defaultEvents: CareerEvent[] = [
  {
    id: 1,
    title: 'ASTU Annual Tech Career Expo 2026',
    date: 'June 30, 2026',
    location: 'ASTU Main Campus, Networking Hall',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    category: 'Career Fair',
    description: 'Connect directly with recruiters from over 50 leading companies, tech startups, and government organizations. Opportunities for full-time job offers, internships, and partnership discussions.',
    registered: false
  },
  {
    id: 2,
    title: 'Tracer Survey Launch & Alumni Reunion',
    date: 'July 18, 2026',
    location: 'Adama Science and Technology University Main Campus',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    category: 'Reunion',
    description: 'Celebrate ASTU legacy and network with outstanding alumni. Includes high-profile discussion panels detailing the impact of tracer data and skill-gaps analysis in accreditation standards.',
    registered: false
  },
  {
    id: 3,
    title: 'Technical Resume & Interview Preparation Workshop',
    date: 'June 15, 2026',
    location: 'Virtual Event (Zoom Link Provided upon Registration)',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    category: 'Workshop',
    description: 'Learn best practices on structuring your software portfolio, optimizing CVs for ATS trackers, and tackling technical live coding and system design interviews.',
    registered: false
  }
];

// Helper methods for LocalStorage access
export const getAlumniProfile = (): AlumniProfile => {
  const profileStr = localStorage.getItem('alumni_profile');
  if (profileStr) {
    try { return JSON.parse(profileStr); } catch { return defaultProfile; }
  }
  return defaultProfile;
};

export const saveAlumniProfile = (profile: AlumniProfile): void => {
  localStorage.setItem('alumni_profile', JSON.stringify(profile));
};

export const getMilestones = (): CareerMilestone[] => {
  const mStr = localStorage.getItem('alumni_milestones');
  if (mStr) {
    try { return JSON.parse(mStr); } catch { return defaultMilestones; }
  }
  return defaultMilestones;
};

export const saveMilestones = (milestones: CareerMilestone[]): void => {
  localStorage.setItem('alumni_milestones', JSON.stringify(milestones));
};

export const getJobMatches = (): JobMatch[] => {
  const jobsStr = localStorage.getItem('alumni_jobs');
  if (jobsStr) {
    try { return JSON.parse(jobsStr); } catch { return defaultJobs; }
  }
  return defaultJobs;
};

export const saveJobMatches = (jobs: JobMatch[]): void => {
  localStorage.setItem('alumni_jobs', JSON.stringify(jobs));
};

export const getTracerSurveys = (): TracerSurvey[] => {
  const surveysStr = localStorage.getItem('alumni_surveys');
  if (surveysStr) {
    try { return JSON.parse(surveysStr); } catch { return defaultSurveys; }
  }
  return defaultSurveys;
};

export const saveTracerSurveys = (surveys: TracerSurvey[]): void => {
  localStorage.setItem('alumni_surveys', JSON.stringify(surveys));
};

export const getMentors = (): Mentor[] => {
  const mentorsStr = localStorage.getItem('alumni_mentors');
  if (mentorsStr) {
    try { return JSON.parse(mentorsStr); } catch { return defaultMentors; }
  }
  return defaultMentors;
};

export const saveMentors = (mentors: Mentor[]): void => {
  localStorage.setItem('alumni_mentors', JSON.stringify(mentors));
};

export const getDocumentRequests = (): DocumentRequest[] => {
  const docsStr = localStorage.getItem('alumni_documents');
  if (docsStr) {
    try { return JSON.parse(docsStr); } catch { return defaultDocuments; }
  }
  return defaultDocuments;
};

export const saveDocumentRequests = (docs: DocumentRequest[]): void => {
  localStorage.setItem('alumni_documents', JSON.stringify(docs));
};

export const getAlumniPreferences = (): AlumniPreferences => {
  const prefsStr = localStorage.getItem('alumni_preferences');
  if (prefsStr) {
    try { return JSON.parse(prefsStr); } catch { return defaultPreferences; }
  }
  return defaultPreferences;
};

export const saveAlumniPreferences = (prefs: AlumniPreferences): void => {
  localStorage.setItem('alumni_preferences', JSON.stringify(prefs));
};

export const getCareerEvents = (): CareerEvent[] => {
  const eventsStr = localStorage.getItem('alumni_events');
  if (eventsStr) {
    try { return JSON.parse(eventsStr); } catch { return defaultEvents; }
  }
  return defaultEvents;
};

export const saveCareerEvents = (events: CareerEvent[]): void => {
  localStorage.setItem('alumni_events', JSON.stringify(events));
};

// Calculate profile completion percentage based on fields filled
export const calculateCompletion = (profile: AlumniProfile): number => {
  let filledFields = 0;
  let totalFields = 10; // fullName, phone, currentRole, company, bio, avatarUrl, skills, resume, linkedIn, gitHub

  if (profile.fullName.trim()) filledFields++;
  if (profile.phone.trim()) filledFields++;
  if (profile.currentRole.trim()) filledFields++;
  if (profile.company.trim()) filledFields++;
  if (profile.bio.trim()) filledFields++;
  if (profile.avatarUrl.trim()) filledFields++;
  if (profile.skills.length > 0) filledFields++;
  if (profile.resume) filledFields++;
  if (profile.linkedInUrl?.trim()) filledFields++;
  if (profile.gitHubUrl?.trim()) filledFields++;

  return Math.round((filledFields / totalFields) * 100);
};

import { 
  AlumniProfile, 
  CareerMilestone, 
  JobMatch, 
  TracerSurvey, 
  Mentor, 
  CareerEvent, 
  DocumentRequest, 
  AlumniPreferences,
  Certification,
  Project,
  Achievement,
  DonationCampaign,
  ForumPost,
  SkillPathway,
  EmployerRating,
  EmployerProfile,
  TelebirrPayment,
  TracerSchedule
} from './types';

const defaultCertifications: Certification[] = [
  { id: "1", name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', issueDate: 'Jan 2025', expiryDate: 'Jan 2028', credentialUrl: 'https://aws.amazon.com/verify', description: 'Foundational cloud knowledge certification.' },
  { id: "2", name: 'Meta Front-End Developer', issuer: 'Meta (Coursera)', issueDate: 'Mar 2025', credentialUrl: 'https://coursera.org/verify', description: 'Professional certificate in React and frontend development.' },
];

const defaultProjects: Project[] = [
  { id: "1", title: 'Automated Tracer Study System', description: 'Full-stack web application for ASTU to automate graduate tracer studies and generate accreditation reports.', technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'], url: 'https://github.com/abebe-bikila/tracer-system', startDate: 'Sep 2023', endDate: 'Jun 2024', role: 'Full Stack Developer' },
  { id: "2", title: 'Telebirr Payment Gateway SDK', description: 'Open-source SDK for integrating Ethio Telecom Telebirr payment API with Node.js applications.', technologies: ['TypeScript', 'Node.js', 'REST API'], url: 'https://github.com/abebe-bikila/telebirr-sdk', startDate: 'Jan 2025', role: 'Maintainer' },
];

const defaultAchievements: Achievement[] = [
  { id: "1", title: 'Best Graduating Thesis Award', description: 'Awarded for outstanding research on automated tracer study systems.', date: 'Jun 2024', type: 'award' },
  { id: "2", title: 'Open Source Contributor of the Month', description: 'Recognized for contributions to Ethiopian fintech open source projects.', date: 'Feb 2025', type: 'recognition' },
];

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
  skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'SQL', 'Docker', 'GraphQL', 'Python', 'Git'],
  resume: {
    fileName: 'Abebe_Bikila_CV.pdf',
    fileSize: '1.2 MB',
    uploadedAt: 'May 12, 2026'
  },
  linkedInUrl: 'https://linkedin.com/in/abebe-bikila-astu',
  gitHubUrl: 'https://github.com/abebe-bikila',
  twitterUrl: 'https://twitter.com/abebe_bikila',
  portfolioUrl: 'https://abebe-bikila.dev',
  certifications: defaultCertifications,
  projects: defaultProjects,
  achievements: defaultAchievements,
  languages: ['English (Fluent)', 'Amharic (Native)', 'Afan Oromo (Intermediate)'],
  volunteerWork: 'Mentor at ASTU Code Club, teaching web development to underclassmen.',
  address: 'Adama, Oromia, Ethiopia',
  nationality: 'Ethiopian',
  dateOfBirth: '1998-05-15',
  gender: 'Male',
  maritalStatus: 'Single',
};

// Default career progression timeline
const defaultMilestones: CareerMilestone[] = [
  {
    id: "1",
    year: '2025 - Present',
    title: 'Junior Fullstack Engineer',
    company: 'Chapa Financial Technologies',
    description: 'Work on developer checkout experiences, API integrations, and frontend payment forms.',
    type: 'professional'
  },
  {
    id: "2",
    year: '2024',
    title: 'BSc in Computer Science and Engineering',
    company: 'Adama Science and Technology University',
    description: 'Graduated with Great Distinction. Completed thesis project on Automated Tracer Study Systems.',
    type: 'academic'
  },
  {
    id: "3",
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
    id: "1",
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
    type: 'Full-Time',
    experience: 'Mid-Level (3-5 years)',
    views: 128,
    applications: 24,
    shortlisted: 7,
    skills: ['Node.js', 'Spring Boot', 'Kubernetes', 'Microservices']
  },
  {
    id: "2",
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
    type: 'Internship',
    experience: 'Entry-Level',
    views: 89,
    applications: 12,
    shortlisted: 3,
    skills: ['Product Management', 'Figma', 'Analytics', 'E-commerce']
  },
  {
    id: "3",
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
    type: 'Full-Time',
    experience: 'Mid-Level (2-4 years)',
    views: 203,
    applications: 31,
    shortlisted: 12,
    skills: ['Python', 'Machine Learning', 'PyTorch', 'AWS']
  },
  {
    id: "4",
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
    type: 'Internship',
    experience: 'Entry-Level',
    views: 156,
    applications: 28,
    shortlisted: 9,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma']
  }
];

// Automated Tracer Survey Status: 6-Month, 12-Month, 24-Month
const defaultSurveys: TracerSurvey[] = [
  {
    id: "1",
    title: 'ASTU 6-Month Graduate Tracer Study',
    description: 'Monitors early-stage employment status, transition times from college to career, and entry-level salary distributions.',
    deadline: 'December 30, 2024',
    status: 'COMPLETED',
    completedAt: 'Dec 15, 2024',
    type: '6-Month',
    questions: []
  },
  {
    id: "2",
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
    id: "3",
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
    id: "1",
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
        id: "1",
        date: 'June 5, 2026',
        time: '4:00 PM - 5:00 PM',
        topic: 'Resume Architecture & Google Interview Prep',
        status: 'Scheduled',
        meetLink: 'https://meet.google.com/abc-defg-hij'
      }
    ]
  },
  {
    id: "2",
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
    id: "3",
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
    id: "1",
    type: 'Official Transcript',
    requestDate: 'May 10, 2026',
    status: 'Approved',
    notes: 'Official transcript signed, stamped, and dispatched to Addis Ababa University registrar.'
  },
  {
    id: "2",
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
  profileVisibleToPeers: true,
  emailEvents: true,
  emailNewsletter: true,
  smsNotifications: false,
  profileVisibleToAlumni: true,
  anonymousTracerResponses: false,
  shareAchievementsPublic: true,
};

const defaultEvents: CareerEvent[] = [
  {
    id: "1",
    title: 'ASTU Annual Tech Career Expo 2026',
    date: 'June 30, 2026',
    location: 'ASTU Main Campus, Networking Hall',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    category: 'Career Fair',
    description: 'Connect directly with recruiters from over 50 leading companies, tech startups, and government organizations. Opportunities for full-time job offers, internships, and partnership discussions.',
    registered: false,
    capacity: 500,
    registeredCount: 234,
    speaker: 'Dr. Tadesse Lemma - VP of Engineering @ Safaricom',
    time: '9:00 AM - 5:00 PM',
    tags: ['networking', 'recruitment', 'career-fair'],
    type: 'in-person'
  },
  {
    id: "2",
    title: 'Tracer Survey Launch & Alumni Reunion',
    date: 'July 18, 2026',
    location: 'Adama Science and Technology University Main Campus',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    category: 'Reunion',
    description: 'Celebrate ASTU legacy and network with outstanding alumni. Includes high-profile discussion panels detailing the impact of tracer data and skill-gaps analysis in accreditation standards.',
    registered: false,
    capacity: 300,
    registeredCount: 112,
    speaker: 'Alumni Panel - Google, Microsoft, Chapa, Safaricom',
    time: '10:00 AM - 8:00 PM',
    tags: ['reunion', 'networking', 'tracer'],
    type: 'in-person'
  },
  {
    id: "3",
    title: 'Technical Resume & Interview Preparation Workshop',
    date: 'June 15, 2026',
    location: 'Virtual Event (Zoom Link Provided upon Registration)',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    category: 'Workshop',
    description: 'Learn best practices on structuring your software portfolio, optimizing CVs for ATS trackers, and tackling technical live coding and system design interviews.',
    registered: false,
    capacity: 200,
    registeredCount: 89,
    speaker: 'Betelhem Dessie - Career Coach @ LinkedIn',
    time: '2:00 PM - 5:00 PM',
    tags: ['workshop', 'resume', 'interview'],
    type: 'virtual',
    virtualLink: 'https://zoom.us/astu-workshop-june15'
  },
  {
    id: "4",
    title: 'AI & Machine Learning Bootcamp',
    date: 'August 5, 2026',
    location: 'ASTU Innovation Hub + Virtual',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
    category: 'Workshop',
    description: 'Intensive 2-day bootcamp on practical AI/ML applications. Cover LLMs, computer vision, and MLOps with hands-on projects.',
    registered: false,
    capacity: 100,
    registeredCount: 45,
    speaker: 'Michael Tilahun - Director of AI @ DataCon Africa',
    time: '9:00 AM - 4:00 PM',
    tags: ['ai', 'machine-learning', 'bootcamp'],
    type: 'hybrid',
    virtualLink: 'https://meet.astu.edu.et/ai-bootcamp'
  }
];

// Helper methods for LocalStorage access
export const getAlumniProfile = (): AlumniProfile => {
  const profileStr = null;
  if (profileStr) {
    try { return JSON.parse(profileStr); } catch { return defaultProfile; }
  }
  return defaultProfile;
};

export const saveAlumniProfile = (profile: AlumniProfile): void => {
  /* Set ignored in backend mock */
};

export const getMilestones = (): CareerMilestone[] => {
  const mStr = null;
  if (mStr) {
    try { return JSON.parse(mStr); } catch { return defaultMilestones; }
  }
  return defaultMilestones;
};

export const saveMilestones = (milestones: CareerMilestone[]): void => {
  /* Set ignored in backend mock */
};

export const getJobMatches = (): JobMatch[] => {
  const jobsStr = null;
  if (jobsStr) {
    try { return JSON.parse(jobsStr); } catch { return defaultJobs; }
  }
  return defaultJobs;
};

export const saveJobMatches = (jobs: JobMatch[]): void => {
  /* Set ignored in backend mock */
};

export const getTracerSurveys = (): TracerSurvey[] => {
  const surveysStr = null;
  if (surveysStr) {
    try { return JSON.parse(surveysStr); } catch { return defaultSurveys; }
  }
  return defaultSurveys;
};

export const saveTracerSurveys = (surveys: TracerSurvey[]): void => {
  /* Set ignored in backend mock */
};

export const getMentors = (): Mentor[] => {
  const mentorsStr = null;
  if (mentorsStr) {
    try { return JSON.parse(mentorsStr); } catch { return defaultMentors; }
  }
  return defaultMentors;
};

export const saveMentors = (mentors: Mentor[]): void => {
  /* Set ignored in backend mock */
};

export const getDocumentRequests = (): DocumentRequest[] => {
  const docsStr = null;
  if (docsStr) {
    try { return JSON.parse(docsStr); } catch { return defaultDocuments; }
  }
  return defaultDocuments;
};

export const saveDocumentRequests = (docs: DocumentRequest[]): void => {
  /* Set ignored in backend mock */
};

export const getAlumniPreferences = (): AlumniPreferences => {
  const prefsStr = null;
  if (prefsStr) {
    try { return JSON.parse(prefsStr); } catch { return defaultPreferences; }
  }
  return defaultPreferences;
};

export const saveAlumniPreferences = (prefs: AlumniPreferences): void => {
  /* Set ignored in backend mock */
};

export const getCareerEvents = (): CareerEvent[] => {
  const eventsStr = null;
  if (eventsStr) {
    try { return JSON.parse(eventsStr); } catch { return defaultEvents; }
  }
  return defaultEvents;
};

export const saveCareerEvents = (events: CareerEvent[]): void => {
  /* Set ignored in backend mock */
};

// New mock data
const defaultDonationCampaigns: DonationCampaign[] = [
  { id: "1", title: 'ASTU Scholarship Fund 2026', description: 'Support underprivileged engineering students with full tuition scholarships.', goal: 5000000, raised: 1850000, deadline: 'Dec 31, 2026', category: 'scholarship', donorCount: 347 },
  { id: "2", title: 'AI Research Lab Equipment', description: 'Fund cutting-edge GPU servers for the new AI research laboratory.', goal: 8000000, raised: 3200000, deadline: 'Sep 30, 2026', category: 'research', donorCount: 156 },
  { id: "3", title: 'Campus Innovation Hub', description: 'Build a modern co-working makerspace and innovation center for students.', goal: 12000000, raised: 5400000, deadline: 'Mar 31, 2027', category: 'infrastructure', donorCount: 289 },
];

const defaultForumPosts: ForumPost[] = [
  { id: "1", author: 'Abebe Bikila', authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64&q=80', authorRole: 'CS Alumni 2018', content: 'Just launched my open-source Telebirr SDK on GitHub! Check it out if you are building fintech solutions in Ethiopia. #opensource #fintech', timestamp: '2h ago', likes: 24, comments: 8, tags: ['opensource', 'fintech', 'telebirr'], liked: true },
  { id: "2", author: 'Helina Sileshi', authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=64&h=64&q=80', authorRole: 'CSE Alumni 2014', content: 'Summit Tech is hiring 3 senior React Native developers! Remote-friendly for ASTU alumni. Send me your CVs directly.', timestamp: '5h ago', likes: 56, comments: 15, tags: ['hiring', 'react-native', 'jobs'], liked: false },
  { id: "3", author: 'Dr. Yosef Kebede', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80', authorRole: 'ECE Alumni 2010', content: 'Happy to announce I will be speaking at the ASTU Career Expo 2026 about system design at Google scale. See you all there!', timestamp: '1d ago', likes: 89, comments: 22, tags: ['career-expo', 'google', 'system-design'], liked: true },
];

const defaultSkillPathways: SkillPathway[] = [
  { id: "1", title: 'Full-Stack Web Development', description: 'Master React, Node.js, and cloud deployment for modern web apps.', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'], duration: '6 months', level: 'intermediate', jobs: ['Full Stack Developer', 'Frontend Engineer', 'Backend Developer'], popularity: 95 },
  { id: "2", title: 'AI & Machine Learning Engineering', description: 'Build production ML pipelines, LLMs, and computer vision systems.', skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'AWS SageMaker', 'LangChain'], duration: '8 months', level: 'advanced', jobs: ['ML Engineer', 'Data Scientist', 'AI Specialist'], popularity: 88 },
  { id: "3", title: 'Cloud & DevOps Engineering', description: 'Master CI/CD, Kubernetes, and cloud infrastructure as code.', skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'Jenkins', 'GitHub Actions'], duration: '5 months', level: 'intermediate', jobs: ['DevOps Engineer', 'Cloud Architect', 'SRE'], popularity: 82 },
  { id: "4", title: 'Mobile App Development', description: 'Build cross-platform mobile apps with React Native and Flutter.', skills: ['React Native', 'Flutter', 'Dart', 'Firebase', 'App Store Connect'], duration: '4 months', level: 'beginner', jobs: ['Mobile Developer', 'React Native Developer', 'Flutter Developer'], popularity: 78 },
  { id: "5", title: 'Cybersecurity Fundamentals', description: 'Learn ethical hacking, network security, and compliance frameworks.', skills: ['Python', 'Kali Linux', 'Wireshark', 'Nmap', 'Metasploit', 'ISO 27001'], duration: '6 months', level: 'intermediate', jobs: ['Security Analyst', 'Penetration Tester', 'Security Engineer'], popularity: 75 },
];

// Calculate profile completion percentage based on fields filled
export const calculateCompletion = (profile: AlumniProfile): number => {
  let filledFields = 0;
  let totalFields = 16;

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
  if (profile.portfolioUrl?.trim()) filledFields++;
  if (profile.certifications && profile.certifications.length > 0) filledFields++;
  if (profile.projects && profile.projects.length > 0) filledFields++;
  if (profile.languages && profile.languages.length > 0) filledFields++;
  if (profile.achievements && profile.achievements.length > 0) filledFields++;
  if (profile.nationality?.trim()) filledFields++;

  return Math.round((filledFields / totalFields) * 100);
};

// New getters/setters
export const getDonationCampaigns = (): DonationCampaign[] => {
  const data = null;
  if (data) { try { return JSON.parse(data); } catch { return defaultDonationCampaigns; } }
  return defaultDonationCampaigns;
};

export const saveDonationCampaigns = (campaigns: DonationCampaign[]): void => {
  /* Set ignored in backend mock */
};

export const getForumPosts = (): ForumPost[] => {
  const data = null;
  if (data) { try { return JSON.parse(data); } catch { return defaultForumPosts; } }
  return defaultForumPosts;
};

export const saveForumPosts = (posts: ForumPost[]): void => {
  /* Set ignored in backend mock */
};

export const getSkillPathways = (): SkillPathway[] => {
  const data = null;
  if (data) { try { return JSON.parse(data); } catch { return defaultSkillPathways; } }
  return defaultSkillPathways;
};

export const saveSkillPathways = (pathways: SkillPathway[]): void => {
  /* Set ignored in backend mock */
};

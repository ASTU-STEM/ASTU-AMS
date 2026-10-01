import { ToolItem } from '../types/tools.types';

export const TOOL_REGISTRY: ToolItem[] = [
  // ─────────────────────────────────────────────────────────────
  // CATEGORY 1 — CAREER & PLANNING (1-6)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'career-goal-builder',
    name: 'Career Goal Builder',
    description: 'Define your 1-year and 3-year target roles, milestone achievements, and key skills to acquire.',
    category: 'career',
    icon: 'track_changes',
    tags: ['Career', 'Goals', 'Planning', 'ASTU'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 5,
    inputFields: [
      { name: 'targetRole1Yr', label: '1-Year Target Role / Position', type: 'text', defaultValue: 'Junior Full-Stack Software Engineer', placeholder: 'e.g. Full-Stack Engineer, Structural Site Engineer' },
      { name: 'targetRole3Yr', label: '3-Year Vision / Leadership Role', type: 'text', defaultValue: 'Senior Tech Lead / System Architect', placeholder: 'e.g. Lead Engineer, Department Manager' },
      { name: 'targetSalary', label: 'Target Monthly Compensation Benchmark (ETB / USD)', type: 'text', defaultValue: '45,000 ETB / month', placeholder: 'e.g. 50,000 ETB or $2,500 USD' },
      { name: 'keySkills', label: 'Primary Skills & Certifications to Master', type: 'textarea', defaultValue: 'React, TypeScript, Python, System Architecture, AWS', placeholder: 'Enter key skills separated by commas...' },
      { name: 'targetEmployerType', label: 'Target Employer Sector', type: 'select', defaultValue: 'ethiopian_tech', options: [
        { label: 'Ethiopian Tech & Telecom (Ethio Telecom, Safaricom, Commercial Bank)', value: 'ethiopian_tech' },
        { label: 'International Remote / Global Engineering ($ USD)', value: 'global_remote' },
        { label: 'High-Growth Tech Startup / Venture Founder', value: 'startup' },
        { label: 'Government, Infrastructure & Industrial Parks', value: 'public_infra' }
      ]}
    ],
    checklistItems: [
      { id: 'cg1', title: 'Define Target 1-Year & 3-Year Roles', description: 'Specify exact job titles and industry specialization.' },
      { id: 'cg2', title: 'Identify Top Technical Competencies', description: 'List frameworks, CAD tools, or domain certifications.' },
      { id: 'cg3', title: 'Set 6-Month Skill Milestone', description: 'Commit to completing 1 major capstone project or certification.' },
      { id: 'cg4', title: 'Set Target Salary & Level Benchmark', description: 'Determine target compensation in ETB or USD.' }
    ]
  },
  {
    id: 'career-roadmap-generator',
    name: 'Career Roadmap Generator',
    description: 'Generate a quarterly step-by-step career progression blueprint starting from your ASTU degree.',
    category: 'career',
    icon: 'alt_route',
    tags: ['Roadmap', 'Progression', 'Engineering', 'Tech'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 3,
    inputFields: [
      { name: 'currentRole', label: 'Current Role / Specialization', type: 'text', defaultValue: 'ASTU Engineering Graduate', placeholder: 'e.g. ASTU Software Engineering Graduate (2024)' },
      { name: 'targetRole', label: 'Target Destination Role (3 Years)', type: 'text', defaultValue: 'Senior Cloud Architecture Lead', placeholder: 'e.g. Lead Embedded Engineer / Systems Architect' },
      { name: 'timeframe', label: 'Target Progression Horizon', type: 'select', defaultValue: '2y', options: [
        { label: '1 Year (Fast Track 4-Quarter Plan)', value: '1y' },
        { label: '2 Years (Standard 8-Quarter Blueprint)', value: '2y' },
        { label: '3 Years (Long-Term Mastery Horizon)', value: '3y' }
      ]},
      { name: 'primaryFocus', label: 'Core Technical Stack / Focus', type: 'textarea', defaultValue: 'Full-Stack Web, Cloud Native, Microservices, DevOps', placeholder: 'List main technical tools and domains...' }
    ]
  },
  {
    id: 'career-path-explorer',
    name: 'Career Path Explorer',
    description: 'Explore high-demand career pathways aligned with your ASTU department and specialization.',
    category: 'career',
    icon: 'explore',
    tags: ['Exploration', 'Departments', 'ASTU', 'Industry'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 4,
    inputFields: [
      { name: 'department', label: 'ASTU Department Chapter', type: 'select', defaultValue: 'swe', options: [
        { label: 'Software Engineering (SWE)', value: 'swe' },
        { label: 'Electrical & Computer Engineering (ECE)', value: 'ece' },
        { label: 'Mechanical Engineering (MEG)', value: 'meg' },
        { label: 'Civil Engineering (CVE)', value: 'cve' },
        { label: 'Chemical Engineering (CHE)', value: 'che' },
        { label: 'Applied Sciences & Biotechnology', value: 'bio' }
      ]},
      { name: 'industrySector', label: 'Target Sector Preference', type: 'select', defaultValue: 'all', options: [
        { label: 'All High-Demand Ethiopian & Global Sectors', value: 'all' },
        { label: 'Tech, AI & Telecom (Ethio Telecom, Safaricom, Tech Hubs)', value: 'tech' },
        { label: 'Banking, Fintech & Payments (CBE, Telebirr, Awash)', value: 'fintech' },
        { label: 'Energy, Infrastructure & Manufacturing (GERD, EEP, EAL)', value: 'infra' },
        { label: 'Global Remote Tech & International Contracting', value: 'remote' }
      ]},
      { name: 'experienceLevel', label: 'Target Career Level', type: 'select', defaultValue: 'entry_mid', options: [
        { label: 'Entry-Level / Graduate Trainee (0-2 Years)', value: 'entry' },
        { label: 'Mid-Level Specialist / Technical Lead (2-5 Years)', value: 'entry_mid' },
        { label: 'Senior Principal / Department Head (5+ Years)', value: 'senior' }
      ]}
    ]
  },
  {
    id: 'career-skills-gap-checker',
    name: 'Career Skills Gap Checker',
    description: 'Compare your verified profile skills against requirements of top Ethiopian and international employers.',
    category: 'career',
    icon: 'rule',
    tags: ['Skills', 'Gap Analysis', 'Jobs', 'ASTU Data'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    requiresProfile: true,
    estimatedMinutes: 2,
    inputFields: [
      { name: 'targetRole', label: 'Target Industry / Position Title', type: 'text', defaultValue: 'Senior Software Engineer', placeholder: 'e.g. Full Stack Developer, Structural Engineer, Cloud Architect' },
      { name: 'targetCompanyType', label: 'Target Employer Environment', type: 'select', defaultValue: 'ethiopia_top', options: [
        { label: 'Top Ethiopian Enterprise (Ethio Telecom, Safaricom, CBE, Telebirr)', value: 'ethiopia_top' },
        { label: 'High-Growth Tech Startup / Innovation Hub', value: 'startup' },
        { label: 'International Remote Tech Firm ($ USD Compensation)', value: 'international' }
      ]},
      { name: 'customSkills', label: 'Additional Skills to Audit (Optional)', type: 'textarea', placeholder: 'Enter additional technical skills, certifications, or tools separated by commas...' }
    ]
  },
  {
    id: 'personal-development-plan',
    name: 'Personal Development Plan (PDP)',
    description: 'Build a structured 30/60/90-day action plan for career acceleration and skill enhancement.',
    category: 'career',
    icon: 'edit_calendar',
    tags: ['PDP', '30-60-90', 'Habits', 'Growth'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 6,
    inputFields: [
      { name: 'targetGoal', label: 'Primary 90-Day Career Milestone', type: 'text', defaultValue: 'Master System Architecture & Earn Lead Position' },
      { name: 'focusDomain', label: 'Specialization Focus', type: 'text', defaultValue: 'Full Stack Software Engineering' }
    ]
  },
  {
    id: 'target-employer-research',
    name: 'Target Employer Intelligence Explorer',
    description: 'Deep corporate research on Ethio Telecom, Safaricom, CBE, Telebirr, and global tech firms hiring ASTU grads.',
    category: 'career',
    icon: 'domain',
    tags: ['Employers', 'Research', 'Salaries', 'Ethiopia'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'targetCompany', label: 'Target Employer Name', type: 'text', defaultValue: 'Ethio Telecom / Safaricom Ethiopia', placeholder: 'e.g. Commercial Bank of Ethiopia, EagleLion, ICog' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // CATEGORY 2 — CV, COVER LETTERS & APPLICATIONS (7-11)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cv-builder',
    name: 'ASTU Professional CV Builder',
    description: 'Professional resume builder with live interactive preview, multi-template styling, ATS score audit & PDF export.',
    category: 'cv',
    icon: 'badge',
    tags: ['CV', 'Resume', 'Professional', 'ATS', 'PDF', 'ASTU'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 8,
    inputFields: [
      { name: 'targetRole', label: 'Target Job Title', type: 'text', defaultValue: 'Senior Full-Stack Software Engineer' },
      { name: 'cvTemplate', label: 'Template Styling', type: 'select', defaultValue: 'astu_official', options: [
        { label: 'ASTU Official Academic & ATS Standard', value: 'astu_official' },
        { label: 'Modern Minimalist (Indigo Accent)', value: 'flowcv_modern' },
        { label: 'Executive Tech & Systems Lead (Navy/Gold)', value: 'executive_tech' },
        { label: 'Compact Single-Page Developer (Dark Accent)', value: 'compact_dev' }
      ]},
      { name: 'keyAchievements', label: 'Key Accomplishments & Capstone Projects', type: 'textarea', defaultValue: 'Designed distributed ASTU Senior Capstone Project with high throughput API architecture.' }
    ]
  },
  {
    id: 'cover-letter-generator',
    name: 'AI Cover Letter Generator',
    description: 'Generate high-impact, company-tailored cover letters matched against target job descriptions.',
    category: 'jobs',
    icon: 'description',
    tags: ['Cover Letter', 'AI', 'Tailored', 'Jobs'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 3,
    inputFields: [
      { name: 'companyName', label: 'Target Company / Organization', type: 'text', defaultValue: 'Ethio Telecom' },
      { name: 'jobTitle', label: 'Target Position Title', type: 'text', defaultValue: 'Software Systems Engineer' },
      { name: 'jobDescription', label: 'Job Description Keywords / Highlights', type: 'textarea', placeholder: 'Paste job requirements or key responsibilities...' }
    ]
  },
  {
    id: 'portfolio-project-planner',
    name: 'Portfolio Project Planner',
    description: 'Outline production-grade capstone engineering portfolio projects that prove technical mastery.',
    category: 'cv',
    icon: 'folder_special',
    tags: ['Portfolio', 'Projects', 'GitHub', 'Engineering'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 5,
    inputFields: [
      { name: 'projectType', label: 'Project Domain', type: 'text', defaultValue: 'Distributed Enterprise Cloud API' }
    ]
  },
  {
    id: 'application-tracker-pro',
    name: 'Job Application Pipeline Tracker',
    description: 'Manage and track your job application pipeline from submission to interview rounds and job offers.',
    category: 'jobs',
    icon: 'view_kanban',
    tags: ['Tracker', 'Pipeline', 'Jobs', 'Interviews'],
    toolType: 'GUIDED_WORKFLOW',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'activeApplicationsCount', label: 'Active Applications in Progress', type: 'number', defaultValue: 5 }
    ]
  },
  {
    id: 'cv-ats-score-checker',
    name: 'Resume ATS Score & Keyword Audit',
    description: 'Parse your CV against ATS scanner rules to detect missing keywords, formatting errors, and match percentage.',
    category: 'cv',
    icon: 'fact_check',
    tags: ['ATS', 'Score', 'Keywords', 'Audit'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'targetKeywords', label: 'Target Job Description Keywords', type: 'textarea', defaultValue: 'React, Node.js, Microservices, System Architecture, PostgreSQL, Docker' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // CATEGORY 3 — INTERVIEW PREPARATION & NEGOTIATION (12-15)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'interview-question-generator',
    name: 'Role-Specific Interview Question Generator',
    description: 'Generate STAR behavioral and technical mock interview questions tailored to your ASTU engineering field.',
    category: 'interviews',
    icon: 'help_outline',
    tags: ['Interview', 'Questions', 'STAR', 'Technical'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 4,
    inputFields: [
      { name: 'targetRole', label: 'Interview Position Title', type: 'text', defaultValue: 'Senior Software Engineer' },
      { name: 'interviewType', label: 'Interview Round Type', type: 'select', defaultValue: 'technical_arch', options: [
        { label: 'Technical & System Architecture Round', value: 'technical_arch' },
        { label: 'Behavioral & Leadership (STAR Method)', value: 'behavioral' },
        { label: 'Coding & Data Structures Live Session', value: 'coding' },
        { label: 'HR & Management Cultural Fit', value: 'hr_fit' }
      ]}
    ]
  },
  {
    id: 'mock-interview-simulator',
    name: 'AI Mock Interview Simulator',
    description: 'Simulate live interview scenarios with AI feedback, response scoring, and improvement suggestions.',
    category: 'interviews',
    icon: 'record_voice_over',
    tags: ['Mock Interview', 'AI Simulator', 'Feedback'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 6,
    inputFields: [
      { name: 'targetRole', label: 'Role Title', type: 'text', defaultValue: 'Full Stack Engineer' }
    ]
  },
  {
    id: 'salary-negotiation-copilot',
    name: 'Salary & Compensation Negotiation Copilot',
    description: 'Ethiopian & global tech salary benchmarks with negotiation scripts, counter-offer tactics, and equity evaluation.',
    category: 'interviews',
    icon: 'payments',
    tags: ['Salary', 'Negotiation', 'Benchmark', 'Compensation'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'offeredSalary', label: 'Initial Salary Offer (ETB or USD)', type: 'text', defaultValue: '35,000 ETB / month' },
      { name: 'targetSalary', label: 'Target Desired Salary', type: 'text', defaultValue: '50,000 ETB / month' }
    ]
  },
  {
    id: 'elevator-pitch-builder',
    name: '30-Second Elevator Pitch Builder',
    description: 'Craft a compelling 30-second personal introduction for networking, job fairs, and recruiter interviews.',
    category: 'interviews',
    icon: 'record_voice_over',
    tags: ['Pitch', 'Branding', 'Networking'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'targetAudience', label: 'Target Audience', type: 'text', defaultValue: 'Tech Recruiters & Engineering Leads' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // CATEGORY 4 — ACADEMIC, POSTGRADUATE & RESEARCH (16-21)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'gpa-calculator',
    name: 'ASTU Semester GPA Calculator',
    description: 'Calculate your exact credit-weighted semester GPA with ASTU grading scales and grade point averages.',
    category: 'academic',
    icon: 'calculate',
    tags: ['GPA', 'ASTU', 'Credits', 'Grades'],
    toolType: 'FRONTEND_UTILITY',
    isFeatured: true,
    estimatedMinutes: 2,
    inputFields: [
      { name: 'coursesCount', label: 'Number of Semester Courses', type: 'number', defaultValue: 5 }
    ]
  },
  {
    id: 'cgpa-calculator',
    name: 'ASTU Cumulative CGPA & Class Predictor',
    description: 'Compute total cumulative CGPA and predict degree honors classification (Very Great Distinction / Distinction).',
    category: 'academic',
    icon: 'functions',
    tags: ['CGPA', 'Cumulative', 'Distinction', 'Honors'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 2,
    inputFields: [
      { name: 'currentCgpa', label: 'Current ASTU Cumulative CGPA', type: 'number', defaultValue: 3.85 },
      { name: 'totalCredits', label: 'Total Completed Credit Hours', type: 'number', defaultValue: 140 }
    ]
  },
  {
    id: 'grade-converter',
    name: 'ASTU to ECTS & US Grade Converter',
    description: 'Convert ASTU 4.0 CGPA to European ECTS grades, US GPA standards, and percentage equivalents.',
    category: 'academic',
    icon: 'swap_horiz',
    tags: ['Grade Conversion', 'ECTS', 'US GPA', 'International'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 2,
    inputFields: [
      { name: 'cgpaInput', label: 'ASTU CGPA (0.00 - 4.00)', type: 'number', defaultValue: 3.85 }
    ]
  },
  {
    id: 'scholarship-sop-builder',
    name: 'Scholarship SOP & Motivation Letter Builder',
    description: 'Generate structured Statements of Purpose (SOP) for DAAD, Erasmus Mundus, Fulbright, and MasterCard grants.',
    category: 'scholarships',
    icon: 'history_edu',
    tags: ['SOP', 'Scholarship', 'DAAD', 'Erasmus', 'Fulbright'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 6,
    inputFields: [
      { name: 'grantName', label: 'Target Grant / Scholarship Program', type: 'text', defaultValue: 'DAAD M.Sc. Engineering Scholarship' },
      { name: 'targetProgram', label: 'M.Sc. / Ph.D. Field of Study', type: 'text', defaultValue: 'Distributed Software Systems' }
    ]
  },
  {
    id: 'thesis-topic-generator',
    name: 'Engineering Thesis & Research Generator',
    description: 'Explore high-impact B.Sc. capstone and M.Sc. research topic proposals with empirical methodology outlines.',
    category: 'postgraduate',
    icon: 'menu_book',
    tags: ['Thesis', 'Research', 'Capstone', 'Methodology'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 5,
    inputFields: [
      { name: 'researchDomain', label: 'Research Focus Area', type: 'text', defaultValue: 'Smart Energy Microgrids & AI Optimization' }
    ]
  },
  {
    id: 'postgraduate-university-finder',
    name: 'Global Postgraduate University Finder',
    description: 'Explore top international universities and degree programs accepting ASTU engineering credentials.',
    category: 'postgraduate',
    icon: 'public',
    tags: ['Postgraduate', 'Masters', 'PhD', 'Universities'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'targetRegion', label: 'Target Region', type: 'select', defaultValue: 'europe', options: [
        { label: 'Europe (Germany, UK, Sweden, Netherlands)', value: 'europe' },
        { label: 'North America (USA, Canada)', value: 'usa' },
        { label: 'Asia & Oceania (Japan, Korea, Australia)', value: 'asia' }
      ]}
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // CATEGORY 5 — ETHIOPIAN PERSONAL FINANCE & TAX (22-26)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'salary-after-living-costs-calculator',
    name: 'Ethiopian PAYE Tax & Net Salary Calculator',
    description: 'Calculate net take-home salary after Ministry of Revenue income tax (Proclamation 1156/2019) and 7% pension.',
    category: 'finance',
    icon: 'calculate',
    tags: ['Salary', 'Tax', 'ETB', 'Pension', 'Take-Home'],
    toolType: 'FRONTEND_UTILITY',
    isFeatured: true,
    estimatedMinutes: 2,
    inputFields: [
      { name: 'grossSalary', label: 'Gross Monthly Salary (ETB)', type: 'number', defaultValue: 30000 },
      { name: 'allowance', label: 'Non-Taxable Allowances (ETB)', type: 'number', defaultValue: 2500 }
    ]
  },
  {
    id: 'ethiopia-freelance-rate-calculator',
    name: 'Ethiopian & Remote Freelance Rate Calculator',
    description: 'Compute target hourly and monthly freelance billing rates in ETB and USD based on living costs and overhead.',
    category: 'ethiopia_finance',
    icon: 'price_change',
    tags: ['Freelance', 'Hourly Rate', 'ETB', 'USD'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'monthlyTargetETB', label: 'Target Monthly Net Income (ETB)', type: 'number', defaultValue: 60000 }
    ]
  },
  {
    id: 'ethiopian-cost-of-living-estimator',
    name: 'Ethiopian Regional Cost of Living Estimator',
    description: 'Compare living costs, house rent, transportation, and savings potential across Addis Ababa, Adama, and Hawassa.',
    category: 'ethiopia_finance',
    icon: 'location_city',
    tags: ['Living Costs', 'Addis Ababa', 'Rent', 'Budget'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'city', label: 'Primary Residence City', type: 'select', defaultValue: 'addis_ababa', options: [
        { label: 'Addis Ababa', value: 'addis_ababa' },
        { label: 'Adama', value: 'adama' },
        { label: 'Hawassa', value: 'hawassa' },
        { label: 'Dire Dawa', value: 'dire_dawa' }
      ]}
    ]
  },
  {
    id: 'birr-usd-currency-planner',
    name: 'Birr / USD Foreign Currency & Inflation Planner',
    description: 'Financial risk mitigation and legal foreign currency management for international remote earners in Ethiopia.',
    category: 'ethiopia_finance',
    icon: 'currency_exchange',
    tags: ['USD', 'Birr', 'Inflation', 'Remittance'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'usdIncome', label: 'Estimated Monthly USD Earnings', type: 'number', defaultValue: 1500 }
    ]
  },
  {
    id: 'pension-gratuity-calculator',
    name: 'Ethiopian Pension & Severance Payout Calculator',
    description: 'Calculate public/private employee pension contributions, severance pay, and gratuity under Ethiopian Labor Law.',
    category: 'finance',
    icon: 'account_balance',
    tags: ['Pension', 'Severance', 'Labor Law', 'Proclamation'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'yearsServed', label: 'Years of Employment Service', type: 'number', defaultValue: 3 },
      { name: 'lastMonthlySalary', label: 'Last Gross Monthly Salary (ETB)', type: 'number', defaultValue: 25000 }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // CATEGORY 6 — ENTREPRENEURSHIP, STARTUP & SME (27-32)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'sme-business-plan-generator',
    name: 'Ethiopian SME & Business Plan Builder',
    description: 'Generate a bank-ready business plan (Executive summary, market validation, ETB financial model) for Ethiopian SMEs.',
    category: 'ethiopia_sme',
    icon: 'storefront',
    tags: ['Business Plan', 'SME', 'Ethiopia', 'Bank Loan'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 7,
    inputFields: [
      { name: 'businessName', label: 'Business / Enterprise Name', type: 'text', defaultValue: 'Adama Tech Solutions PLC' },
      { name: 'sector', label: 'Industry Sector', type: 'text', defaultValue: 'Software Consulting & Hardware Integration' },
      { name: 'requiredCapital', label: 'Initial Capital Target (ETB)', type: 'number', defaultValue: 500000 }
    ]
  },
  {
    id: 'tin-vat-compliance-guide',
    name: 'Ethiopian TIN & VAT Tax Compliance Guide',
    description: 'Step-by-step checklist and calculator for TIN, VAT, TOT, and Withholding Tax registration with Ministry of Revenue.',
    category: 'ethiopia_sme',
    icon: 'gavel',
    tags: ['TIN', 'VAT', 'TOT', 'Tax Compliance', 'MOR'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'annualTurnover', label: 'Estimated Annual Revenue (ETB)', type: 'number', defaultValue: 1200000 }
    ]
  },
  {
    id: 'startup-pitch-deck-outline',
    name: '10-Slide Startup Pitch Deck Generator',
    description: 'Create a 10-slide investor pitch deck structure tailored for African tech hubs and venture investors.',
    category: 'entrepreneurship',
    icon: 'slideshow',
    tags: ['Pitch Deck', 'Startup', 'Venture Capital', 'Investors'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 5,
    inputFields: [
      { name: 'startupIdea', label: 'Startup Value Proposition', type: 'text', defaultValue: 'AI-Powered Agricultural Supply Chain Platform for Ethiopia' }
    ]
  },
  {
    id: 'freelance-contract-generator',
    name: 'Freelance & Service Contract Builder',
    description: 'Generate legally sound freelance service agreements compliant with Ethiopian Civil Code contract provisions.',
    category: 'ethiopia_sme',
    icon: 'article',
    tags: ['Contract', 'Freelance', 'Legal', 'Ethiopian Law'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 5,
    inputFields: [
      { name: 'clientName', label: 'Client / Enterprise Name', type: 'text', defaultValue: 'Horizon Tech PLC' },
      { name: 'contractValue', label: 'Total Project Value (ETB)', type: 'number', defaultValue: 150000 }
    ]
  },
  {
    id: 'startup-grant-proposal-builder',
    name: 'Innovation Grant Proposal Builder',
    description: 'Draft seed funding proposals for Ministry of Innovation and Technology (MInT) and international incubators.',
    category: 'entrepreneurship',
    icon: 'lightbulb',
    tags: ['Grants', 'Seed Funding', 'MInT', 'Incubator'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 6,
    inputFields: [
      { name: 'grantName', label: 'Target Grant Opportunity', type: 'text', defaultValue: 'MInT African Innovation Grant' }
    ]
  },
  {
    id: 'product-pricing-strategy-tool',
    name: 'Product & Service Pricing Calculator',
    description: 'Calculate cost-plus, value-based, and margin-optimized pricing models for hardware, software, and services.',
    category: 'entrepreneurship',
    icon: 'price_check',
    tags: ['Pricing', 'Margins', 'Profitability'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'costPerUnit', label: 'Direct Production Cost per Unit (ETB)', type: 'number', defaultValue: 350 },
      { name: 'targetMargin', label: 'Target Profit Margin (%)', type: 'number', defaultValue: 40 }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // CATEGORY 7 — PRODUCTIVITY, CODE & ENGINEERING (33-38)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'system-architecture-designer',
    name: 'Cloud & System Architecture Blueprint Designer',
    description: 'Generate high-level microservices architectures, data flow diagrams, and tech stack specifications for engineering projects.',
    category: 'productivity',
    icon: 'account_tree',
    tags: ['Architecture', 'System Design', 'Microservices', 'Cloud'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 6,
    inputFields: [
      { name: 'systemType', label: 'System Type', type: 'text', defaultValue: 'High-Concurrency E-Commerce & FinTech API' }
    ]
  },
  {
    id: 'code-refactoring-copilot',
    name: 'Clean Code & Refactoring Copilot',
    description: 'Analyze code snippets for clean architecture patterns, code smells, performance bottlenecks, and refactoring tips.',
    category: 'productivity',
    icon: 'code',
    tags: ['Clean Code', 'Refactoring', 'Optimization'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'language', label: 'Programming Language', type: 'text', defaultValue: 'TypeScript / Node.js' }
    ]
  },
  {
    id: 'git-workflow-generator',
    name: 'Git Branching & CI/CD Pipeline Generator',
    description: 'Design GitFlow / Trunk-based branching strategies and GitHub Actions deployment workflow YAML files.',
    category: 'productivity',
    icon: 'fork_right',
    tags: ['Git', 'CI/CD', 'GitHub Actions', 'DevOps'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'workflowType', label: 'Branching Strategy', type: 'select', defaultValue: 'gitflow', options: [
        { label: 'GitFlow (Main, Develop, Feature, Release)', value: 'gitflow' },
        { label: 'Trunk-Based Development (Feature Flags)', value: 'trunk' }
      ]}
    ]
  },
  {
    id: 'pomodoro-timer',
    name: 'Focused Pomodoro Study & Work Timer',
    description: 'Interactive focus timer (25m deep work / 5m break) with task tracker to maximize daily engineering productivity.',
    category: 'productivity',
    icon: 'timer',
    tags: ['Pomodoro', 'Timer', 'Focus', 'Productivity'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 25
  },
  {
    id: 'project-time-estimator',
    name: 'PERT Engineering Task Time Estimator',
    description: 'Calculate optimistic, most likely, and pessimistic PERT time estimates for engineering project deliverables.',
    category: 'productivity',
    icon: 'schedule',
    tags: ['PERT', 'Estimation', 'Timeline', 'Project Management'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'optimisticDays', label: 'Optimistic Estimate (Days)', type: 'number', defaultValue: 3 },
      { name: 'likelyDays', label: 'Most Likely Estimate (Days)', type: 'number', defaultValue: 7 },
      { name: 'pessimisticDays', label: 'Pessimistic Estimate (Days)', type: 'number', defaultValue: 14 }
    ]
  },
  {
    id: 'sql-query-optimizer',
    name: 'SQL Query & Schema Performance Optimizer',
    description: 'Optimize complex SQL queries, index strategies, and PostgreSQL / MySQL database schemas.',
    category: 'productivity',
    icon: 'database',
    tags: ['SQL', 'PostgreSQL', 'Database', 'Performance'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'dbEngine', label: 'Database System', type: 'text', defaultValue: 'PostgreSQL' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // CATEGORY 8 — ALUMNI NETWORK, MENTORSHIP & LEGAL (39-44)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'mentor-match-assistant',
    name: 'ASTU Alumni Mentor Matcher',
    description: 'Match your career objectives with verified senior ASTU alumni mentors across Safaricom, Ethio Telecom, and global firms.',
    category: 'alumni',
    icon: 'people',
    tags: ['Mentorship', 'ASTU Alumni', 'Matchmaker'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 3,
    inputFields: [
      { name: 'targetRole', label: 'Desired Career Mentorship Area', type: 'text', defaultValue: 'Senior Systems Engineering & Career Growth' }
    ]
  },
  {
    id: 'document-readiness-checker',
    name: 'ASTU Registrar Document Audit',
    description: 'Verify readiness of your official B.Sc. transcripts, degree certificate copies, and English Medium of Instruction letters.',
    category: 'alumni',
    icon: 'assignment_turned_in',
    tags: ['Registrar', 'Transcript', 'Degree', 'ASTU Official'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 2,
    inputFields: [
      { name: 'documentType', label: 'Primary Document Needed', type: 'select', defaultValue: 'transcript', options: [
        { label: 'Official B.Sc. Academic Transcript', value: 'transcript' },
        { label: 'Medium of Instruction Letter (English)', value: 'medium_letter' },
        { label: 'Degree Certificate Confirmation', value: 'degree_certificate' }
      ]}
    ]
  },
  {
    id: 'relocation-settlement-guide',
    name: 'Graduate Relocation & Settlement Guide',
    description: 'Comprehensive guide for ASTU graduates relocating to Addis Ababa, industrial parks, or international work destinations.',
    category: 'alumni',
    icon: 'commute',
    tags: ['Relocation', 'Addis Ababa', 'Settlement', 'Housing'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 5,
    inputFields: [
      { name: 'destination', label: 'Relocation Destination', type: 'text', defaultValue: 'Addis Ababa (Bole / Kazanchis)' }
    ]
  },
  {
    id: 'workplace-conflict-navigator',
    name: 'Workplace Rights & HR Resolution Guide',
    description: 'Professional guidance on workplace rights, probation periods, and dispute resolution under Ethiopian Labor Proclamation 1156/2019.',
    category: 'alumni',
    icon: 'gavel',
    tags: ['Labor Law', 'HR Rights', 'Conflict', 'Proclamation'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'issueType', label: 'Workplace Topic', type: 'text', defaultValue: 'Probationary Period & Notice Period Clauses' }
    ]
  },
  {
    id: 'alumni-networking-outreach-prep',
    name: 'ASTU Alumni Outreach & Networking Prep',
    description: 'Generate high-response LinkedIn connection requests and cold emails to ASTU senior alumni.',
    category: 'alumni',
    icon: 'mark_email_read',
    tags: ['Networking', 'LinkedIn', 'Outreach', 'Alumni'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'recipientRole', label: 'Senior Alumni Title', type: 'text', defaultValue: 'Engineering Director @ Tech Firm' }
    ]
  },
  {
    id: 'first-year-work-plan',
    name: 'First-Year Workplace Success Blueprint',
    description: '12-month workplace orientation blueprint to maximize performance, build influence, and earn early promotions.',
    category: 'alumni',
    icon: 'military_tech',
    tags: ['First Year', 'Promotion', 'Workplace', 'Success'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 5,
    inputFields: [
      { name: 'jobRole', label: 'Starting Role', type: 'text', defaultValue: 'Junior Software Specialist' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // CATEGORY 9 — SCAM SAFETY, BRANDING & TRACER (45-50)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'job-scam-risk-checker',
    name: 'Job Scam & Fraud Risk Analyzer',
    description: 'Audit job postings, agency offers, and recruitment emails for red flags, upfront fee scams, and fake firms.',
    category: 'job_safety',
    icon: 'security',
    tags: ['Scam Protection', 'Job Safety', 'Audit', 'Fraud Prevention'],
    toolType: 'AI_ASSISTED',
    isFeatured: true,
    estimatedMinutes: 3,
    inputFields: [
      { name: 'postingText', label: 'Job Posting Text or Email Content', type: 'textarea', placeholder: 'Paste job offer text, recruitment agency claims, or email...' }
    ]
  },
  {
    id: 'linkedin-profile-optimizer',
    name: 'LinkedIn Profile & Headline Optimizer',
    description: 'Optimize your LinkedIn headline, about section, and experience bullet points to attract international technical recruiters.',
    category: 'professional',
    icon: 'share',
    tags: ['LinkedIn', 'Branding', 'Headhunters', 'Profile'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'currentHeadline', label: 'Current LinkedIn Headline', type: 'text', defaultValue: 'ASTU Software Engineering Graduate | React & Python Developer' }
    ]
  },
  {
    id: 'certification-roadmap-planner',
    name: 'Engineering Certification Roadmap Planner',
    description: 'Select and sequence global technical certifications (AWS, Cisco CCNA, PMP, Scrum Master, Kubernetes) for your field.',
    category: 'professional',
    icon: 'verified_user',
    tags: ['Certifications', 'AWS', 'Cisco', 'PMP', 'Kubernetes'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 4,
    inputFields: [
      { name: 'field', label: 'Engineering Domain', type: 'text', defaultValue: 'Cloud Infrastructure & Software Systems' }
    ]
  },
  {
    id: 'contract-clause-reviewer',
    name: 'Employment Contract Terms Reviewer',
    description: 'Review key contract clauses including non-compete agreements, IP ownership, probation, and termination terms.',
    category: 'job_safety',
    icon: 'find_in_page',
    tags: ['Contract Review', 'Non-Compete', 'IP Rights', 'Legal'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 5,
    inputFields: [
      { name: 'clauseText', label: 'Contract Clause snippet to review', type: 'textarea', placeholder: 'Paste contract clause regarding IP, non-compete, or notice period...' }
    ]
  },
  {
    id: 'remote-work-readiness-audit',
    name: 'Remote Work Infrastructure Audit',
    description: 'Evaluate your technical setup (internet backup, power backup UPS, payment gateway receiving) for global remote jobs in Ethiopia.',
    category: 'job_safety',
    icon: 'wifi_tethering',
    tags: ['Remote Work', 'UPS Power', 'Internet', 'Payoneer'],
    toolType: 'AI_ASSISTED',
    estimatedMinutes: 3,
    inputFields: [
      { name: 'targetRemoteRole', label: 'Target Remote Role', type: 'text', defaultValue: 'Full Stack Remote Contractor' }
    ]
  },
  {
    id: 'tracer-survey-assistant',
    name: 'ASTU Graduate Tracer Survey Assistant',
    description: 'Log and update your career tracer metrics to contribute to ASTU academic accreditation and alumni statistics.',
    category: 'alumni',
    icon: 'insights',
    tags: ['Tracer', 'Accreditation', 'ASTU Stats', 'Survey'],
    toolType: 'FRONTEND_UTILITY',
    estimatedMinutes: 2,
    inputFields: [
      { name: 'employmentStatus', label: 'Current Employment Status', type: 'select', defaultValue: 'employed_fulltime', options: [
        { label: 'Employed Full-Time', value: 'employed_fulltime' },
        { label: 'Self-Employed / Entrepreneur', value: 'entrepreneur' },
        { label: 'Postgraduate Student (M.Sc./Ph.D.)', value: 'student' },
        { label: 'Seeking Placement', value: 'seeking' }
      ]}
    ]
  }
];

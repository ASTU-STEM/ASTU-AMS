import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Handshake,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Star,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  X,
  FileCheck2,
  Award,
  Layers,
  Calendar,
  ExternalLink,
  DollarSign,
  Laptop,
  Check,
  Building,
  BadgeCheck,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { partnerLogos } from '../components/PartnerLogos';
import { useTheme } from '../hooks/useTheme';
import toast from 'react-hot-toast';

interface TalentCandidate {
  id: string;
  name: string;
  degree: string;
  department: string;
  discipline: string;
  gradYear: string;
  honors: string;
  gpa: string;
  skills: string[];
  status: string;
  location: string;
  avatarBg: string;
  bio: string;
}

interface PartnerJob {
  id: string;
  title: string;
  company: string;
  logoKey: string;
  type: 'FULL_TIME' | 'TRAINEE' | 'INTERNSHIP' | 'FELLOWSHIP';
  typeLabel: string;
  location: string;
  salary: string;
  department: string;
  deadline: string;
  tags: string[];
  description: string;
  requirements: string[];
}

export default function PartnersPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // State filters
  const [talentSearch, setTalentSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('ALL');
  const [selectedJobType, setSelectedJobType] = useState('ALL');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeSchoolTab, setActiveSchoolTab] = useState<'seec' | 'smcme' | 'scea' | 'sans'>('seec');

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null);
  const [selectedJob, setSelectedJob] = useState<PartnerJob | null>(null);
  const [interviewNote, setInterviewNote] = useState('');
  const [isSubmittingInterview, setIsSubmittingInterview] = useState(false);

  const stats = [
    { label: 'Verified Alumni Pool', value: '35,000+', subtext: 'Accredited STEM & Computing Graduates' },
    { label: 'Active Partner Employers', value: '120+', subtext: 'National & Global Tech Companies' },
    { label: 'Open Opportunities', value: '450+', subtext: 'Direct Roles & Graduate Trainee Tracks' },
    { label: 'Placement Velocity', value: '94%', subtext: 'Employed Within 6 Months of Graduation' },
  ];

  const benefits = [
    {
      icon: Users,
      title: 'Hire Verified STEM Graduates',
      tag: 'Talent Sourcing',
      description: 'Access accredited ASTU graduates with practical skills verified against official Student Information System (SIS) records.',
    },
    {
      icon: Briefcase,
      title: 'Direct Job & Trainee Postings',
      tag: 'Job Board',
      description: 'Publish employment vacancies, internships, and graduate trainee roles directly to graduating batches and verified alumni.',
    },
    {
      icon: MessageSquare,
      title: 'Curriculum Co-Creation & Feedback',
      tag: 'Academic Impact',
      description: 'Provide structured competency ratings on graduate performance to guide biennial syllabus reforms across ASTU engineering departments.',
    },
    {
      icon: ShieldCheck,
      title: 'TIN-Verified Security',
      tag: 'Verified Trust',
      description: 'Every corporate profile is validated with official Tax Identification Numbers (TIN) to guarantee high-integrity recruitment channels.',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Recruitment Analytics',
      tag: 'Recruiter Insights',
      description: 'Track applicant conversion, interview milestones, and hiring outcomes via a dedicated enterprise recruiter dashboard.',
    },
    {
      icon: Handshake,
      title: 'Strategic Institutional MoUs',
      tag: 'Collaborative MoUs',
      description: 'Formalize university-industry memorandums of understanding for sponsored research, capstone hackathons, and laboratory equipment.',
    },
  ];

  const verifiedPartners = [
    {
      name: 'Ethio Telecom',
      industry: 'Telecom, Cloud & FinTech',
      status: 'Tier 1 Strategic Partner',
      hiredCount: '340+ ASTU Alumni',
      mouYear: 'Since 2018',
    },
    {
      name: 'INSA',
      industry: 'Cybersecurity & Defense Intelligence',
      status: 'Govt Research Partner',
      hiredCount: '190+ ASTU Alumni',
      mouYear: 'Since 2019',
    },
    {
      name: 'Ethiopian Airlines',
      industry: 'Aviation Engineering & ICT',
      status: 'Aviation Tech Partner',
      hiredCount: '280+ ASTU Alumni',
      mouYear: 'Since 2017',
    },
    {
      name: 'Safaricom',
      industry: 'Telecommunications & 5G Infrastructure',
      status: 'Strategic Corporate Partner',
      hiredCount: '160+ ASTU Alumni',
      mouYear: 'Since 2021',
    },
    {
      name: 'Huawei',
      industry: 'ICT Academy & Enterprise Networking',
      status: 'Global Innovation Partner',
      hiredCount: '220+ ASTU Alumni',
      mouYear: 'Since 2016',
    },
    {
      name: 'Commercial Bank of Ethiopia',
      industry: 'Financial Technology & Digital Banking',
      status: 'Enterprise Banking Partner',
      hiredCount: '410+ ASTU Alumni',
      mouYear: 'Since 2015',
    },
  ];

  const talentPool = useMemo<TalentCandidate[]>(() => [
    {
      id: 'ALUM-901',
      name: 'Binyam Tesfaye',
      degree: 'B.Sc. Software Engineering',
      department: 'Software Engineering',
      discipline: 'SOFTWARE',
      gradYear: 'Class of 2025',
      honors: 'Very Great Distinction',
      gpa: '3.88 / 4.00',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      status: 'Available Immediately',
      location: 'Addis Ababa / Adama',
      avatarBg: 'from-blue-600 to-indigo-700',
      bio: 'Fullstack software engineer with strong background in distributed systems, RESTful API design, and cloud architecture. Winner of the 2024 ASTU Innovation Hackathon.',
    },
    {
      id: 'ALUM-902',
      name: 'Hanan Mohammed',
      degree: 'B.Sc. Electrical & Computer Engineering',
      department: 'Electrical & Computer Engineering',
      discipline: 'ELECTRICAL',
      gradYear: 'Class of 2024',
      honors: 'Great Distinction',
      gpa: '3.82 / 4.00',
      skills: ['Embedded C', 'IoT', 'Python', 'FPGA', 'Power Systems'],
      status: 'Actively Interviewing',
      location: 'Addis Ababa',
      avatarBg: 'from-emerald-600 to-teal-700',
      bio: 'Hardware-software co-design specialist with industrial internship experience at Ethio Telecom. Experienced in IoT sensor networks and smart grid instrumentation.',
    },
    {
      id: 'ALUM-903',
      name: 'Yared Alemu',
      degree: 'B.Sc. Mechanical Engineering',
      department: 'Mechanical Design & Manufacturing',
      discipline: 'MECHANICAL',
      gradYear: 'Class of 2025',
      honors: 'Great Distinction',
      gpa: '3.75 / 4.00',
      skills: ['SolidWorks', 'AutoCAD', 'Finite Element Analysis', 'CNC Machining', 'Thermodynamics'],
      status: 'Available Immediately',
      location: 'Adama / Hawassa',
      avatarBg: 'from-amber-600 to-orange-700',
      bio: 'Mechanical engineer specialized in CAD prototyping, stress analysis, and industrial automation equipment. Capstone on renewable solar-thermal grain drying units.',
    },
    {
      id: 'ALUM-904',
      name: 'Selamawit Kebede',
      degree: 'B.Sc. Civil Engineering & Architecture',
      department: 'Civil Engineering',
      discipline: 'CIVIL',
      gradYear: 'Class of 2024',
      honors: 'Very Great Distinction',
      gpa: '3.91 / 4.00',
      skills: ['BIM / Revit', 'ETABS', 'Structural Design', 'Soil Mechanics', 'Project Management'],
      status: 'Available Immediately',
      location: 'Addis Ababa',
      avatarBg: 'from-purple-600 to-violet-800',
      bio: 'Structural civil engineer trained in seismic resilience modeling and sustainable building materials. Experienced in BIM modeling and construction quality auditing.',
    },
    {
      id: 'ALUM-905',
      name: 'Natnael Girma',
      degree: 'B.Sc. Chemical Engineering',
      department: 'Chemical & Materials Engineering',
      discipline: 'CHEMICAL',
      gradYear: 'Class of 2025',
      honors: 'Great Distinction',
      gpa: '3.79 / 4.00',
      skills: ['Process Simulation (Aspen Plus)', 'Water Treatment', 'Polymer Science', 'Safety Engineering'],
      status: 'Open to Remote / On-Site',
      location: 'Adama / Bishoftu',
      avatarBg: 'from-rose-600 to-pink-700',
      bio: 'Process engineer with focus on green chemical synthesis and industrial wastewater recycling. Hands-on experience operating pilot bioreactors at ASTU Innovation Hub.',
    },
    {
      id: 'ALUM-906',
      name: 'Frehiwot Bekele',
      degree: 'B.Sc. Applied Mathematics & Computing',
      department: 'Applied Natural Sciences',
      discipline: 'SCIENCES',
      gradYear: 'Class of 2024',
      honors: 'Summa Cum Laude',
      gpa: '3.96 / 4.00',
      skills: ['Python / PyTorch', 'Data Analysis', 'SQL', 'Statistical Modeling', 'Machine Learning'],
      status: 'Actively Interviewing',
      location: 'Addis Ababa',
      avatarBg: 'from-cyan-600 to-blue-800',
      bio: 'Data scientist and mathematical modeler. Co-authored predictive models for agricultural yield forecasting using satellite telemetry and neural networks.',
    },
  ], []);

  const partnerJobs = useMemo<PartnerJob[]>(() => [
    {
      id: 'JOB-ETHIO-01',
      title: 'Cloud Infrastructure & DevOps Engineer',
      company: 'Ethio Telecom',
      logoKey: 'Ethio Telecom',
      type: 'FULL_TIME',
      typeLabel: 'Full-Time',
      location: 'Addis Ababa (Headquarters)',
      salary: 'ETB 28,000 - 38,000 / mo',
      department: 'Software / Computer Science',
      deadline: 'Nov 15, 2026',
      tags: ['Kubernetes', 'Linux', 'CI/CD', 'Docker', 'OpenStack'],
      description: 'Join the Telecloud Operations team to manage hyperscale enterprise infrastructure, orchestrate container clusters, and automate deployment pipelines for telecommunication services.',
      requirements: [
        'B.Sc. in Software Engineering, Computer Science or Electrical & Computer Engineering from ASTU',
        'Strong fundamentals in Linux systems administration and container orchestration',
        'Familiarity with GitOps workflows and scripting with Python or Bash',
      ],
    },
    {
      id: 'JOB-EAL-02',
      title: 'Avionics Systems Engineering Trainee',
      company: 'Ethiopian Airlines',
      logoKey: 'Ethiopian Airlines',
      type: 'TRAINEE',
      typeLabel: 'Graduate Trainee',
      location: 'Bole International Airport, Addis Ababa',
      salary: 'ETB 22,000 - 30,000 / mo + Benefits',
      department: 'Electrical / Mechanical',
      deadline: 'Nov 20, 2026',
      tags: ['Avionics', 'Sensors', 'Embedded Systems', 'Aeronautics'],
      description: 'Comprehensive 12-month technical training program at the Ethiopian Aviation University, leading to certified avionics software maintenance and system integration assignments on modern Boeing and Airbus fleets.',
      requirements: [
        'Graduating B.Sc. in Electrical Engineering, Mechanical Engineering or Software Engineering with GPA ≥ 3.50',
        'High aptitude in embedded hardware, signal processing and diagnostics',
        'Excellent technical communication skills in English',
      ],
    },
    {
      id: 'JOB-INSA-03',
      title: 'SOC Cybersecurity Incident Analyst',
      company: 'INSA',
      logoKey: 'INSA',
      type: 'FULL_TIME',
      typeLabel: 'Full-Time',
      location: 'Addis Ababa',
      salary: 'ETB 26,000 - 35,000 / mo',
      department: 'Computer Science / SEEC',
      deadline: 'Nov 30, 2026',
      tags: ['SOC Level 1', 'Wireshark', 'SIEM', 'Network Security', 'Python'],
      description: 'Defend national critical information infrastructure. Monitor 24/7 security event telemetry, triage zero-day intrusion attempts, and produce digital forensics reports for national cyber defense.',
      requirements: [
        'B.Sc. in Software Engineering, Computer Science, or Information Security from ASTU',
        'Understanding of TCP/IP, cryptographic primitives, and SIEM tooling (Splunk/Elastic)',
        'Clearance readiness and strong ethical orientation',
      ],
    },
    {
      id: 'JOB-SAF-04',
      title: '5G RAN Network Optimization Specialist',
      company: 'Safaricom',
      logoKey: 'Safaricom',
      type: 'FULL_TIME',
      typeLabel: 'Full-Time',
      location: 'Hawassa / Adama / Addis Ababa',
      salary: 'ETB 30,000 - 40,000 / mo',
      department: 'Electrical & Computer Engineering',
      deadline: 'Dec 05, 2026',
      tags: ['5G NR', 'Radio Access Network', 'RF Engineering', 'Telecommunications'],
      description: 'Conduct drive tests, analyze KPI drops, tune antenna azimuths, and optimize high-throughput 5G radio access network cells across high-density regional urban corridors.',
      requirements: [
        'B.Sc. in Electrical & Computer Engineering from ASTU (Telecommunications or Electronics focus)',
        'Understanding of 4G/5G air interface specifications and cellular topology',
        'Proficiency in RF modeling software and geographic data tools',
      ],
    },
    {
      id: 'JOB-HUA-05',
      title: 'AI & Edge Computing Research Fellow',
      company: 'Huawei',
      logoKey: 'Huawei',
      type: 'FELLOWSHIP',
      typeLabel: 'R&D Fellowship',
      location: 'ASTU ICT Incubation Center, Adama',
      salary: 'ETB 24,000 - 32,000 / mo + Research Grant',
      department: 'Applied Sciences / SEEC',
      deadline: 'Dec 10, 2026',
      tags: ['Ascend AI', 'MindSpore', 'Computer Vision', 'Edge Computing'],
      description: 'Joint ASTU-Huawei research fellowship targeting localized computer vision applications in agricultural monitoring and smart city traffic analysis running on edge hardware.',
      requirements: [
        'Final-year graduating senior or M.Sc. candidate in Computing or Applied Mathematics',
        'Demonstrated project work in deep learning and model quantization',
        'Passion for applied academic research and technology patents',
      ],
    },
    {
      id: 'JOB-CBE-06',
      title: 'FinTech Systems Associate (Core Banking)',
      company: 'Commercial Bank of Ethiopia',
      logoKey: 'Commercial Bank of Ethiopia',
      type: 'FULL_TIME',
      typeLabel: 'Full-Time',
      location: 'CBE Tower, Addis Ababa',
      salary: 'ETB 32,000 - 44,000 / mo',
      department: 'Software Engineering',
      deadline: 'Dec 15, 2026',
      tags: ['Java / Spring Boot', 'Oracle Database', 'Microservices', 'FinTech'],
      description: 'Build and maintain mission-critical transactional services for Ethiopia’s largest commercial financial institution, processing over 10 million daily electronic transactions.',
      requirements: [
        'B.Sc. in Software Engineering or Computer Science from ASTU',
        'Strong command of Java, OOP design patterns, and relational SQL transactions',
        'Knowledge of banking security protocols and API gateways',
      ],
    },
  ], []);

  const onboardingSteps = [
    {
      step: '01',
      title: 'Register Organisation & TIN',
      description: 'Provide company registration details, industry sector, contact email, and official Ethiopian Tax Identification Number (TIN). Takes under 3 minutes.',
      icon: Building2,
    },
    {
      step: '02',
      title: 'Registrar & Corporate Review',
      description: 'ASTU administration reviews the submission against official national business licensing records to guarantee authenticated employer access.',
      icon: FileCheck2,
    },
    {
      step: '03',
      title: 'Instant Dashboard Activation',
      description: 'Once verified, your account unlocks full recruiter tools: search the verified talent pool, post vacancies, and access direct applicant pipelines.',
      icon: BadgeCheck,
    },
    {
      step: '04',
      title: 'Campus Drives & Curriculum Input',
      description: 'Host on-campus interviews, participate in annual career fairs, and submit structured graduate competency ratings that directly influence ASTU curricula.',
      icon: Handshake,
    },
  ];

  const faqs = [
    {
      q: 'Why is an Ethiopian Tax Identification Number (TIN) required?',
      a: 'A valid TIN prevents unauthorized or fraudulent recruiters from contacting students. ASTU validates every employer against national business registries to ensure graduate data privacy and legitimate employment opportunities.',
    },
    {
      q: 'Does it cost anything for companies to post jobs or partner with ASTU?',
      a: 'No. Registering as an employer partner, posting job openings, reviewing applicants, and searching verified graduate talent pools are 100% free of charge as part of ASTU’s national academic mandate.',
    },
    {
      q: 'How quickly is an employer registration approved?',
      a: 'The ASTU Corporate Relations and Registrar office typically reviews and approves valid registrations within 24 to 48 business hours.',
    },
    {
      q: 'Can employers organize on-campus interview drives and technical talks?',
      a: 'Yes! Verified partner employers can schedule interview rooms, campus tech talks, and project showcase visits directly through the employer portal or by contacting the ASTU Industry Linkage Director.',
    },
    {
      q: 'How does employer feedback shape university curricula?',
      a: 'After hiring an ASTU graduate or intern, employers submit structured competency feedback (e.g. software practices, lab safety, communication). This data is aggregated in real-time by Department Heads and directly informs biennial syllabus revisions required by ETA.',
    },
  ];

  // Filtering candidates
  const filteredCandidates = useMemo(() => {
    return talentPool.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(talentSearch.toLowerCase()) ||
        c.department.toLowerCase().includes(talentSearch.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(talentSearch.toLowerCase()));
      const matchesDiscipline = selectedDiscipline === 'ALL' || c.discipline === selectedDiscipline;
      return matchesSearch && matchesDiscipline;
    });
  }, [talentPool, talentSearch, selectedDiscipline]);

  // Filtering jobs
  const filteredJobs = useMemo(() => {
    return partnerJobs.filter((j) => {
      if (selectedJobType === 'ALL') return true;
      return j.type === selectedJobType;
    });
  }, [partnerJobs, selectedJobType]);

  const handleSendInterviewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInterview(true);
    setTimeout(() => {
      setIsSubmittingInterview(false);
      toast.success(`Interview inquiry for ${selectedCandidate?.name} submitted! The Alumni Office will coordinate contact.`);
      setSelectedCandidate(null);
      setInterviewNote('');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-slate-900 to-astu-blue py-20 lg:py-28 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.04] bg-[size:3rem_3rem]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-astu-gold mb-6">
              <Building2 className="w-4 h-4 text-astu-gold" />
              ASTU Corporate Relations & Industry Partnerships
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              Recruit Accredited STEM Talent from{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-emerald-300 to-yellow-200">
                ASTU's Graduate Network
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              Connect directly with over 35,000 verified engineering, computing, and applied science alumni. Publish vacancies, search live talent pools, and shape future curricula through structured industry feedback.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/employers/register')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-astu-red to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-900/30 transition-all hover:scale-105"
              >
                Register Your Organisation
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all hover:scale-105"
              >
                Employer Portal Sign In
              </button>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-white/10">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-black text-white">{s.value}</div>
                <div className="text-sm font-bold text-blue-300 mt-1">{s.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Partner Companies Logo Showcase */}
      <section className="py-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              National Strategic Alliances
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Trusted by Ethiopia's Leading Tech & Industrial Enterprises
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Verified corporate partners collaborating with ASTU on graduate placement, sponsored R&D, and curriculum review.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-stretch">
            {verifiedPartners.map((partner) => {
              const LogoComponent = partnerLogos[partner.name];
              return (
                <div
                  key={partner.name}
                  className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all text-center group"
                >
                  <div className="flex h-16 items-center justify-center mb-3">
                    {LogoComponent ? (
                      <LogoComponent className="max-h-12 w-auto" />
                    ) : (
                      <span className="text-base font-black text-slate-700 dark:text-slate-200">{partner.name}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {partner.name}
                    </h4>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      {partner.status}
                    </span>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      {partner.hiredCount}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6 Key Benefits for Employers */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Employer Value Proposition
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
            Why Partner with Adama Science & Technology University?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            ASTU-AMS offers an integrated recruitment bridge designed specifically for modern industrial and technological enterprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {b.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{b.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Alumni Talent Pool Explorer */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Verified Candidate Database
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
                Explore the ASTU Talent Pool
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Sample preview of verified graduating engineers and alumni available for interviews and recruitment.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={talentSearch}
                  onChange={(e) => setTalentSearch(e.target.value)}
                  placeholder="Filter by skill, name, degree..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <button
                onClick={() => navigate('/employers/register')}
                className="px-5 py-2.5 rounded-xl bg-astu-navy text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
              >
                Access Full Directory
              </button>
            </div>
          </div>

          {/* Discipline Filter Buttons */}
          <div className="flex overflow-x-auto space-x-2 pb-4 mb-6 no-scrollbar">
            {[
              { id: 'ALL', label: 'All Disciplines' },
              { id: 'SOFTWARE', label: 'Software & Computing' },
              { id: 'ELECTRICAL', label: 'Electrical & Electronics' },
              { id: 'MECHANICAL', label: 'Mechanical & Automotive' },
              { id: 'CIVIL', label: 'Civil & Architecture' },
              { id: 'CHEMICAL', label: 'Chemical & Materials' },
              { id: 'SCIENCES', label: 'Applied Natural Sciences' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedDiscipline(f.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDiscipline === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Candidate Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${candidate.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                        {candidate.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{candidate.name}</h4>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{candidate.degree}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {candidate.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 dark:border-slate-800 mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Academic Standing</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{candidate.honors}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Graduation Batch</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{candidate.gradYear}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {candidate.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {candidate.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-astu-navy hover:text-white dark:hover:bg-blue-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  View Profile & Request Interview
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Partner Opportunities / Job Board */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Live Career Opportunities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              Active Vacancies from Partner Employers
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Explore open positions published directly by verified partner organizations for ASTU graduates.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'ALL', label: 'All Openings' },
              { id: 'FULL_TIME', label: 'Full-Time' },
              { id: 'TRAINEE', label: 'Graduate Trainee' },
              { id: 'FELLOWSHIP', label: 'R&D Fellowship' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedJobType(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedJobType === t.id
                    ? 'bg-astu-navy text-white dark:bg-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const LogoComp = partnerLogos[job.company];
            return (
              <div
                key={job.id}
                className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="h-10 w-28 flex items-center justify-start">
                      {LogoComp ? (
                        <LogoComp className="max-h-10 w-auto" />
                      ) : (
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{job.company}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                      {job.typeLabel}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{job.title}</h3>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs mb-4">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-medium text-slate-400">Compensation</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{job.salary}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 mt-1">
                      <span className="font-medium text-slate-400">Apply by</span>
                      <span className="font-semibold">{job.deadline}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-astu-navy to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold transition-all shadow-sm"
                >
                  View Details & Apply
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4-Step Onboarding Roadmap */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Clear & Transparent Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
              How Employer Registration Works
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              From business registration to active campus recruitment in four simple, auditable steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {onboardingSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Corporate Testimonials */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Employer Voices
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            What Our Corporate Partners Say
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Endorsements from top technology leaders hiring ASTU graduates.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "ASTU software and electrical engineering graduates arrive with genuine practical laboratory experience. They adapt into our cloud operations teams faster than graduates from any other institution in the region.",
              author: "Engineering Director",
              company: "Ethio Telecom",
              badge: "Over 340 Hired",
            },
            {
              quote: "In cybersecurity and defense analytics, theoretical knowledge is never enough. ASTU alumni possess hands-on Linux, network analysis, and reverse-engineering skills that make them immediate contributors to national defense.",
              author: "Head of Talent Acquisition",
              company: "INSA",
              badge: "Govt Defense Partner",
            },
            {
              quote: "Our aircraft maintenance and systems engineering units rely on ASTU mechanical and electrical engineers. Their mathematical rigor and mechanical aptitude consistently exceed international standards.",
              author: "Aviation Maintenance Lead",
              company: "Ethiopian Airlines",
              badge: "Strategic Partner",
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.author}</h4>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{t.company}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {t.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pre-Registration FAQ */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Employer Inquiries
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Frequently Asked Questions for Employers
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Everything you need to know about partnering, TIN validation, and recruitment.
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grand Closing CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-astu-navy via-slate-900 to-blue-900 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            Ready to Connect with Top ASTU Graduates?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Register your organisation today. One simple form, official TIN verification, and zero partnership fees.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/employers/register')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-astu-red to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-950/40 transition-all hover:scale-105"
            >
              Start Free Employer Registration
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all hover:scale-105"
            >
              Sign In to Recruiter Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: Candidate Detail & Interview Request */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedCandidate.avatarBg} text-white font-black text-lg flex items-center justify-center shadow-lg`}>
                {selectedCandidate.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCandidate.name}</h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{selectedCandidate.degree}</p>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{selectedCandidate.department}</span> · <span>{selectedCandidate.gradYear}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cumulative GPA:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedCandidate.gpa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Academic Standing:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedCandidate.honors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Current Availability:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedCandidate.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Preferred Location:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCandidate.location}</span>
              </div>
            </div>

            <div className="mb-6">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Candidate Bio & Background
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedCandidate.bio}
              </p>
            </div>

            <div className="mb-6">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Verified Technical Skills
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendInterviewRequest} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Request Interview / Candidate Profile
              </h5>
              <textarea
                required
                rows={3}
                value={interviewNote}
                onChange={(e) => setInterviewNote(e.target.value)}
                placeholder="Include your company name, target role title, and brief interview details..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInterview}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-astu-navy text-white text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingInterview ? 'Submitting...' : 'Send Inquiry to Alumni Office'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Job Detail & Apply */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                {selectedJob.typeLabel}
              </span>
              <span className="text-xs font-semibold text-slate-400">Deadline: {selectedJob.deadline}</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedJob.title}</h3>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4">{selectedJob.company}</div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Location:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedJob.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Compensation:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedJob.salary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Target Department:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedJob.department}</span>
              </div>
            </div>

            <div className="mb-6">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Job Overview
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedJob.description}
              </p>
            </div>

            <div className="mb-6">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Candidate Requirements
              </h5>
              <div className="space-y-2">
                {selectedJob.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success('Redirecting to the Alumni Application Portal...');
                  setSelectedJob(null);
                  navigate('/login');
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-astu-navy text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                Sign In & Apply via Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
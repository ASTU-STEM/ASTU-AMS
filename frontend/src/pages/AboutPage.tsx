import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Users,
  Briefcase,
  ShieldCheck,
  Award,
  BookOpen,
  LineChart,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Compass,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronDown,
  Globe,
  Sparkles,
  Layers,
  Cpu,
  Atom,
  Server,
  FileText,
  Calendar,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTheme } from '../hooks/useTheme';

export default function AboutPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'portals' | 'schools' | 'accreditation' | 'campus'>('overview');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    { label: 'Founded in', value: '1993', detail: 'Over 30 Years of Academic Excellence' },
    { label: 'Active Alumni', value: '35,000+', detail: 'Global Network in Tech & Industry' },
    { label: 'Engineering Schools', value: '5', detail: 'Centers of Applied Science Excellence' },
    { label: 'Partner Employers', value: '120+', detail: 'Active Industry MoUs & Recruiter Base' },
  ];

  const corePillars = [
    {
      icon: Cpu,
      title: 'Technological Excellence',
      description: 'Equipping graduates with advanced applied engineering competencies, software craftsmanship, and cutting-edge industrial laboratory training.',
    },
    {
      icon: LineChart,
      title: 'Data-Driven Tracer Studies',
      description: 'Conducting longitudinal tracer surveys at 6-month, 2-year, and 5-year post-graduation milestones to monitor employment velocity and career growth.',
    },
    {
      icon: Building2,
      title: 'Industry Co-Creation',
      description: 'Partnering directly with leading tech companies and state enterprises to align university curricula with private and public sector demand.',
    },
    {
      icon: ShieldCheck,
      title: 'Accreditation Readiness',
      description: 'Generating audited evidence packages fulfilling Education and Training Authority (ETA) requirements and international ABET standards.',
    },
  ];

  const portals = [
    {
      id: 'alumni',
      title: 'Alumni Portal',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-700',
      badge: 'For Graduates',
      summary: 'Centralized alumni profile management, career advancement, and institutional connection.',
      features: [
        'SIS-verified digital alumni credentials & ID cards',
        'Direct application to partner jobs and graduate trainee roles',
        'Longitudinal tracer study participation and survey rewards',
        'Alumni directory networking, mentorship, and reunion coordination',
      ],
      ctaText: 'Access Alumni Portal',
      ctaRoute: '/alumni/dashboard',
    },
    {
      id: 'employer',
      title: 'Employer Portal',
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-700',
      badge: 'For Industry Partners',
      summary: 'Connecting high-impact companies with accredited engineering, computing, and science talent.',
      features: [
        'TIN-verified corporate profile with tailored recruitment dashboard',
        'Curriculum-aligned candidate search filtering by department and skills',
        'Direct vacancy posting and application pipeline management',
        'Structured competency feedback informing university curriculum reviews',
      ],
      ctaText: 'Explore Partner Hub',
      ctaRoute: '/partners',
    },
    {
      id: 'department',
      title: 'Department Head Portal',
      icon: LineChart,
      color: 'from-amber-600 to-orange-700',
      badge: 'For Academic Leadership',
      summary: 'Actionable real-time intelligence on graduate employment trajectories and skill gaps.',
      features: [
        'Real-time employment rate and salary progression analytics',
        'Employer satisfaction reviews mapped to course learning outcomes',
        'Accreditation-ready evidence tables for ETA and HERQA audits',
        'Automated curriculum revision recommendations based on market data',
      ],
      ctaText: 'View Department Analytics',
      ctaRoute: '/department/dashboard',
    },
    {
      id: 'registrar',
      title: 'Registrar & Admin Portal',
      icon: Server,
      color: 'from-purple-600 to-violet-800',
      badge: 'For University Administration',
      summary: 'Official student information system synchronization, credential audit, and operations.',
      features: [
        'Identity verification and SIS registry harmonization',
        'Official transcript and degree verification processing',
        'Universal audit logs and role-based data security controls',
        'Central broadcast notification dispatch to the university community',
      ],
      ctaText: 'Registrar Dashboard',
      ctaRoute: '/registrar/dashboard',
    },
  ];

  const schools = [
    {
      name: 'School of Electrical Engineering & Computing (SEEC)',
      departments: ['Software Engineering', 'Computer Science & Engineering', 'Power & Control Systems', 'Electronics & Communication'],
      highlight: 'Home to the High-Performance Computing Cluster and the ASTU Software Innovation Center.',
      stats: '1,400+ Annual Graduates · 94% 6-Month Placement Rate',
    },
    {
      name: 'School of Mechanical, Chemical & Materials Engineering (SMCME)',
      departments: ['Mechanical Design & Manufacturing', 'Thermal & Automotive Engineering', 'Chemical Engineering', 'Materials Science'],
      highlight: 'State-of-the-art CNC machining labs, robotics center, and advanced materials characterization suites.',
      stats: '950+ Annual Graduates · 88% Placement in Industry & Energy',
    },
    {
      name: 'School of Civil Engineering & Architecture (SCEA)',
      departments: ['Structural Engineering', 'Geotechnical & Transportation', 'Water Resources Engineering', 'Architecture & Urban Planning'],
      highlight: 'Soil mechanics research center, earthquake engineering simulator, and BIM modeling laboratories.',
      stats: '820+ Annual Graduates · Core Partner to National Infrastructure Drives',
    },
    {
      name: 'School of Applied Natural Sciences (SANS)',
      departments: ['Applied Physics & Nanotechnology', 'Applied Mathematics & Modeling', 'Industrial Chemistry', 'Biotechnology'],
      highlight: 'Pioneering clean energy solar cells, bio-pesticides, and computational modeling projects.',
      stats: '600+ Annual Graduates · High Rate of International Graduate Fellowships',
    },
  ];

  const faqs = [
    {
      q: 'What is the primary mission of ASTU-AMS?',
      a: 'The ASTU Alumni Management System (ASTU-AMS) connects graduates, employer partners, and academic departments into a unified digital ecosystem. It provides longitudinal tracer study data to fulfill national accreditation standards while helping alumni secure top career opportunities.',
    },
    {
      q: 'How does ASTU verify alumni credentials?',
      a: 'All graduate registrations are automatically cross-checked against the official ASTU Registrar Student Information System (SIS), validating student ID, graduation year, degree, and department before granting verified alumni privileges.',
    },
    {
      q: 'How do employers use the platform for campus recruitment?',
      a: 'Verified employers with a valid Tax Identification Number (TIN) gain access to post career opportunities, search verified graduate talent pools, coordinate campus interviews, and submit structured feedback directly to academic department heads.',
    },
    {
      q: 'How do tracer studies benefit current and future students?',
      a: 'Tracer study surveys track graduate career velocity, salary benchmarks, and emerging skill demands. This data is fed directly into ASTU curriculum review committees, ensuring course syllabi continuously reflect modern industrial requirements.',
    },
    {
      q: 'Is the platform mobile responsive and secure?',
      a: 'Yes. ASTU-AMS is built with enterprise security, role-based access control, encrypted sessions, and full responsiveness across mobile devices, tablets, and desktop workstations in both Light and Dark themes.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-slate-900 to-astu-blue py-20 lg:py-28 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.04] bg-[size:3rem_3rem]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-astu-gold mb-6">
                <Sparkles className="w-4 h-4 text-astu-gold" />
                Flagship Science & Technology University
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
                Bridging Academic Excellence to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-emerald-300 to-yellow-200">
                  Global Industry
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-8">
                Adama Science and Technology University Alumni Management System (ASTU-AMS) connects over 35,000 graduates, premier corporate employers, and academic departments to drive institutional innovation, national accreditation, and career acceleration.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-astu-red to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-900/30 transition-all hover:scale-[1.02]"
                >
                  Join the Alumni Network
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/partners')}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all hover:scale-[1.02]"
                >
                  <Briefcase className="w-4 h-4 text-blue-300" />
                  Employer Partnerships
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl p-1 bg-gradient-to-b from-white/20 to-white/5 shadow-2xl backdrop-blur-sm">
                <div className="relative rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src="/images/astu-building.jpg"
                    alt="ASTU Main Campus Administrative Center"
                    className="w-full h-80 object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/campus-2.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600/80 backdrop-blur-sm text-[11px] font-bold text-white mb-2">
                      <MapPin className="w-3.5 h-3.5" /> Adama, Oromia, Ethiopia
                    </div>
                    <h3 className="text-xl font-bold text-white">Adama Science & Technology University</h3>
                    <p className="text-xs text-slate-300 mt-1">Center of Excellence in Applied Research, Engineering & Technology</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-black text-white">{s.value}</div>
                <div className="text-sm font-bold text-blue-300 mt-1">{s.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Navigation Tabs */}
      <section className="sticky top-16 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-2 py-3 no-scrollbar">
            {[
              { id: 'overview', label: 'Institutional Overview', icon: BookOpen },
              { id: 'portals', label: 'AMS Platform Architecture', icon: Layers },
              { id: 'schools', label: 'Academic Schools', icon: GraduationCap },
              { id: 'accreditation', label: 'Accreditation & Tracers', icon: ShieldCheck },
              { id: 'campus', label: 'Campus & Facilities', icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-astu-navy text-white dark:bg-blue-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* TAB 1: OVERVIEW & PILLARS */}
        {activeTab === 'overview' && (
          <div className="space-y-16">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  <Compass className="w-4 h-4" /> About the University
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  A Transformative Mandate for Applied Science and Innovation
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Established initially in 1993 as the Nazareth Technical Teachers College, the institution was upgraded in 2006 to university status and subsequently designated by the Federal Government of Ethiopia as a dedicated <strong>Center of Excellence in Science and Technology</strong>.
                </p>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Today, ASTU serves as the country’s primary engine for engineering talent, applied scientific research, technological entrepreneurship, and digital transformation across the Horn of Africa.
                </p>

                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                  <h4 className="text-sm font-bold text-astu-navy dark:text-blue-300 flex items-center gap-2">
                    <Award className="w-4 h-4 text-astu-gold" /> Institutional Vision
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    “To become the premier science and technology university in Africa, generating world-class graduates and pioneering technological solutions that advance national prosperity.”
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <img
                  src="/images/campus-2.jpeg"
                  alt="ASTU Modern Campus Facilities"
                  className="rounded-2xl shadow-md w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                />
                <img
                  src="/images/electriclabs.jpeg"
                  alt="ASTU Electrical Engineering Labs"
                  className="rounded-2xl shadow-md w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                />
                <img
                  src="/images/arc.jpg"
                  alt="Architecture Design Studios"
                  className="rounded-2xl shadow-md w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                />
                <img
                  src="/images/gc7.jpg"
                  alt="Graduation Commencement Celebration"
                  className="rounded-2xl shadow-md w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* 4 Core Pillars */}
            <div>
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Strategic Pillars of ASTU-AMS
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  How our integrated alumni management ecosystem drives value for graduates, academia, and enterprise partners.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {corePillars.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={idx}
                      className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{p.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AMS PLATFORM ARCHITECTURE */}
        {activeTab === 'portals' && (
          <div className="space-y-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                <Layers className="w-4 h-4" /> System Overview
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Four Interconnected Portals, One Unified Ecosystem
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                ASTU-AMS replaces fragmented spreadsheets and legacy data silos with an auditable platform connecting every primary stakeholder across the university lifecycle.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {portals.map((portal) => {
                const Icon = portal.icon;
                return (
                  <div
                    key={portal.id}
                    className="flex flex-col justify-between p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className={`p-3.5 rounded-xl bg-gradient-to-r ${portal.color} text-white shadow-md`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {portal.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{portal.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                        {portal.summary}
                      </p>

                      <div className="space-y-2.5 mb-8">
                        {portal.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(portal.ctaRoute)}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-astu-navy hover:text-white dark:hover:bg-blue-600 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all"
                    >
                      {portal.ctaText}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ACADEMIC SCHOOLS */}
        {activeTab === 'schools' && (
          <div className="space-y-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                <GraduationCap className="w-4 h-4" /> Centers of Excellence
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Academic Schools & Specialized Research
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                ASTU is organized into five premier schools providing rigorous, curriculum-aligned education across engineering, computer science, and applied natural sciences.
              </p>
            </div>

            <div className="grid gap-6">
              {schools.map((school, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{school.name}</h3>
                    <span className="inline-flex text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60 w-fit">
                      {school.stats}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                    {school.highlight}
                  </p>

                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Key Degree Programs & Departments
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {school.departments.map((dept, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200/80 dark:border-slate-700"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ACCREDITATION & TRACERS */}
        {activeTab === 'accreditation' && (
          <div className="space-y-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                <ShieldCheck className="w-4 h-4" /> Quality Assurance
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Longitudinal Tracer Studies & ETA Accreditation
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                ASTU-AMS is purpose-built to comply with Education and Training Authority (ETA) requirements, providing longitudinal employment analytics that feed directly into curriculum review.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm mb-4">
                  01
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">6-Month Tracer Wave</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Evaluates initial labor-market transition velocity, entry-level salaries, and relevance of undergraduate capstone projects.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm mb-4">
                  02
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">2-Year Progression Wave</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tracks job mobility, promotions to technical leads, employer satisfaction ratings, and continuing graduate studies.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm mb-4">
                  03
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">5-Year Impact Study</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Measures long-term industry leadership, patent filings, tech startup foundings, and global research publications.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-r from-astu-navy via-slate-900 to-astu-blue text-white shadow-xl">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <h3 className="text-2xl font-black mb-3">Audit-Ready Accreditation Evidence Center</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Department heads and institutional quality officers can export real-time evidence packages mapped to national HERQA and international ABET criteria with a single click.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate('/department/dashboard')}
                      className="px-6 py-3 rounded-xl bg-white text-astu-navy font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all"
                    >
                      View Quality Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/info/accreditation')}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
                    >
                      Read Full Accreditation Specs
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white/10 p-5 rounded-xl border border-white/10 backdrop-blur-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>ETA Alignment Score</span>
                    <span className="text-emerald-400 font-bold">98.4%</span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '98.4%' }} />
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Compliant with Ethiopian Higher Education Proclamation 1152/2019 quality assurance frameworks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CAMPUS & FACILITIES */}
        {activeTab === 'campus' && (
          <div className="space-y-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                <Building2 className="w-4 h-4" /> Living & Learning
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                World-Class Laboratories & Campus Infrastructure
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Situated on an expansive campus in Adama, ASTU features modern residential housing, advanced research centers, fabrication laboratories, and high-speed campus-wide fiber connectivity.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  img: '/images/Astu-buliding.jpg',
                  title: 'Main Administrative Center',
                  desc: 'Housing the President’s Office, Registrar Directorate, and Corporate Partnership Liaison.',
                },
                {
                  img: '/images/electriclabs.jpeg',
                  title: 'Specialized Engineering Labs',
                  desc: 'High-voltage testing labs, robotic prototyping workshops, and cleanroom facilities.',
                },
                {
                  img: '/images/arc.jpg',
                  title: 'Architectural Design Studios',
                  desc: 'CAD workstations, 3D printing suites, and sustainable urban design modeling spaces.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group"
                >
                  <div className="h-52 overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 pt-16 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Clear answers regarding ASTU-AMS operations, alumni verification, and employer partnerships.
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
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

        {/* Directory & Contact Card */}
        <div className="mt-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Institutional Contacts</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Have questions or need assistance with credential verification or partnership agreements? Our teams are available Monday through Friday.
              </p>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-2" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Campus Location</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Adama, Oromia, Ethiopia (P.O. Box 1888)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Telephone Desk</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">+251-221-110000 / 110400</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <Mail className="w-4 h-4 text-astu-red mb-2" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Official Email</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">irccd@astu.edu.et / alumni@astu.edu.et</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

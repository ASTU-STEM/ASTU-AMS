// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { CareerEvent, JobMatch, Mentor, SkillPathway, AlumniProfile } from '../types/alumni.types';
import toast from 'react-hot-toast';
import {
  CalendarDays, MapPin, Users, TrendingUp, Award, FileText, BarChart3, Target,
  CheckCircle2, BookOpen, Briefcase, GraduationCap, Rocket, Lightbulb,
  Code2, Cloud, Shield, Smartphone, Star, ExternalLink, Download, Check, Cpu, Wrench
} from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import Modal from '../../../components/ui/Modal';
import { AlumniSectionShell } from './AlumniSectionShell';
import {
  alumniCardClass,
  alumniLabelClass,
  alumniPanelClass,
  alumniSectionTitleClass,
  alumniStatusBadge,
} from './alumniUi';

interface CareerTabProps {
  events: CareerEvent[];
  jobs: JobMatch[];
  mentors: Mentor[];
  profile?: AlumniProfile | null;
  statsData?: any;
  onRegisterEvent: (eventId: number | string) => void;
  onApplyJob?: (jobId: number | string) => void;
  onViewJob?: (job: JobMatch) => void;
  onRequestMentorship?: (mentorId: number | string) => void;
}

interface ResourceItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  stats: string;
  fileName: string;
  content: string;
}

export const CareerTab: React.FC<CareerTabProps> = ({
  events = [],
  jobs = [],
  mentors = [],
  profile,
  statsData,
  onRegisterEvent,
  onApplyJob,
  onViewJob,
  onRequestMentorship,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllMentors, setShowAllMentors] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<number | null>(null);
  const [confirmEvent, setConfirmEvent] = useState<CareerEvent | null>(null);

  // Dynamic download counters for resources
  const [resourceDownloads, setResourceDownloads] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('astu_resource_downloads');
      return saved ? JSON.parse(saved) : {
        resume: 1240,
        interview: 890,
        coverletter: 654,
        salary: 2100,
      };
    } catch {
      return { resume: 1240, interview: 890, coverletter: 654, salary: 2100 };
    }
  });

  // Track enrolled pathways in state
  const [enrolledPathways, setEnrolledPathways] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('astu_enrolled_pathways');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  // Extract student's department dynamically with object safety
  const userDept = useMemo(() => {
    const raw = profile?.department || profile?.departmentName || profile?.user?.department || 'Software Engineering';
    if (typeof raw === 'object' && raw !== null) {
      return (raw as any).name || (raw as any).title || (raw as any).code || 'Software Engineering';
    }
    return typeof raw === 'string' ? raw : 'Software Engineering';
  }, [profile]);

  // Extract student's skills safely as lowercased string array
  const userSkills = useMemo(() => {
    return (profile?.skills || []).map(s => {
      if (typeof s === 'string') return s.toLowerCase();
      if (typeof s === 'object' && s !== null) return ((s as any).name || (s as any).title || String(s)).toLowerCase();
      return String(s).toLowerCase();
    });
  }, [profile?.skills]);

  // Dynamic Skill Pathways with AI Department Recommendations
  const skillPathways = useMemo(() => {
    const deptLower = (typeof userDept === 'string' ? userDept : 'Software Engineering').toLowerCase();

    const rawPathways = [
      {
        id: 1,
        title: 'Full-Stack Web Development',
        description: 'Master React, Node.js, and cloud deployment for modern web apps.',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
        duration: '6 months',
        level: 'intermediate',
        jobs: ['Full Stack Developer', 'Frontend Engineer', 'Backend Developer'],
        targetDepts: ['software', 'computer', 'cse', 'swe', 'it'],
        baseMatch: 98,
        aiReason: `Top AI Pick for ${userDept} graduates based on current market demand at Safaricom, Ethio Telecom & tech startups.`
      },
      {
        id: 2,
        title: 'AI & Machine Learning Engineering',
        description: 'Build production ML pipelines, LLMs, and computer vision systems.',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'AWS SageMaker', 'LangChain'],
        duration: '8 months',
        level: 'advanced',
        jobs: ['ML Engineer', 'Data Scientist', 'AI Specialist'],
        targetDepts: ['software', 'computer', 'cse', 'swe', 'ece', 'electrical', 'applied'],
        baseMatch: 95,
        aiReason: `Recommended for ${userDept} based on high demand in national AI initiative research & data intelligence.`
      },
      {
        id: 3,
        title: 'Cloud & DevOps Engineering',
        description: 'Master CI/CD, Kubernetes, and cloud infrastructure as code.',
        skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'Jenkins', 'GitHub Actions'],
        duration: '5 months',
        level: 'intermediate',
        jobs: ['DevOps Engineer', 'Cloud Architect', 'SRE'],
        targetDepts: ['software', 'computer', 'ece', 'electrical', 'telecom'],
        baseMatch: 91,
        aiReason: `High-priority track for ${userDept} to support enterprise cloud migration & infrastructure reliability.`
      },
      {
        id: 4,
        title: 'Mobile App Development',
        description: 'Build cross-platform mobile apps with React Native and Flutter.',
        skills: ['React Native', 'Flutter', 'Dart', 'Firebase', 'App Store Connect'],
        duration: '4 months',
        level: 'beginner',
        jobs: ['Mobile Developer', 'React Native Developer', 'Flutter Developer'],
        targetDepts: ['software', 'computer', 'swe'],
        baseMatch: 88,
        aiReason: `Ideal track for ${userDept} graduates building cross-platform Fintech & consumer mobile products.`
      },
      {
        id: 5,
        title: 'Cybersecurity Fundamentals',
        description: 'Learn ethical hacking, network security, and compliance frameworks.',
        skills: ['Python', 'Kali Linux', 'Wireshark', 'Nmap', 'Metasploit', 'ISO 27001'],
        duration: '6 months',
        level: 'intermediate',
        jobs: ['Security Analyst', 'Penetration Tester', 'Security Engineer'],
        targetDepts: ['software', 'computer', 'ece', 'electrical', 'network', 'insa'],
        baseMatch: 94,
        aiReason: `AI Recommended for INSA & Cyber defense technology roles for ${userDept} majors.`
      },
      {
        id: 6,
        title: 'CAD, Robotics & Industrial Automation',
        description: 'Master SolidWorks, PLC programming, ROS, and industrial IoT systems.',
        skills: ['SolidWorks', 'ROS 2', 'PLC Programming', 'MATLAB', 'C++', 'IoT Sensors'],
        duration: '7 months',
        level: 'intermediate',
        jobs: ['Robotics Engineer', 'Automation Specialist', 'Mechanical Design Engineer'],
        targetDepts: ['mechanical', 'meg', 'mechatronics', 'electrical', 'ece'],
        baseMatch: 98,
        aiReason: `Primary AI recommendation for ${userDept} engineering projects, robotics, and industrial manufacturing.`
      },
      {
        id: 7,
        title: 'BIM & Structural Software Systems',
        description: 'Master Revit, ETABS, GIS analysis, and modern digital construction tools.',
        skills: ['Revit', 'ETABS', 'ArcGIS', 'AutoCAD', 'Civil3D', 'Project Management'],
        duration: '6 months',
        level: 'intermediate',
        jobs: ['BIM Specialist', 'Structural Software Engineer', 'GIS Analyst'],
        targetDepts: ['civil', 'cve', 'architecture', 'construction'],
        baseMatch: 97,
        aiReason: `Top AI Recommendation for ${userDept} accreditation and smart infrastructure engineering.`
      },
      {
        id: 8,
        title: 'Data Analytics & Research Methods',
        description: 'Master R, Python, SQL, Tableau, and statistical modelling for engineering.',
        skills: ['Python', 'R', 'SQL', 'Tableau', 'PowerBI', 'Statistics'],
        duration: '5 months',
        level: 'intermediate',
        jobs: ['Data Analyst', 'Research Scientist', 'Quantitative Analyst'],
        targetDepts: ['chemical', 'applied', 'material', 'industrial', 'all'],
        baseMatch: 93,
        aiReason: `Recommended for ${userDept} graduates to lead analytical research & data-driven decision making.`
      }
    ];

    // Compute dynamic match percentage & AI recommendation flag based on userDept
    return rawPathways.map(p => {
      const isTargetDept = p.targetDepts.some(d => deptLower.includes(d) || d.includes(deptLower));
      const skillOverlap = p.skills.filter(sk => userSkills.some(us => us.includes(sk.toLowerCase()))).length;
      
      let computedMatch = isTargetDept ? p.baseMatch : Math.max(70, p.baseMatch - 18);
      computedMatch = Math.min(99, computedMatch + Math.min(5, skillOverlap * 2));

      return {
        ...p,
        matchPercentage: computedMatch,
        aiRecommended: isTargetDept || computedMatch >= 92
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [userDept, userSkills]);

  const pathwayIcons: Record<string, React.ElementType> = {
    'Full-Stack Web Development': Code2,
    'AI & Machine Learning Engineering': Lightbulb,
    'Cloud & DevOps Engineering': Cloud,
    'Mobile App Development': Smartphone,
    'Cybersecurity Fundamentals': Shield,
    'CAD, Robotics & Industrial Automation': Wrench,
    'BIM & Structural Software Systems': Cpu,
    'Data Analytics & Research Methods': BarChart3,
  };

  // Dynamic Categories from Events
  const categories = useMemo(() => {
    const defaultCats = ['All', 'Career Fair', 'Reunion', 'Workshop'];
    const eventCats = events.map(e => e.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...eventCats]));
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') return events;
    return events.filter(e => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const featuredJobs = useMemo(() => {
    return jobs.slice(0, showAllJobs ? undefined : 3);
  }, [jobs, showAllJobs]);

  const featuredMentors = useMemo(() => {
    return mentors.slice(0, showAllMentors ? undefined : 3);
  }, [mentors, showAllMentors]);

  // Dynamic Profile Strength Score
  const profileScore = useMemo(() => {
    if (statsData?.profileCompletion !== undefined && statsData?.profileCompletion !== null) {
      return Number(statsData.profileCompletion);
    }
    if (!profile) return 65;
    let score = 0;
    if (profile.fullName) score += 20;
    if (profile.currentRole || profile.company) score += 25;
    if (profile.skills && profile.skills.length > 0) score += 25;
    if (profile.bio) score += 15;
    if (profile.address || profile.email) score += 15;
    return score || 65;
  }, [profile, statsData]);

  // Helper for formatting event dates dynamically
  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return 'Date TBA';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper for computing dynamic job match percentage
  const getJobMatchPercentage = (job: JobMatch) => {
    if (job.matchPercentage) return job.matchPercentage;
    if (typeof job.match === 'string' && job.match.includes('%')) {
      const parsed = parseInt(job.match.replace('%', ''), 10);
      if (!isNaN(parsed)) return parsed;
    }
    const jobSkills = (job.skills || []).map(s => (typeof s === 'string' ? s : (s as any)?.name || String(s)).toLowerCase());
    if (jobSkills.length === 0 || userSkills.length === 0) return 88;
    const matches = jobSkills.filter(js => userSkills.some(us => us.includes(js) || js.includes(us))).length;
    const percentage = Math.round(70 + (matches / jobSkills.length) * 28);
    return Math.min(99, Math.max(68, percentage));
  };

  // Real Download handler for Career Resources
  const handleDownloadResource = (resource: ResourceItem) => {
    const content = resource.content;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resource.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const newDownloads = {
      ...resourceDownloads,
      [resource.id]: (resourceDownloads[resource.id] || 0) + 1
    };
    setResourceDownloads(newDownloads);
    try {
      localStorage.setItem('astu_resource_downloads', JSON.stringify(newDownloads));
    } catch (e) {
      // ignore
    }

    toast.success(`Downloaded: "${resource.title}" (${resource.fileName})`);
  };

  // Toggle Pathway Enrollment
  const handleTogglePathway = (pathwayId: number, pathwayTitle: string) => {
    let updated: number[];
    if (enrolledPathways.includes(pathwayId)) {
      updated = enrolledPathways.filter(id => id !== pathwayId);
      toast.success(`Unenrolled from "${pathwayTitle}"`);
    } else {
      updated = [...enrolledPathways, pathwayId];
      toast.success(`Successfully enrolled in "${pathwayTitle}" pathway!`);
    }
    setEnrolledPathways(updated);
    try {
      localStorage.setItem('astu_enrolled_pathways', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const careerResources: ResourceItem[] = [
    {
      id: 'resume',
      title: 'Technical Resume Builder',
      desc: 'ATS-optimized templates for engineering roles, with keyword guidance.',
      icon: FileText,
      color: 'text-astu-red',
      stats: '12 pages',
      fileName: 'ASTU_Technical_Resume_Guide.md',
      content: `# ASTU Engineering ATS Technical Resume Guide
Prepared for: ${profile?.fullName || 'ASTU Graduate'}
Department: ${userDept}

## Key Sections for High ATS Scoring:
1. Contact Details & Portfolio Link (GitHub/LinkedIn)
2. Core Technical Competencies (${(profile?.skills || ['React', 'Python', 'Node.js']).join(', ')})
3. Engineering Projects & Work Experience
4. Academic Accreditation & Degrees (Adama Science and Technology University)

## Recommendations:
- Use action verbs: Architected, Deployed, Engineered, Optimized.
- Include quantifiable metrics: "Improved load speed by 40%", "Built API handling 10k requests/sec".
`
    },
    {
      id: 'interview',
      title: 'Live Coding Interview Prep',
      desc: 'System design and algorithm problems from top tech companies.',
      icon: BarChart3,
      color: 'text-astu-green',
      stats: '48 challenges',
      fileName: 'ASTU_Coding_Interview_Prep.md',
      content: `# ASTU Live Coding & System Design Interview Kit
Department: ${userDept}

## Top Algorithmic Focus Areas:
- Data Structures: Arrays, HashMaps, Trees, Graphs, Queues
- System Design: Caching strategies, Load Balancing, Database Sharding, Microservices

## Practice Schedule:
- Spend 45 minutes on algorithmic problem solving daily.
- Prepare 2 structural system design walkthroughs for distributed systems.
`
    },
    {
      id: 'coverletter',
      title: 'Fintech Cover Letters',
      desc: 'Templates for Chapa, Telebirr, and international fintech roles.',
      icon: Award,
      color: 'text-[#003366]',
      stats: '6 templates',
      fileName: 'ASTU_Fintech_Cover_Letter_Templates.md',
      content: `# ASTU Fintech Cover Letter Templates
Department: ${userDept}

Dear Hiring Manager,

As a ${userDept} graduate from Adama Science and Technology University with expertise in software engineering and transactional systems, I am writing to express my interest in joining your engineering team.

Sincerely,
${profile?.fullName || 'ASTU Engineering Graduate'}
`
    },
    {
      id: 'salary',
      title: 'Salary Negotiation Guide',
      desc: 'Negotiation frameworks for Ethiopian and remote positions.',
      icon: Target,
      color: 'text-amber-600',
      stats: '8 sections',
      fileName: 'ASTU_Salary_Negotiation_Guide.md',
      content: `# ASTU Salary & Equity Negotiation Playbook

## Benchmarks for Ethiopian & Remote Tech Roles:
- Entry Level Engineer: Market range benchmarks based on tech stack and industry standards.
- Mid / Senior Specialist: Remote compensation standards (USD/ETB currency equity options).
`
    }
  ];

  return (
    <AlumniSectionShell
      eyebrow="Career hub"
      title="Grow your career"
      description={`Events, jobs, and mentors tailored for ASTU ${userDept} graduates.`}
      metrics={[
        { value: jobs.length > 0 ? jobs.length : (statsData?.openJobMatches || 0), label: 'Job Matches', accent: 'gold' },
        { value: mentors.length, label: 'Mentors', accent: 'green' },
        { value: events.length, label: 'Events', accent: 'white' },
      ]}
    >

      {/* Dynamic Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${alumniCardClass} p-5 transition-all hover:shadow-md`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-astu-navy/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-astu-navy" />
            </div>
            <p className={`${alumniLabelClass} mb-0`}>Job Matches Available</p>
          </div>
          <p className="text-3xl font-extrabold text-[var(--text-primary)]">
            {jobs.length > 0 ? jobs.length : (statsData?.openJobMatches || 0)}
          </p>
          <p className="text-[10px] text-astu-green font-semibold mt-1">
            {jobs.filter(j => j.applied).length > 0
              ? `${jobs.filter(j => j.applied).length} applications submitted • Live matches`
              : `Updated live for ${userDept}`}
          </p>
        </div>

        <div className={`${alumniCardClass} p-5 transition-all hover:shadow-md`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-astu-green/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-astu-green" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Skill Pathways</p>
          </div>
          <p className="text-3xl font-extrabold text-[var(--text-primary)]">{skillPathways.length}</p>
          <p className="text-[10px] text-astu-navy font-semibold mt-1">
            {enrolledPathways.length > 0
              ? `${enrolledPathways.length} active track(s) enrolled`
              : `AI matched for ${userDept}`}
          </p>
        </div>

        <div className={`${alumniCardClass} p-5 transition-all hover:shadow-md`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Alumni Mentors Online</p>
          </div>
          <p className="text-3xl font-extrabold text-[var(--text-primary)]">
            {mentors.length > 0 ? mentors.length : (statsData?.activeMentorships || 0)}
          </p>
          <p className="text-[10px] text-purple-600 font-semibold mt-1">
            {mentors.filter(m => m.status === 'CONNECTED').length > 0
              ? `${mentors.filter(m => m.status === 'CONNECTED').length} active connections`
              : 'Available for mentorship & guidance'}
          </p>
        </div>
      </div>

      {/* Main Grid: Resources (left) and Events (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Dynamic Resources & Readiness Score */}
        <div className="space-y-6 lg:col-span-1">
          <div className={`${alumniPanelClass} space-y-6`}>
            <h3 className={`${alumniSectionTitleClass} flex items-center gap-2`}>
              <BookOpen className="h-5 w-5 text-astu-navy" />
              Career Resource Center
            </h3>

            <div className="space-y-4">
              {careerResources.map((res) => {
                const currentDownloads = resourceDownloads[res.id] || 1000;
                return (
                  <div
                    key={res.id}
                    onClick={() => handleDownloadResource(res)}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer transition-all hover:border-astu-navy/20 group"
                  >
                    <div className="p-2.5 rounded-xl bg-gray-50 group-hover:scale-105 transition-transform">
                      <res.icon className={`h-5 w-5 ${res.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{res.title}</h4>
                        <Download className="h-3.5 w-3.5 text-gray-400 group-hover:text-astu-navy transition-colors" />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{res.desc}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px]">
                        <span className="text-astu-navy font-semibold">{res.stats}</span>
                        <span className="text-gray-400">{currentDownloads.toLocaleString()} downloads</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Career Progress Tracker */}
          <div className={alumniPanelClass}>
            <h3 className={`${alumniSectionTitleClass} mb-4 flex items-center gap-2`}>
              <TrendingUp className="h-4 w-4 text-astu-navy" />
              Career Readiness Score
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Profile Strength</span>
                <span className="text-xs font-bold text-astu-navy">{profileScore}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-astu-navy to-astu-green rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, profileScore))}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500">
                {profileScore >= 85
                  ? 'Your profile is complete and highly visible to top employers.'
                  : profileScore >= 60
                  ? 'Add skills, work experience, and bio to reach top employer visibility.'
                  : 'Complete your profile details to unlock personalized job recommendations.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Events Portal */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${alumniPanelClass} space-y-6`}>
            
            {/* Header and Filter Category Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className={alumniSectionTitleClass}>Alumni Events Portal</h3>
                <p className="text-sm text-gray-600">Register for exclusive recruitment workshops and technology reunions</p>
              </div>
              <div className="flex gap-1.5 overflow-x-auto py-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all border whitespace-nowrap ${
                      selectedCategory === cat 
                        ? 'bg-[#003366] border-[#003366] text-white shadow-md'
                        : 'bg-[var(--bg-page)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Event Cards Listing */}
            <div className="space-y-6">
              {filteredEvents.map(event => (
                <div 
                  key={event.id}
                  className="group flex flex-col gap-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 transition-all hover:shadow-md"
                >
                  <img 
                    src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60'} 
                    alt={event.title} 
                    className="w-full md:w-44 h-32 object-cover rounded-xl shadow-sm group-hover:opacity-90 transition-opacity"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={alumniStatusBadge.brand}>{event.category || 'Workshop'}</span>
                        {event.registered && (
                          <span className="flex items-center gap-1 text-xs font-bold text-astu-green bg-astu-green/10 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Registered
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{event.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{event.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-astu-navy" />
                          {formatEventDate(event.date)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-astu-navy" />
                            {event.location.split(',')[0]}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setConfirmEvent(event);
                        }}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          event.registered 
                            ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-astu-navy hover:bg-astu-navy/90 text-white hover:scale-105'
                        }`}
                        disabled={event.registered}
                      >
                        {event.registered ? 'Registered' : 'Register Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredEvents.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-500">
                  <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No events found for category "{selectedCategory}"</p>
                  <p className="text-xs text-gray-400 mt-1">Check back soon for new career fairs, tech talks, and reunions.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Featured Jobs Section */}
      <section className={`${alumniPanelClass} space-y-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`${alumniSectionTitleClass} flex items-center gap-2`}>
              <Briefcase className="h-5 w-5 text-astu-navy" />
              Featured Job Openings
            </h3>
            <p className="text-sm text-gray-600 mt-1">Top matches based on your profile and skills</p>
          </div>
          {jobs.length > 3 && (
            <button
              onClick={() => setShowAllJobs(!showAllJobs)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-astu-navy hover:bg-astu-navy/5 border border-astu-navy/20 transition-all"
            >
              {showAllJobs ? 'Show Less' : `View All (${jobs.length})`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredJobs.map((job) => {
            const matchScore = getJobMatchPercentage(job);
            return (
              <div
                key={job.id}
                onClick={() => {
                  if (onViewJob) {
                    onViewJob(job);
                  }
                }}
                className={`${alumniCardClass} p-5 hover:border-astu-navy/30 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-astu-green/10">
                      <Briefcase className="h-5 w-5 text-astu-green" />
                    </div>
                    <span className="px-2 py-0.5 bg-astu-green/10 text-astu-green text-[10px] font-bold rounded-full">
                      {matchScore}% match
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{job.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{job.company} • {job.location}</p>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-astu-green">{job.salary || 'Competitive'}</span>
                  {job.applied ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info(`You have already submitted an application for ${job.title} at ${job.company}.`);
                      }}
                      className="text-[10px] text-astu-green font-bold flex items-center gap-1 bg-astu-green/10 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Applied
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onApplyJob) {
                          onApplyJob(job.id);
                        }
                      }}
                      className="text-[10px] text-white bg-astu-navy hover:bg-astu-navy/90 font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-sm transition-all hover:scale-105"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Quick Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {jobs.length === 0 && (
            <EmptyState
              className="col-span-3"
              icon={<Briefcase className="h-10 w-10 text-slate-400" />}
              title="No active job matches yet"
              description="No openings match your profile right now. New roles appear here as employers post them."
            />
          )}
        </div>
      </section>

      {/* Dynamic Top Mentors Section */}
      <section className={`${alumniPanelClass} space-y-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`${alumniSectionTitleClass} flex items-center gap-2`}>
              <Star className="h-5 w-5 text-astu-navy" />
              Top Alumni Mentors
            </h3>
            <p className="text-sm text-gray-600 mt-1">Connect with experienced alumni in your field</p>
          </div>
          {mentors.length > 3 && (
            <button
              onClick={() => setShowAllMentors(!showAllMentors)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-astu-navy hover:bg-astu-navy/5 border border-astu-navy/20 transition-all"
            >
              {showAllMentors ? 'Show Less' : `View All (${mentors.length})`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredMentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => {
                if (onRequestMentorship && mentor.status !== 'CONNECTED' && mentor.status !== 'REQUEST_PENDING') {
                  onRequestMentorship(mentor.id);
                  toast.success(`Mentorship request sent to ${mentor.name}!`);
                } else {
                  toast.info(`Status with ${mentor.name}: ${mentor.status || 'Connected'}`);
                }
              }}
              className="rounded-2xl border border-gray-200 p-5 hover:border-astu-navy/30 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={mentor.avatar || mentor.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-astu-navy/10"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-astu-navy transition-colors">{mentor.name}</h4>
                    <p className="text-xs text-gray-500">{mentor.title || mentor.role || 'Senior Engineer'} {mentor.company ? `at ${mentor.company}` : ''}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{mentor.bio || 'ASTU alumnus experienced in engineering & technical guidance.'}</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  {mentor.rating || '4.9'} ({mentor.reviewCount || mentor.reviews || 12})
                </span>
                <span className="flex items-center gap-1 text-[10px] text-astu-green font-bold">
                  {mentor.status === 'REQUEST_PENDING' ? (
                    <span className="text-amber-600">Request Pending</span>
                  ) : mentor.status === 'CONNECTED' ? (
                    <span className="text-astu-navy">Connected</span>
                  ) : (
                    <>
                      <Users className="h-3 w-3" />
                      {mentor.mentees || 15}+ mentees
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}

          {mentors.length === 0 && (
            <EmptyState
              className="col-span-3"
              icon={<Users className="h-10 w-10 text-slate-400" />}
              title="No mentors listed yet"
              description="No alumni mentors are available right now. Check back soon, or check the Mentorship tab for the full directory."
            />
          )}
        </div>
      </section>

      {/* Dynamic Skill Pathways Section */}
      <section className={`${alumniPanelClass} space-y-6`}>
        <div>
          <h3 className={`${alumniSectionTitleClass} flex items-center gap-2`}>
            <Rocket className="h-5 w-5 text-astu-navy" />
            Skill Development Pathways
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Recommended learning tracks based on your ASTU Department (<span className="font-semibold text-astu-navy">{userDept}</span>) and market demand
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillPathways.map((pathway) => {
            const IconComponent = pathwayIcons[pathway.title] || Code2;
            const isEnrolled = enrolledPathways.includes(pathway.id);
            const isSelected = selectedPathway === pathway.id;

            return (
              <div
                key={pathway.id}
                onClick={() => setSelectedPathway(isSelected ? null : pathway.id)}
                className={`rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 relative ${
                  isSelected
                    ? 'border-astu-navy bg-astu-navy/5 shadow-md'
                    : isEnrolled
                    ? 'border-astu-green/40 bg-astu-green/5 hover:border-astu-green'
                    : 'border-gray-200 hover:border-astu-navy/30 bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-astu-navy/10">
                    <IconComponent className="h-6 w-6 text-astu-navy" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isEnrolled && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-astu-green/20 text-astu-green flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Enrolled
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      pathway.level === 'beginner' ? 'bg-green-100 text-green-700' :
                      pathway.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {pathway.level}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 mb-1">{pathway.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{pathway.description}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pathway.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-md">{skill}</span>
                  ))}
                  {pathway.skills.length > 4 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-md">+{pathway.skills.length - 4}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-astu-navy" />
                    {pathway.duration}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-astu-green">
                    <Users className="h-3.5 w-3.5" />
                    {pathway.matchPercentage}% match
                  </span>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">All Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pathway.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-astu-navy/10 text-astu-navy text-[10px] font-bold rounded-md">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">Target Roles</p>
                      <div className="space-y-1">
                        {pathway.jobs.map((jobRole, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-astu-green" />
                            {jobRole}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePathway(pathway.id, pathway.title);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isEnrolled
                          ? 'bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200'
                          : 'bg-gradient-to-r from-astu-navy to-[#004d99] text-white hover:shadow-md'
                      }`}
                    >
                      {isEnrolled ? 'Leave Track' : 'Enroll in Pathway'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Event Registration Confirmation Modal */}
      {confirmEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-astu-navy/10 text-astu-navy rounded-xl">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-gray-900">Confirm Event RSVP</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmEvent(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="px-2.5 py-0.5 bg-astu-navy/10 text-astu-navy text-[10px] font-extrabold uppercase tracking-widest rounded">
                {confirmEvent.category || 'Event'}
              </span>
              <h4 className="text-lg font-extrabold text-gray-900">{confirmEvent.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{confirmEvent.description}</p>
              
              <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-astu-navy shrink-0" />
                  <span className="font-semibold">{formatEventDate(confirmEvent.date)}</span>
                </div>
                {confirmEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-astu-navy shrink-0" />
                    <span>{confirmEvent.location}</span>
                  </div>
                )}
              </div>

              <p className="text-xs font-semibold text-astu-navy/90 bg-blue-50 p-3 rounded-xl border border-blue-100">
                Are you sure you want to register for this event? A seat will be reserved for your account and reminders will be sent to your dashboard.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirmEvent(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRegisterEvent(confirmEvent.id);
                  toast.success(`Successfully registered for: ${confirmEvent.title}!`);
                  setConfirmEvent(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-astu-navy hover:bg-astu-navy/90 shadow-md transition-all hover:scale-105"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </AlumniSectionShell>
  );
};

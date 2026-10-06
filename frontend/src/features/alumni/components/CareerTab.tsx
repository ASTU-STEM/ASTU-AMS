// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { CareerEvent, JobMatch, Mentor, SkillPathway, AlumniProfile } from '../types/alumni.types';
import toast from 'react-hot-toast';
import {
  CalendarDays, MapPin, Users, TrendingUp, Award, FileText, BarChart3, Target,
  CheckCircle2, BookOpen, Briefcase, GraduationCap, Rocket, Lightbulb,
  Code2, Cloud, Shield, Smartphone, Star, ExternalLink, Download, Check, Cpu, Wrench, X,
  Sparkles, ChevronRight,
} from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { AlumniSectionShell } from './AlumniSectionShell';
import { AlumniSectionBlock } from './AlumniSectionBlock';
import {
  alumniCardClass,
  alumniGhostBtnClass,
  alumniGridGapClass,
  alumniLabelClass,
  alumniPanelClass,
  alumniPrimaryBtnClass,
  alumniSectionTitleClass,
  alumniStatusBadge,
  alumniTabBtn,
  alumniTabRailClass,
} from './alumniUi';
import { ApplicationStatusBadge, formatEmploymentStatus } from '../utils/statusUi';

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
  onTabChange?: (tab: string) => void;
}

type CareerWorkspaceSection = 'overview' | 'events' | 'jobs' | 'mentors' | 'pathways' | 'resources';

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
  onTabChange,
}) => {
  const [workspaceSection, setWorkspaceSection] = useState<CareerWorkspaceSection>('overview');
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

  const appliedJobsCount = useMemo(() => jobs.filter((j) => j.applied).length, [jobs]);
  const registeredEventsCount = useMemo(() => events.filter((e) => e.registered).length, [events]);
  const connectedMentorsCount = useMemo(
    () => mentors.filter((m) => m.status === 'CONNECTED').length,
    [mentors],
  );

  const readinessDimensions = useMemo(
    () => [
      {
        label: 'Profile & identity',
        score: profile?.fullName && profile?.email ? 100 : profile?.fullName ? 70 : 40,
        hint: 'Name, contact, and verified alumni record',
      },
      {
        label: 'Skills & portfolio',
        score: userSkills.length >= 5 ? 95 : userSkills.length >= 2 ? 72 : userSkills.length > 0 ? 50 : 25,
        hint: 'Technical skills employers match against',
      },
      {
        label: 'Employment signal',
        score: profile?.currentRole || profile?.company ? 90 : profile?.employmentStatus ? 55 : 30,
        hint: 'Role, company, and tracer employment status',
      },
      {
        label: 'Market activity',
        score: Math.min(100, appliedJobsCount * 18 + enrolledPathways.length * 12 + registeredEventsCount * 10),
        hint: 'Applications, pathways, and event RSVPs',
      },
    ],
    [profile, userSkills.length, appliedJobsCount, enrolledPathways.length, registeredEventsCount],
  );

  const showSection = (section: CareerWorkspaceSection) =>
    workspaceSection === 'overview' || workspaceSection === section;

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

  const workspaceNav: { id: CareerWorkspaceSection; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Events', count: events.length },
    { id: 'jobs', label: 'Job matches', count: jobs.length },
    { id: 'mentors', label: 'Mentors', count: mentors.length },
    { id: 'pathways', label: 'Pathways', count: skillPathways.length },
    { id: 'resources', label: 'Resources', count: careerResources.length },
  ];

  const exploreWorkspaceCards = [
    {
      id: 'events' as const,
      title: 'Events & RSVP',
      detail: 'Career fairs, reunions, and workshops with one-click registration.',
      stat: `${registeredEventsCount} registered · ${events.length} upcoming`,
      icon: CalendarDays,
    },
    {
      id: 'jobs' as const,
      title: 'Matched openings',
      detail: 'Live roles scored against your skills and department.',
      stat: `${appliedJobsCount} applied · ${jobs.length} matches`,
      icon: Briefcase,
    },
    {
      id: 'mentors' as const,
      title: 'Alumni mentors',
      detail: 'Request guidance from graduates in your field.',
      stat: `${connectedMentorsCount} connected · ${mentors.length} available`,
      icon: Users,
    },
    {
      id: 'pathways' as const,
      title: 'Skill pathways',
      detail: 'AI-ranked learning tracks for your department.',
      stat: `${enrolledPathways.length} enrolled · ${skillPathways.length} tracks`,
      icon: Rocket,
    },
    {
      id: 'resources' as const,
      title: 'Downloadable kits',
      detail: 'Resume, interview, cover letter, and salary playbooks.',
      stat: `${careerResources.length} guides · personalized exports`,
      icon: BookOpen,
    },
  ];

  return (
    <AlumniSectionShell
      eyebrow="Alumni workspace"
      title="Career Center"
      description={`Your ASTU career workspace — events, employer matches, mentorship, AI skill pathways, and downloadable playbooks for ${userDept} graduates.`}
      metrics={[
        { value: jobs.length > 0 ? jobs.length : (statsData?.openJobMatches || 0), label: 'Job matches', accent: 'gold' },
        { value: mentors.length, label: 'Mentors', accent: 'green' },
        { value: events.length, label: 'Events', accent: 'white' },
        { value: `${profileScore}%`, label: 'Readiness', accent: 'green' },
      ]}
      actions={
        <div className="flex flex-col gap-3 w-full max-w-xl">
          <div className={`${alumniTabRailClass} !border-white/20 !bg-white/10`}>
            {workspaceNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setWorkspaceSection(item.id)}
                className={`${alumniTabBtn(workspaceSection === item.id)} !min-w-[5.5rem] !text-xs ${
                  workspaceSection === item.id ? '!bg-white !text-[#003366]' : '!text-white/85 hover:!bg-white/10'
                }`}
              >
                {item.label}
                {item.count != null && item.id !== 'overview' && (
                  <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.5 text-[9px] font-bold">{item.count}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {onTabChange && (
              <>
                <button type="button" onClick={() => onTabChange('jobs')} className={alumniGhostBtnClass + ' !text-white/90 border border-white/25 px-3 py-1.5 text-xs'}>
                  Full jobs board
                </button>
                <button type="button" onClick={() => onTabChange('tools')} className={alumniGhostBtnClass + ' !text-white/90 border border-white/25 px-3 py-1.5 text-xs'}>
                  Alumni tools
                </button>
                <button type="button" onClick={() => onTabChange('mentorship')} className={alumniGhostBtnClass + ' !text-white/90 border border-white/25 px-3 py-1.5 text-xs'}>
                  Mentorship hub
                </button>
              </>
            )}
          </div>
        </div>
      }
    >

      {workspaceSection === 'overview' && (
        <>
          <AlumniSectionBlock
            step={1}
            title="Workspace snapshot"
            description="Live signals from your profile, applications, and career activity."
          >
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 ${alumniGridGapClass}`}>
              <div className={`${alumniCardClass} p-4`}>
                <p className={alumniLabelClass}>Department</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">{userDept}</p>
                <span className={`${alumniStatusBadge.brand} mt-2`}>ASTU graduate</span>
              </div>
              <div className={`${alumniCardClass} p-4`}>
                <p className={alumniLabelClass}>Employment</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">{formatEmploymentStatus(profile?.employmentStatus)}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{profile?.currentRole || profile?.company || 'Add role in Profile for better matches'}</p>
              </div>
              <div className={`${alumniCardClass} p-4`}>
                <p className={alumniLabelClass}>Applications</p>
                <p className="text-2xl font-extrabold text-[var(--text-primary)]">{appliedJobsCount}</p>
                <p className="text-xs text-[var(--text-secondary)]">of {jobs.length} open matches</p>
              </div>
              <div className={`${alumniCardClass} p-4`}>
                <p className={alumniLabelClass}>Event RSVPs</p>
                <p className="text-2xl font-extrabold text-[var(--text-primary)]">{registeredEventsCount}</p>
                <p className="text-xs text-[var(--text-secondary)]">{events.length} events in portal</p>
              </div>
            </div>
          </AlumniSectionBlock>

          <AlumniSectionBlock
            step={2}
            title="Explore career features"
            description="Each area opens focused tools — pick a card to jump in."
          >
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${alumniGridGapClass}`}>
              {exploreWorkspaceCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setWorkspaceSection(card.id)}
                  className={`${alumniCardClass} group p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#003366]/30 hover:shadow-md dark:hover:border-[#FFCC00]/30`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003366]/10 text-[#003366] dark:bg-[#FFCC00]/15 dark:text-[#FFD700]">
                      <card.icon className="h-5 w-5" />
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <h4 className="mt-4 text-sm font-bold text-[var(--text-primary)]">{card.title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">{card.detail}</p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-[#003366] dark:text-[#FFD700]">{card.stat}</p>
                </button>
              ))}
            </div>
          </AlumniSectionBlock>

          <AlumniSectionBlock step={3} title="Career readiness" description="Four dimensions employers and ASTU tracer surveys care about.">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                {readinessDimensions.map((dim) => (
                  <div key={dim.label}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{dim.label}</span>
                      <span className="text-xs font-bold text-[#003366] dark:text-[#FFD700]">{dim.score}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-page)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#003366] to-emerald-500 transition-all duration-500"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">{dim.hint}</p>
                  </div>
                ))}
              </div>
              <div className={`${alumniCardClass} p-5`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Overall readiness</h4>
                </div>
                <p className="mt-3 text-4xl font-extrabold text-[var(--text-primary)]">{profileScore}%</p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {profileScore >= 85
                    ? 'Strong visibility to recruiters. Keep applying and attending events.'
                    : profileScore >= 60
                      ? 'Good progress — add skills, bio, and employment details to unlock top-tier matches.'
                      : 'Complete your profile and enroll in a pathway to unlock personalized recommendations.'}
                </p>
                {onTabChange && (
                  <button type="button" onClick={() => onTabChange('profile')} className={alumniPrimaryBtnClass + ' mt-4 w-full text-xs'}>
                    Improve profile
                  </button>
                )}
              </div>
            </div>
          </AlumniSectionBlock>
        </>
      )}

      {showSection('resources') && (
        <AlumniSectionBlock
          step={1}
          title="Career Resource Center"
          description="Personalized Markdown kits you can download and edit — resume, interviews, cover letters, and salary negotiation."
        >
          <div className={`grid grid-cols-1 md:grid-cols-2 ${alumniGridGapClass}`}>
            {careerResources.map((res) => {
              const currentDownloads = resourceDownloads[res.id] || 1000;
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleDownloadResource(res)}
                  className="flex items-start gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-page)] p-4 text-left transition-all hover:border-[#003366]/25 hover:shadow-md group"
                >
                  <div className="rounded-xl bg-[var(--bg-card)] p-2.5 transition-transform group-hover:scale-105">
                    <res.icon className={`h-5 w-5 ${res.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[#003366] dark:group-hover:text-[#FFD700]">{res.title}</h4>
                      <Download className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{res.desc}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                      <span className={alumniStatusBadge.brand}>{res.stats}</span>
                      <span className="text-[var(--text-muted)]">{currentDownloads.toLocaleString()} downloads</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </AlumniSectionBlock>
      )}

      {showSection('events') && (
        <AlumniSectionBlock
          step={1}
          title="Alumni Events Portal"
          description="Register for career fairs, reunions, and workshops. RSVPs sync to your dashboard reminders."
          aside={
            <span className={alumniStatusBadge.info}>
              {registeredEventsCount} registered · {filteredEvents.length} shown
            </span>
          }
        >
          <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'border-[#003366] bg-[#003366] text-white shadow-md'
                    : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group flex flex-col gap-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 transition-all hover:shadow-md md:flex-row md:items-stretch"
              >
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60'}
                  alt={event.title}
                  className="h-36 w-full shrink-0 rounded-xl object-cover shadow-sm md:h-auto md:w-44"
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={alumniStatusBadge.brand}>{event.category || 'Workshop'}</span>
                        {event.registered && (
                          <span className={alumniStatusBadge.success}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Registered
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-astu-navy transition-colors">{event.title}</h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{event.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-[var(--border-color)]">
                      <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
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
                            ? 'bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed' 
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
              <div className="rounded-2xl border-2 border-dashed border-[var(--border-color)] p-12 text-center text-[var(--text-muted)]">
                <CalendarDays className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                <p className="text-sm font-semibold">No events found for category &quot;{selectedCategory}&quot;</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Check back soon for new career fairs, tech talks, and reunions.</p>
              </div>
            )}
          </div>
        </AlumniSectionBlock>
      )}

      {showSection('jobs') && (
      <AlumniSectionBlock
        step={1}
        title="Featured job openings"
        description="Top matches scored from your skills, department, and live employer postings."
        aside={
          jobs.length > 3 ? (
            <button
              type="button"
              onClick={() => setShowAllJobs(!showAllJobs)}
              className={alumniGhostBtnClass + ' text-xs'}
            >
              {showAllJobs ? 'Show less' : `View all (${jobs.length})`}
            </button>
          ) : null
        }
      >
        <div className={`grid grid-cols-1 md:grid-cols-3 ${alumniGridGapClass}`}>
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
                  <h4 className="font-bold text-[var(--text-primary)] group-hover:text-astu-navy transition-colors">{job.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{job.company} • {job.location}</p>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[var(--bg-page)] text-[var(--text-secondary)] text-[10px] font-bold rounded-md">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)]">
                  <span className="text-xs font-bold text-astu-green">{job.salary || 'Competitive'}</span>
                  {job.applied ? (
                    <span onClick={(e) => e.stopPropagation()} role="presentation">
                      <ApplicationStatusBadge status={job.applicationStatus || 'Applied'} className="!text-[9px]" />
                    </span>
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
              icon={<Briefcase className="h-10 w-10 text-[var(--text-muted)]" />}
              title="No active job matches yet"
              description="No openings match your profile right now. New roles appear here as employers post them."
            />
          )}
        </div>
      </AlumniSectionBlock>
      )}

      {showSection('mentors') && (
      <AlumniSectionBlock
        step={1}
        title="Top alumni mentors"
        description="Connect with experienced graduates for architecture, career, and industry guidance."
        aside={
          mentors.length > 3 ? (
            <button type="button" onClick={() => setShowAllMentors(!showAllMentors)} className={alumniGhostBtnClass + ' text-xs'}>
              {showAllMentors ? 'Show less' : `View all (${mentors.length})`}
            </button>
          ) : null
        }
      >
        <div className={`grid grid-cols-1 md:grid-cols-3 ${alumniGridGapClass}`}>
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
              className="rounded-2xl border border-[var(--border-color)] p-5 hover:border-astu-navy/30 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={mentor.avatar || mentor.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={mentor.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-astu-navy/10"
                  />
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] group-hover:text-astu-navy transition-colors">{mentor.name}</h4>
                    <p className="text-xs text-[var(--text-muted)]">{mentor.title || mentor.role || 'Senior Engineer'} {mentor.company ? `at ${mentor.company}` : ''}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{mentor.bio || 'ASTU alumnus experienced in engineering & technical guidance.'}</p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)]">
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  {mentor.rating || '4.9'} ({mentor.reviewCount || mentor.reviews || 12})
                </span>
                {mentor.status === 'REQUEST_PENDING' ? (
                  <span className={alumniStatusBadge.warning}>Request pending</span>
                ) : mentor.status === 'CONNECTED' ? (
                  <span className={alumniStatusBadge.success}>Connected</span>
                ) : (
                  <span className={`${alumniStatusBadge.neutral} gap-1`}>
                    <Users className="h-3 w-3" />
                    {mentor.mentees || 15}+ mentees
                  </span>
                )}
              </div>
            </div>
          ))}

          {mentors.length === 0 && (
            <EmptyState
              className="col-span-3"
              icon={<Users className="h-10 w-10 text-[var(--text-muted)]" />}
              title="No mentors listed yet"
              description="No alumni mentors are available right now. Check back soon, or check the Mentorship tab for the full directory."
            />
          )}
        </div>
      </AlumniSectionBlock>
      )}

      {showSection('pathways') && (
      <AlumniSectionBlock
        step={1}
        title="Skill development pathways"
        description={`AI-ranked learning tracks for ${userDept} — tap a card for skills, target roles, and enrollment.`}
      >
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${alumniGridGapClass}`}>
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
                    : 'border-[var(--border-color)] hover:border-astu-navy/30 bg-[var(--bg-card)] hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-astu-navy/10">
                    <IconComponent className="h-6 w-6 text-astu-navy" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pathway.aiRecommended && (
                      <span className={alumniStatusBadge.brand + ' !text-[9px]'}>AI pick</span>
                    )}
                    {isEnrolled && (
                      <span className={alumniStatusBadge.success + ' !text-[9px]'}>
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

                <h4 className="font-bold text-[var(--text-primary)] mb-1">{pathway.title}</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{pathway.description}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pathway.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[var(--bg-page)] text-[var(--text-secondary)] text-[10px] font-bold rounded-md">{skill}</span>
                  ))}
                  {pathway.skills.length > 4 && (
                    <span className="px-2 py-0.5 bg-[var(--bg-page)] text-[var(--text-muted)] text-[10px] font-bold rounded-md">+{pathway.skills.length - 4}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
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
                  <div className="mt-4 space-y-3 border-t border-[var(--border-color)] pt-4">
                    <p className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                      {pathway.aiReason}
                    </p>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-2">All Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pathway.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-astu-navy/10 text-astu-navy text-[10px] font-bold rounded-md">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-2">Target Roles</p>
                      <div className="space-y-1">
                        {pathway.jobs.map((jobRole, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
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
                          ? 'bg-[var(--bg-page)] hover:bg-red-50 text-[var(--text-secondary)] hover:text-red-600 border border-[var(--border-color)]'
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
      </AlumniSectionBlock>
      )}

      {/* Event Registration Confirmation Modal */}
      {confirmEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[var(--border-color)] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-astu-navy/10 text-astu-navy rounded-xl">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Confirm Event RSVP</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmEvent(null)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="px-2.5 py-0.5 bg-astu-navy/10 text-astu-navy text-[10px] font-extrabold uppercase tracking-widest rounded">
                {confirmEvent.category || 'Event'}
              </span>
              <h4 className="text-lg font-extrabold text-[var(--text-primary)]">{confirmEvent.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{confirmEvent.description}</p>
              
              <div className="p-3 bg-[var(--bg-page)] rounded-xl space-y-2 border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
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

              <p className="text-xs font-semibold text-astu-navy/90 dark:text-blue-200 bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-100 dark:border-blue-500/25">
                Are you sure you want to register for this event? A seat will be reserved for your account and reminders will be sent to your dashboard.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setConfirmEvent(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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

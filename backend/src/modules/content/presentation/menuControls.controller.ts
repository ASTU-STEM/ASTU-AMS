import { Request, Response, NextFunction } from 'express';
import prisma from '../../../core/config/db';

export type PortalActorRole = 'ALUMNI' | 'EMPLOYER' | 'REGISTRAR' | 'DEPARTMENT_HEAD' | 'ADMIN';

export interface ControlledMenuItem {
  key: string;              // unique key, e.g. 'ALUMNI:career' or 'EMPLOYER:post_job'
  id: string;               // tab/page identifier, e.g. 'career', 'jobs', 'surveys'
  actor: PortalActorRole;   // 'ALUMNI' | 'EMPLOYER' | 'REGISTRAR' | 'DEPARTMENT_HEAD'
  actorLabel: string;       // e.g. 'Alumni Portal', 'Employer Portal'
  label: string;            // e.g. 'Career Center'
  category: string;         // e.g. 'Recruiting & Career'
  icon: string;             // Material symbol or Lucide name
  description: string;      // Summary of page functionality
  enabled: boolean;         // true = Active / Live; false = Closed / Inactive
  closedNotice?: string;    // Custom message displayed on the closed page
  closedAt?: string | null; // ISO date string when toggled off
  closedBy?: string | null; // Officer email/name
}

export const DEFAULT_PORTAL_MENU_CONTROLS: ControlledMenuItem[] = [
  // ─── 1. ALUMNI DASHBOARD PAGES ───
  {
    key: 'ALUMNI:dashboard',
    id: 'dashboard',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Dashboard Overview',
    category: 'Recruiting & Career',
    icon: 'dashboard',
    description: 'Personalized graduate dashboard summary, KPIs, profile readiness score, and fast metrics.',
    enabled: true,
  },
  {
    key: 'ALUMNI:management',
    id: 'management',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Management Hub',
    category: 'Recruiting & Career',
    icon: 'dashboard_customize',
    description: 'Central portal hub for graduate services, ID issuance, CV builder, and alumni badges.',
    enabled: true,
  },
  {
    key: 'ALUMNI:jobs',
    id: 'jobs',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Jobs Board',
    category: 'Recruiting & Career',
    icon: 'work',
    description: 'Verified job openings, direct applications, salary bands, and employer outreach.',
    enabled: true,
  },
  {
    key: 'ALUMNI:career',
    id: 'career',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Career Center',
    category: 'Recruiting & Career',
    icon: 'school',
    description: 'Career workshops, networking events, mock interviews, and skill-building cohorts.',
    enabled: true,
  },
  {
    key: 'ALUMNI:surveys',
    id: 'surveys',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Tracer Surveys',
    category: 'Recruiting & Career',
    icon: 'assignment',
    description: 'Official national & institutional longitudinal tracer study feedback surveys.',
    enabled: true,
  },
  {
    key: 'ALUMNI:tools',
    id: 'tools',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Alumni Tools',
    category: 'Recruiting & Career',
    icon: 'construction',
    description: 'Career calculators, resume scanner, and transition tools.',
    enabled: true,
  },
  {
    key: 'ALUMNI:profile',
    id: 'profile',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Graduate Profile',
    category: 'Community & Network',
    icon: 'account_circle',
    description: 'Graduate identity, education history, portfolio, skills, and certifications.',
    enabled: true,
  },
  {
    key: 'ALUMNI:mentorship',
    id: 'mentorship',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Mentorship Program',
    category: 'Community & Network',
    icon: 'diversity_3',
    description: 'Connect senior industry mentors with recent graduates for career guidance.',
    enabled: true,
  },
  {
    key: 'ALUMNI:directory',
    id: 'directory',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Alumni Directory',
    category: 'Community & Network',
    icon: 'travel_explore',
    description: 'Search and connect with fellow ASTU alumni by year, discipline, and industry.',
    enabled: true,
  },
  {
    key: 'ALUMNI:forum',
    id: 'forum',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Community Network',
    category: 'Community & Network',
    icon: 'group',
    description: 'Peer forum, questions, professional discussions, and community posts.',
    enabled: true,
  },
  {
    key: 'ALUMNI:donations',
    id: 'donations',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Giving & Donations',
    category: 'Community & Network',
    icon: 'volunteer_activism',
    description: 'Endowment funds, campus infrastructure campaigns, and alumni contributions.',
    enabled: true,
  },
  {
    key: 'ALUMNI:documents',
    id: 'documents',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Document Services',
    category: 'Services & Support',
    icon: 'description',
    description: 'Request official transcripts, degree verifications, and graduation certificates.',
    enabled: true,
  },
  {
    key: 'ALUMNI:messages',
    id: 'messages',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Messages Hub',
    category: 'Services & Support',
    icon: 'forum',
    description: 'Direct messaging between alumni, employers, department heads, and officers.',
    enabled: true,
  },
  {
    key: 'ALUMNI:settings',
    id: 'settings',
    actor: 'ALUMNI',
    actorLabel: 'Alumni Portal',
    label: 'Settings & Privacy',
    category: 'Services & Support',
    icon: 'settings',
    description: 'Communication preferences, security controls, and notification settings.',
    enabled: true,
  },

  // ─── 2. EMPLOYER DASHBOARD PAGES ───
  {
    key: 'EMPLOYER:dashboard',
    id: 'dashboard',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Recruitment Dashboard',
    category: 'Recruiting',
    icon: 'dashboard',
    description: 'Overview of company hiring pipeline, applications, applicant velocity, and talent stats.',
    enabled: true,
  },
  {
    key: 'EMPLOYER:management',
    id: 'management',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Management Hub',
    category: 'Recruiting',
    icon: 'dashboard_customize',
    description: 'Full overview of job scaffolders, interview schedules, and university relations.',
    enabled: true,
  },
  {
    key: 'EMPLOYER:post_job',
    id: 'post_job',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Job Scaffolder / Post Job',
    category: 'Recruiting',
    icon: 'work',
    description: 'Create and publish employment openings, internships, and graduate trainee positions.',
    enabled: true,
  },
  {
    key: 'EMPLOYER:candidates',
    id: 'candidates',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Applications & Candidates',
    category: 'Recruiting',
    icon: 'description',
    description: 'Review applicant resumes, shortlist candidates, and manage interview invitations.',
    enabled: true,
  },
  {
    key: 'EMPLOYER:search_talent',
    id: 'search_talent',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Talent Search',
    category: 'Recruiting',
    icon: 'search',
    description: 'Search verified graduate roster by skills, department, graduation year, and GPA.',
    enabled: true,
  },
  {
    key: 'EMPLOYER:feedback',
    id: 'feedback',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Graduate Feedback Audits',
    category: 'Management & Feedback',
    icon: 'rate_review',
    description: 'Submit employer satisfaction surveys regarding ASTU graduate workplace performance.',
    enabled: true,
  },
  {
    key: 'EMPLOYER:chat',
    id: 'chat',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Messaging Hub',
    category: 'Management & Feedback',
    icon: 'forum',
    description: 'Chat directly with applicants and the ASTU Corporate Placement Officer.',
    enabled: true,
  },
  {
    key: 'EMPLOYER:analytics',
    id: 'analytics',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Recruitment Analytics',
    category: 'Management & Feedback',
    icon: 'analytics',
    description: 'Hiring funnel metrics, applicant conversion rates, and department placement trends.',
    enabled: true,
  },
  {
    key: 'EMPLOYER:profile',
    id: 'profile',
    actor: 'EMPLOYER',
    actorLabel: 'Employer Portal',
    label: 'Company Profile',
    category: 'Management & Feedback',
    icon: 'business',
    description: 'Company corporate branding, tax identification, partner badge, and HR contacts.',
    enabled: true,
  },

  // ─── 3. REGISTRAR DASHBOARD PAGES ───
  {
    key: 'REGISTRAR:dashboard',
    id: 'dashboard',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Registrar Dashboard',
    category: 'Registrar Core',
    icon: 'dashboard',
    description: 'Registrar operational cockpit, pending verifications, sync logs, and student status.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:management',
    id: 'management',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Management Hub',
    category: 'Registrar Core',
    icon: 'dashboard_customize',
    description: 'Batch clearance, diploma validation, graduation registry, and degree certification.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:records',
    id: 'records',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Alumni Records Archive',
    category: 'Registrar Core',
    icon: 'people',
    description: 'Official master registry of verified graduates and historical student dossiers.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:data_integration',
    id: 'data_integration',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Batch Import & SIS Sync',
    category: 'Registrar Core',
    icon: 'cloud_upload',
    description: 'Batch CSV/Excel ingestion and real-time ASTU ERP database synchronization.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:verification',
    id: 'verification',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Verifications Queue',
    category: 'Verification Queue',
    icon: 'verified_user',
    description: 'Authenticate graduate degrees, Fayda national ID matching, and diploma checks.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:documents',
    id: 'documents',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Document Queue',
    category: 'Verification Queue',
    icon: 'description',
    description: 'Process official transcript requests, letters of recommendation, and degree copies.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:data_issues',
    id: 'data_issues',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Data Corrections',
    category: 'Verification Queue',
    icon: 'report_problem',
    description: 'Review and approve name spelling, birth date, and degree credential change requests.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:surveys',
    id: 'surveys',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Tracer Survey Tracking',
    category: 'Tracer & Reports',
    icon: 'assignment',
    description: 'Monitor graduate participation rates in institutional tracer cohorts.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:reporting',
    id: 'reporting',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Reports & Export',
    category: 'Tracer & Reports',
    icon: 'analytics',
    description: 'Generate Ministry of Education and ETA accreditation compliance exports.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:bulletins',
    id: 'bulletins',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Announcements & Events',
    category: 'Communication',
    icon: 'campaign',
    description: 'Publish registrar notices, graduation bulletins, and ceremony deadlines.',
    enabled: true,
  },
  {
    key: 'REGISTRAR:messages',
    id: 'messages',
    actor: 'REGISTRAR',
    actorLabel: 'Registrar Portal',
    label: 'Messages Hub',
    category: 'Communication',
    icon: 'forum',
    description: 'Registrar communications with students, alumni, and departmental offices.',
    enabled: true,
  },

  // ─── 4. DEPARTMENT HEAD DASHBOARD PAGES ───
  {
    key: 'DEPARTMENT_HEAD:dashboard',
    id: 'dashboard',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Department Dashboard',
    category: 'Department Core',
    icon: 'dashboard',
    description: 'Departmental executive overview, graduate outcomes, and academic performance.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:messages',
    id: 'messages',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Department Messages',
    category: 'Department Core',
    icon: 'chat',
    description: 'Direct communication with departmental graduates, faculty, and alumni office.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:management',
    id: 'management',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Management Hub',
    category: 'Department Core',
    icon: 'dashboard_customize',
    description: 'Manage departmental alumni affairs, advisory councils, and employer relations.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:employment-analytics',
    id: 'employment-analytics',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Employment Analytics',
    category: 'Department Core',
    icon: 'trending_up',
    description: 'Graduate employment rates, time-to-first-job, industry placement, and career tracks.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:department-surveys',
    id: 'department-surveys',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Department Surveys',
    category: 'Analytics & Surveys',
    icon: 'edit_note',
    description: 'Create custom departmental surveys for alumni curriculum evaluation.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:skill-gap',
    id: 'skill-gap',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Skill Gap Reports',
    category: 'Analytics & Surveys',
    icon: 'school',
    description: 'Identify technical and soft-skill deficiencies reported by hiring industries.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:employer-feedback',
    id: 'employer-feedback',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Employer Feedback',
    category: 'Analytics & Surveys',
    icon: 'rate_review',
    description: 'Review corporate evaluations of departmental graduates to refine course syllabus.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:tracer-reports',
    id: 'tracer-reports',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Tracer Reports',
    category: 'Reports & Audit',
    icon: 'assignment',
    description: 'Departmental tracer study reports filtered by graduating cohort and degree program.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:curriculum',
    id: 'curriculum',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Curriculum Insights',
    category: 'Reports & Audit',
    icon: 'menu_book',
    description: 'Actionable data recommendations for updating course modules and laboratory training.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:accreditation',
    id: 'accreditation',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Accreditation Reports',
    category: 'Reports & Audit',
    icon: 'verified',
    description: 'Generate ETA, ABET, and Higher Education Authority accreditation evidence dossiers.',
    enabled: true,
  },
  {
    key: 'DEPARTMENT_HEAD:export',
    id: 'export',
    actor: 'DEPARTMENT_HEAD',
    actorLabel: 'Department Portal',
    label: 'Export Reports',
    category: 'Reports & Audit',
    icon: 'download',
    description: 'Export raw datasets, Excel synthesis, and high-resolution audit graphs.',
    enabled: true,
  },

  // ─── 5. ADMIN DASHBOARD PAGES ───
  {
    key: 'ADMIN:dashboard',
    id: 'dashboard',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Dashboard Overview',
    category: 'System Core',
    icon: 'dashboard',
    description: 'System administrator command center, key university KPIs, and user metrics.',
    enabled: true,
  },
  {
    key: 'ADMIN:messages',
    id: 'messages',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Messages Hub',
    category: 'System Core',
    icon: 'forum',
    description: 'Direct institutional messaging, stakeholder broadcasts, and cross-office communication.',
    enabled: true,
  },
  {
    key: 'ADMIN:support-tickets',
    id: 'support-tickets',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Support Desk',
    category: 'Administration',
    icon: 'support_agent',
    description: 'User inquiry tracking, issue resolution tickets, and technical help desk queue.',
    enabled: true,
  },
  {
    key: 'ADMIN:modules',
    id: 'modules',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Super Admin Modules',
    category: 'Administration',
    icon: 'shield',
    description: 'Advanced super-admin feature flag modules, system extensions, and core toggles.',
    enabled: true,
  },
  {
    key: 'ADMIN:knowledge-hub',
    id: 'knowledge-hub',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'RAG Knowledge Hub',
    category: 'Administration',
    icon: 'auto_awesome',
    description: 'Institutional knowledge embeddings, document ingestion, and AI Chatbot knowledge base.',
    enabled: true,
  },
  {
    key: 'ADMIN:reports',
    id: 'reports',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Reports Center',
    category: 'Administration',
    icon: 'analytics',
    description: 'Generate institutional reports, analytics dossiers, and government compliance exports.',
    enabled: true,
  },
  {
    key: 'ADMIN:users',
    id: 'users',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'User Management',
    category: 'Administration',
    icon: 'manage_accounts',
    description: 'Manage registered alumni, employers, staff, verification status, and credentials.',
    enabled: true,
  },
  {
    key: 'ADMIN:roles',
    id: 'roles',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Role Management',
    category: 'Administration',
    icon: 'admin_panel_settings',
    description: 'Role-based access control (RBAC), security groups, and granular permissions.',
    enabled: true,
  },
  {
    key: 'ADMIN:analytics',
    id: 'analytics',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Platform Analytics',
    category: 'Administration',
    icon: 'monitoring',
    description: 'System traffic, registration velocity, survey completion, and engagement analytics.',
    enabled: true,
  },
  {
    key: 'ADMIN:surveys',
    id: 'surveys',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Survey Management',
    category: 'Administration',
    icon: 'assignment',
    description: 'Survey builder, cohort distribution, question bank, and longitudinal tracer studies.',
    enabled: true,
  },
  {
    key: 'ADMIN:jobs',
    id: 'jobs',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Jobs Management',
    category: 'Administration',
    icon: 'work',
    description: 'Approve employer job listings, manage corporate partners, and audit postings.',
    enabled: true,
  },
  {
    key: 'ADMIN:departments',
    id: 'departments',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Departments',
    category: 'Administration',
    icon: 'school',
    description: 'Manage academic departments, schools, programs, and departmental head assignments.',
    enabled: true,
  },
  {
    key: 'ADMIN:donations',
    id: 'donations',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Donations & Giving',
    category: 'Administration',
    icon: 'volunteer_activism',
    description: 'University endowment campaigns, Telebirr/Chapa payment gateways, and donor ledger.',
    enabled: true,
  },
  {
    key: 'ADMIN:notifications',
    id: 'notifications',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'System Notifications',
    category: 'Configuration',
    icon: 'notifications',
    description: 'Broadcast notifications, automated email triggers, and system alert configuration.',
    enabled: true,
  },
  {
    key: 'ADMIN:logs',
    id: 'logs',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'System Logs',
    category: 'Configuration',
    icon: 'receipt_long',
    description: 'Security audit trail, authentication logs, database events, and change history.',
    enabled: true,
  },
  {
    key: 'ADMIN:backup',
    id: 'backup',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'Backup & Security',
    category: 'Configuration',
    icon: 'security',
    description: 'Database snapshot archives, 2FA policies, IP whitelists, and encryption keys.',
    enabled: true,
  },
  {
    key: 'ADMIN:settings',
    id: 'settings',
    actor: 'ADMIN',
    actorLabel: 'Admin Portal',
    label: 'System Settings',
    category: 'Configuration',
    icon: 'settings',
    description: 'Global university branding, SMTP mail servers, API credentials, and portal config.',
    enabled: true,
  },
];

const SETTING_KEY = 'portal_menu_controls';

/**
 * Merge stored settings with code defaults so any new code-level items are always preserved
 */
function mergeControls(stored: any): ControlledMenuItem[] {
  if (!Array.isArray(stored)) return DEFAULT_PORTAL_MENU_CONTROLS;

  const storedMap = new Map<string, any>();
  for (const item of stored) {
    if (item && item.key) {
      storedMap.set(item.key, item);
    }
  }

  return DEFAULT_PORTAL_MENU_CONTROLS.map((def) => {
    const s = storedMap.get(def.key);
    if (!s) return def;
    return {
      ...def,
      enabled: typeof s.enabled === 'boolean' ? s.enabled : def.enabled,
      closedNotice: s.closedNotice !== undefined ? s.closedNotice : def.closedNotice,
      closedAt: s.closedAt !== undefined ? s.closedAt : def.closedAt,
      closedBy: s.closedBy !== undefined ? s.closedBy : def.closedBy,
    };
  });
}

/**
 * GET /api/content/menu-controls
 * Accessible to public & all authenticated users
 */
export const getMenuControlsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await (prisma as any).systemSetting.findUnique({
      where: { key: SETTING_KEY },
    }).catch(() => null);

    const controls = setting && setting.value ? mergeControls(setting.value) : DEFAULT_PORTAL_MENU_CONTROLS;

    res.status(200).json({
      success: true,
      data: controls,
      updatedAt: setting?.updatedAt || new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/content/menu-controls
 * Controlled by ALUMNI_OFFICE, ADMIN, SUPER_ADMIN
 */
export const saveMenuControlsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incomingItems = req.body?.items || req.body;

    if (!Array.isArray(incomingItems)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: expected an array of menu items in "items" or request body.',
      });
    }

    const merged = mergeControls(incomingItems);

    const setting = await (prisma as any).systemSetting.upsert({
      where: { key: SETTING_KEY },
      update: {
        value: merged as any,
      },
      create: {
        key: SETTING_KEY,
        value: merged as any,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Portal menu controls updated successfully.',
      data: merged,
      updatedAt: setting.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/content/menu-controls/reset
 * Resets all menu pages back to active/default state
 */
export const resetMenuControlsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await (prisma as any).systemSetting.upsert({
      where: { key: SETTING_KEY },
      update: {
        value: DEFAULT_PORTAL_MENU_CONTROLS as any,
      },
      create: {
        key: SETTING_KEY,
        value: DEFAULT_PORTAL_MENU_CONTROLS as any,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Portal menu controls reset to factory defaults.',
      data: DEFAULT_PORTAL_MENU_CONTROLS,
    });
  } catch (error) {
    next(error);
  }
};

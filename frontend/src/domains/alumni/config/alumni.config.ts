export interface NavItem {
  id: string;
  label: string;
  icon: string;
  useCaseModule: string;
}

export interface CommItem {
  id: string;
  label: string;
  icon: string;
  badge: string | null;
  useCaseModule: string;
}

export interface ManagementAction {
  title: string;
  desc: string;
  tab: string;
  icon: string;
  useCaseModule: string;
}

export interface StatConfig {
  id: number;
  label: string;
  color: string;
  icon: string;
  bgGradient: string;
  trend: string;
  trendIcon: string;
  trendColor: string;
  useCaseModule: string;
}

export interface CommandSignal {
  label: string;
  icon: string;
  tone: string;
  useCaseModule: string;
}

export interface ProfileReadinessItem {
  label: string;
  icon: string;
  useCaseModule: string;
}

export interface IntelligenceCard {
  icon: string;
  title: string;
  desc: string;
  tab: string;
  useCaseModule: string;
}

export interface MilestoneTemplate {
  year: string;
  titleField: string;
  companyField: string;
  description: string;
  type: 'academic' | 'professional' | 'achievement';
  useCaseModule: string;
}

export interface NextStep {
  icon: string;
  title: string;
  desc: string;
  useCaseModule: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', useCaseModule: '7. Analytics Engine' },
  { id: 'management', label: 'Management Hub', icon: 'dashboard_customize', useCaseModule: '2. Alumni Profile' },
  { id: 'profile', label: 'My Profile', icon: 'account_circle', useCaseModule: '2. Alumni Profile' },
  { id: 'career', label: 'Career Center', icon: 'school', useCaseModule: '11. Events' },
  { id: 'surveys', label: 'Surveys', icon: 'assignment', useCaseModule: '6. Tracer Survey Engine' },
  { id: 'jobs', label: 'Jobs Board', icon: 'work', useCaseModule: '5. Job Board' },
  { id: 'mentorship', label: 'Mentorship', icon: 'diversity_3', useCaseModule: '10. Mentorship' },
  { id: 'forum', label: 'Community', icon: 'group', useCaseModule: '4. Employer / Community' },
  { id: 'donations', label: 'Giving', icon: 'volunteer_activism', useCaseModule: '2. Alumni Profile' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: 'smart_toy', useCaseModule: '9. AI Chatbot & Reports' },
  { id: 'system-docs', label: 'System Docs', icon: 'menu_book', useCaseModule: 'System Reference' },
];

export const COMM_ITEMS: CommItem[] = [
  { id: 'documents', label: 'Documents', icon: 'description', badge: null, useCaseModule: '12. Documents' },
  { id: 'messages', label: 'Messages', icon: 'forum', badge: '3', useCaseModule: '13. Notifications' },
  { id: 'settings', label: 'Settings', icon: 'settings', badge: null, useCaseModule: '2. Alumni Profile' },
];

export const MANAGEMENT_ACTIONS: ManagementAction[] = [
  { title: 'Alumni Directory', desc: 'Browse peers by batch, city, country, department, skills, and chapter.', tab: 'profile', icon: 'travel_explore', useCaseModule: '2. Alumni Profile' },
  { title: 'Skills Portfolio', desc: 'Create skill evidence, publications, projects, awards, and career progress records.', tab: 'profile', icon: 'workspace_premium', useCaseModule: '2. Alumni Profile' },
  { title: 'CV Builder', desc: 'Generate accreditation-friendly CV snapshots from your verified profile.', tab: 'profile', icon: 'description', useCaseModule: '2. Alumni Profile' },
  { title: 'Digital ID Card', desc: 'Manage verified alumni identity and registrar-approved profile data.', tab: 'documents', icon: 'badge', useCaseModule: '12. Documents' },
  { title: 'Volunteer Program', desc: 'Join mentorship, alumni chapters, campus events, and community initiatives.', tab: 'mentorship', icon: 'volunteer_activism', useCaseModule: '10. Mentorship' },
  { title: 'Career Progress', desc: 'Update employment, salary range, startup, research, and tracer outcomes.', tab: 'surveys', icon: 'timeline', useCaseModule: '6. Tracer Survey Engine' },
];

export const STATS_CONFIG: Omit<StatConfig, 'id'>[] = [
  { label: 'Profile Status', color: 'astu-navy', icon: 'account_circle', bgGradient: 'from-blue-50 to-indigo-50', trend: 'Complete fields to boost', trendIcon: 'trending_up', trendColor: 'astu-green', useCaseModule: '2. Alumni Profile' },
  { label: 'Job Matches', color: 'astu-green', icon: 'work', bgGradient: 'from-emerald-50 to-green-50', trend: 'New placements weekly', trendIcon: 'trending_up', trendColor: 'astu-green', useCaseModule: '5. Job Board' },
  { label: 'Pending Surveys', color: 'astu-red', icon: 'assignment', bgGradient: 'from-red-50 to-orange-50', trend: 'Urgent Tracer studies', trendIcon: 'schedule', trendColor: 'astu-red', useCaseModule: '6. Tracer Survey Engine' },
  { label: 'Network Peers', color: 'purple-600', icon: 'people', bgGradient: 'from-purple-50 to-pink-50', trend: 'Peers connected', trendIcon: 'trending_up', trendColor: 'astu-green', useCaseModule: '10. Mentorship' },
];

export const COMMAND_SIGNALS: CommandSignal[] = [
  { label: 'Employer visibility', icon: 'visibility', tone: '', useCaseModule: '2. Alumni Profile' },
  { label: 'Applications sent', icon: 'send', tone: 'text-astu-navy', useCaseModule: '5. Job Board' },
  { label: 'Saved roles', icon: 'bookmark', tone: 'text-[#8A5CF6]', useCaseModule: '5. Job Board' },
  { label: 'Tracer actions', icon: 'assignment_late', tone: '', useCaseModule: '6. Tracer Survey Engine' },
];

export const PROFILE_READINESS: ProfileReadinessItem[] = [
  { label: 'Public profile', icon: 'badge', useCaseModule: '2. Alumni Profile' },
  { label: 'Career evidence', icon: 'fact_check', useCaseModule: '2. Alumni Profile' },
  { label: 'Recruiter match', icon: 'target', useCaseModule: '5. Job Board' },
];

export const INTELLIGENCE_CARDS: IntelligenceCard[] = [
  { icon: 'auto_awesome', title: 'AI Career Coach', desc: 'CV score, missing skills, salary path, and job-fit guidance from your profile.', tab: 'career', useCaseModule: '9. AI Chatbot & Reports' },
  { icon: 'event_available', title: 'Events & RSVP', desc: 'Career fairs, ASTU reunions, workshops, RSVP status, and ticket QR readiness.', tab: 'career', useCaseModule: '11. Events' },
  { icon: 'forum', title: 'Community Network', desc: 'Achievement sharing, alumni posts, mentor conversations, and peer discovery.', tab: 'messages', useCaseModule: '13. Notifications' },
  { icon: 'workspace_premium', title: 'Verified Documents', desc: 'Transcript, certificate, identity badge, and digital download tracking.', tab: 'documents', useCaseModule: '12. Documents' },
];

export const MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  { year: '2025 - Present', titleField: 'currentRole', companyField: 'company', description: 'Drives user acquisition interfaces, checkouts developer tools, and fintech integrations.', type: 'professional', useCaseModule: '2. Alumni Profile' },
  { year: '2024', titleField: 'degree', companyField: 'university', description: 'Graduated with Great Distinction. Focused on Software Systems.', type: 'academic', useCaseModule: '2. Alumni Profile' },
  { year: '2023', titleField: 'internRole', companyField: 'internCompany', description: 'Assisted DevOps teams in setting up automated GitLab pipelines and Kubernetes environments.', type: 'professional', useCaseModule: '2. Alumni Profile' },
];

export const NEXT_STEPS: NextStep[] = [
  { icon: 'edit', title: 'Update Skills', desc: 'Add new technical and soft skills', useCaseModule: '2. Alumni Profile' },
  { icon: 'photo_camera', title: 'Upload Photo', desc: 'Add a professional profile picture', useCaseModule: '2. Alumni Profile' },
  { icon: 'description', title: 'Update Resume', desc: 'Upload your latest resume', useCaseModule: '2. Alumni Profile' },
];

export const CHART_DATA = {
  employmentTrend: [
    { year: '2020', rate: 72 },
    { year: '2021', rate: 76 },
    { year: '2022', rate: 79 },
    { year: '2023', rate: 83 },
    { year: '2024', rate: 87 },
    { year: '2025', rate: 91 },
  ],
  skillsDistribution: [
    { name: 'Software Engineering', value: 340 },
    { name: 'Data Science', value: 180 },
    { name: 'DevOps & Cloud', value: 120 },
    { name: 'Electrical Eng.', value: 95 },
    { name: 'Civil Eng.', value: 75 },
  ],
};

export const ACTIVITY_ENTRIES = [
  { type: 'job', title: 'New job match: Senior React Developer', description: 'Chapa Financial Technologies posted a role matching your profile.' },
  { type: 'survey', title: 'Tracer Survey reminder', description: '12-month tracer survey is due by June 30, 2026.' },
  { type: 'event', title: 'ASTU Alumni Meetup 2026', description: 'Annual networking event at ASTU Main Campus on July 15.' },
  { type: 'document', title: 'Transcript request approved', description: 'Your official transcript has been digitally signed.' },
  { type: 'message', title: 'Message from HR Manager', description: 'Hilina Sileshi sent you a message about the developer opening.' },
];

export const SALARY_OPTIONS = [
  'Under 15,000 ETB',
  '15,000 - 30,000 ETB',
  '30,001 - 60,000 ETB',
  '60,001 - 100,000 ETB',
  'Over 100,000 ETB',
];

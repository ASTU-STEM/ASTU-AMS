import React, { useState } from 'react';

const MODULES = [
  {
    id: 'auth',
    title: '1. Authentication Module',
    path: '/api/auth',
    icon: 'lock',
    color: 'from-blue-600 to-indigo-600',
    actors: ['All Users', 'Alumni', 'Employer', 'Registrar', 'Admin', 'Dept Head'],
    useCases: [
      'User Login — Authenticate existing users and provide access tokens.',
      'Employer Login — Specific authentication flow for corporate partners.',
      'Register Alumni — Initiate account creation for an alumnus using their Student ID.',
      'Register Employer — Create a corporate account for recruiters.',
      'Verify Email / National ID — Activate an alumni account via email code or Didit integration.',
      'Submit Manual Verification — Allow alumni to upload ID documents if automated verification fails.',
      'Admin Create User — Allow system administrators to generate accounts for Registrar or Department Heads.',
      'Forgot/Reset Password — Self-service password recovery.',
      'Refresh Session — Obtain new access tokens without re-logging in.',
      'Logout — Securely terminate the user session.',
    ],
    endpoints: [
      { method: 'POST', path: '/auth/login', access: 'Public', body: { emailOrStudentId: 'string', password: 'string', rememberMe: 'boolean' } },
      { method: 'POST', path: '/auth/employer/login', access: 'Public', body: { emailOrStudentId: 'string', password: 'string', isEmployerLoginFlow: 'true' } },
      { method: 'POST', path: '/auth/register', access: 'Public', body: { firstName: 'string', lastName: 'string', studentId: 'string', email: 'string', password: 'string' } },
      { method: 'POST', path: '/auth/employer/register', access: 'Public', body: { email: 'string', companyName: 'string', industry: 'string' } },
      { method: 'POST', path: '/auth/register/verify-email', access: 'Public', body: { studentId: 'string', code: 'string' } },
      { method: 'POST', path: '/auth/register/verify-national-id', access: 'Public', body: { studentId: 'string', nationalId: 'string' } },
      { method: 'POST', path: '/auth/register/verify-manual', access: 'Public', body: { studentId: 'string', fullName: 'string', documents: 'Files' } },
      { method: 'POST', path: '/auth/forgot-password', access: 'Public', body: { emailOrPhone: 'string', method: 'email|sms' } },
      { method: 'POST', path: '/auth/reset-password', access: 'Public', body: { token: 'string', newPassword: 'string' } },
      { method: 'POST', path: '/auth/admin/create-user', access: 'ADMIN', body: { email: 'string', role: 'string', fullName: 'string' } },
    ],
  },
  {
    id: 'alumni',
    title: '2. Alumni Profile Module',
    path: '/api/alumni',
    icon: 'person',
    color: 'from-emerald-600 to-teal-600',
    actors: ['Alumni'],
    useCases: [
      'View My Profile — Retrieve personal, academic, and career information.',
      'Update Profile — Edit skills, contact info, and current employment details.',
      'Manage Work Experience — Add, edit, or delete professional work history.',
      'Upload Assets — Upload Profile Pictures and CVs/Resumes.',
      'Request Official Documents — Request transcripts or degree verifications from the university.',
      'View Document Requests Status — Track the progress of requested official documents.',
    ],
    endpoints: [
      { method: 'GET', path: '/alumni/me', access: 'ALUMNI', body: null },
      { method: 'PUT', path: '/alumni/me', access: 'ALUMNI', body: { fullName: 'string', phone: 'string', skills: 'string[]', linkedIn: 'string' } },
      { method: 'POST', path: '/alumni/experiences', access: 'ALUMNI', body: { companyName: 'string', position: 'string', startDate: 'date' } },
      { method: 'PUT', path: '/alumni/experiences/:id', access: 'ALUMNI', body: { companyName: 'string', position: 'string' } },
      { method: 'DELETE', path: '/alumni/experiences/:id', access: 'ALUMNI', body: null },
      { method: 'POST', path: '/alumni/upload', access: 'ALUMNI', body: { cv: 'File', profilePicture: 'File' } },
    ],
  },
  {
    id: 'registrar',
    title: '3. Registrar Integration Module',
    path: '/api/registrar',
    icon: 'badge',
    color: 'from-amber-600 to-orange-600',
    actors: ['Registrar Office', 'Admin'],
    useCases: [
      'Verify Student ID (Public) — Check if a student ID exists before alumni registration.',
      'Import Graduate Records (Excel/CSV) — Batch import graduating student data from university systems.',
      'Fetch Graduates via API — Automatically sync graduate data directly from external university databases.',
      'View Data Sync Logs — Audit historical data imports and sync statuses.',
      'Manage Verified Alumni — View detailed records of all registered alumni.',
      'Update Alumni Status — Manually approve, suspend, or reactivate alumni accounts.',
      'Process Document Requests — Review and approve/reject transcript and degree verification requests.',
    ],
    endpoints: [
      { method: 'POST', path: '/registrar/fetch-graduates/:year', access: 'ADMIN, REGISTRAR', body: null },
      { method: 'PUT', path: '/registrar/alumni/:id/status', access: 'ADMIN, REGISTRAR', body: { status: 'ACTIVE|SUSPENDED', reason: 'string' } },
    ],
  },
  {
    id: 'employer',
    title: '4. Employer Module',
    path: '/api/employer',
    icon: 'business',
    color: 'from-purple-600 to-pink-600',
    actors: ['Employers', 'Admin'],
    useCases: [
      'Manage Company Profile — Create, update, and manage the employer public branding.',
      'Post Jobs — Create new job listings or internship opportunities.',
      'Publish/Close Jobs — Change the visibility and status of job listings.',
      'Manage Applications — Review received applications, download CVs, and update application statuses.',
      'Search Alumni Talent — Query the verified alumni database by skills, department, and graduation year.',
      'Schedule Interviews — Propose interview dates and provide meeting links to candidates.',
      'Submit Competency Feedback — Rate hired alumni on technical and soft skills.',
    ],
    endpoints: [
      { method: 'POST', path: '/employer/profile', access: 'EMPLOYER', body: { companyName: 'string', industry: 'string', location: 'string' } },
      { method: 'PUT', path: '/employer/profile', access: 'EMPLOYER', body: { companyName: 'string', industry: 'string' } },
      { method: 'POST', path: '/employer/jobs', access: 'EMPLOYER', body: { title: 'string', description: 'string', location: 'string', salary: 'string' } },
      { method: 'PUT', path: '/employer/jobs/:id', access: 'EMPLOYER', body: { title: 'string', status: 'PUBLISHED|CLOSED' } },
      { method: 'PATCH', path: '/employer/applications/:id/status', access: 'EMPLOYER, ADMIN', body: { status: 'SHORTLISTED|REJECTED|HIRED' } },
      { method: 'POST', path: '/employer/interviews', access: 'EMPLOYER, ADMIN', body: { applicationId: 'uuid', interviewDate: 'datetime', meetingLink: 'string' } },
      { method: 'POST', path: '/employer/feedback', access: 'EMPLOYER, ADMIN', body: { alumniId: 'uuid', technicalSkill: 'number', communicationSkill: 'number' } },
    ],
  },
  {
    id: 'jobboard',
    title: '5. Job Board Module',
    path: '/api/jobs',
    icon: 'work',
    color: 'from-sky-600 to-cyan-600',
    actors: ['Alumni', 'Public'],
    useCases: [
      'Search and Filter Jobs — Browse active jobs using keywords, location, and department filters.',
      'View Job Details — See comprehensive requirements, salaries, and company info for a specific job.',
      'Get AI Job Recommendations — Receive tailored job listings based on alumni skills and profile data.',
      'Apply for Jobs — Submit a cover letter and resume for an active job posting.',
      'Save/Bookmark Jobs — Save interesting jobs for later viewing.',
      'Manage My Applications — Track the status of jobs applied to and withdraw applications if necessary.',
    ],
    endpoints: [
      { method: 'GET', path: '/jobs', access: 'Public', params: { keyword: 'string', department: 'string', location: 'string', page: 'number' } },
      { method: 'POST', path: '/jobs/:id/apply', access: 'ALUMNI', body: { coverLetter: 'string', resume: 'File' } },
    ],
  },
  {
    id: 'surveys',
    title: '6. Tracer Survey Engine Module',
    path: '/api/surveys',
    icon: 'assignment',
    color: 'from-rose-600 to-red-600',
    actors: ['Alumni', 'Admin', 'Registrar'],
    useCases: [
      'Create Survey Templates (Admin) — Design 6-month, 12-month, and custom tracer study questionnaires.',
      'Clone Survey Templates — Duplicate existing templates for new cohorts.',
      'View Assigned Surveys (Alumni) — See surveys that are due based on graduation milestones.',
      'Save Survey Draft (Alumni) — Partially fill out a survey and save progress.',
      'Submit Survey Response (Alumni) — Complete and finalize a tracer study survey.',
      'Track Survey Completions (Admin) — Monitor response rates and view individual submissions.',
      'Generate Survey Statistics — Aggregate answers to see trends in employment, salaries, and curriculum satisfaction.',
    ],
    endpoints: [
      { method: 'POST', path: '/surveys/templates', access: 'ADMIN', body: { title: 'string', type: 'SIX_MONTH|TWELVE_MONTH', questions: 'array' } },
      { method: 'POST', path: '/surveys/submit', access: 'ALUMNI', body: { assignmentId: 'uuid', answers: 'array' } },
    ],
  },
  {
    id: 'analytics',
    title: '7. Analytics Engine Module',
    path: '/api/analytics',
    icon: 'analytics',
    color: 'from-violet-600 to-purple-600',
    actors: ['Department Heads', 'Admin'],
    useCases: [
      'View High-Level Dashboard — See total employment rates, average salaries, and overall graduate counts.',
      'Analyze Employment Trends — View employment percentage and time-to-hire breakdowns by department and year.',
      'Analyze Employer Data — Identify top hiring companies and industry distributions.',
      'Benchmark Departments — Compare the performance and metrics of different university departments.',
      'Perform Skill Gap Analysis — Identify missing competencies and high-demand skills reported by employers.',
      'Review Tracer Insights — Get aggregated data from tracer studies on curriculum effectiveness.',
    ],
    endpoints: [
      { method: 'GET', path: '/analytics/dashboard', access: 'DEPARTMENT_HEAD, ADMIN', body: null },
      { method: 'GET', path: '/analytics/employment', access: 'DEPARTMENT_HEAD, ADMIN', body: null },
      { method: 'GET', path: '/analytics/skills', access: 'DEPARTMENT_HEAD, ADMIN', body: null },
    ],
  },
  {
    id: 'department',
    title: '8. Department Module',
    path: '/api/departments',
    icon: 'account_balance',
    color: 'from-indigo-600 to-blue-600',
    actors: ['Department Heads'],
    useCases: [
      'List All Departments — Retrieve the university academic structure.',
      'View Department Specific Stats — Isolate analytics and KPIs solely to the Department Head respective faculty.',
      'View Department Alumni — List all alumni who graduated from that specific department.',
    ],
    endpoints: [
      { method: 'GET', path: '/departments', access: 'Public', body: null },
      { method: 'GET', path: '/departments/my-stats', access: 'DEPARTMENT_HEAD', body: null },
    ],
  },
  {
    id: 'ai',
    title: '9. AI Chatbot & Reports Module',
    path: '/api/ai',
    icon: 'smart_toy',
    color: 'from-cyan-600 to-teal-600',
    actors: ['Admin', 'Registrar', 'Department Heads'],
    useCases: [
      'Query RAG Chatbot — Ask natural language questions about university employment data.',
      'Generate AI Insights — Let the AI auto-generate summaries of current alumni trends.',
      'Generate Executive Reports — Export comprehensive PDF reports for university management.',
      'Generate Accreditation Reports — Automatically compile data proving graduate employability.',
      'Generate Curriculum Alignment Reports — Export PDFs highlighting skill gaps to guide syllabus updates.',
    ],
    endpoints: [
      { method: 'POST', path: '/ai/chat', access: 'ADMIN, REGISTRAR, DEPARTMENT_HEAD', body: { message: 'string' } },
      { method: 'POST', path: '/ai/reports/executive', access: 'ADMIN', body: null },
    ],
  },
  {
    id: 'mentorship',
    title: '10. Mentorship Module',
    path: '/api/mentorship',
    icon: 'diversity_3',
    color: 'from-pink-600 to-rose-600',
    actors: ['Alumni'],
    useCases: [
      'Request Mentorship — Allow junior alumni to request guidance from senior alumni.',
      'Respond to Requests — Accept or reject incoming mentorship requests.',
      'View My Mentors/Mentees — Track active mentorship relationships.',
    ],
    endpoints: [
      { method: 'POST', path: '/mentorship/request', access: 'ALUMNI', body: { mentorId: 'uuid', message: 'string' } },
      { method: 'PUT', path: '/mentorship/:id/respond', access: 'ALUMNI', body: { status: 'ACCEPTED|REJECTED' } },
    ],
  },
  {
    id: 'events',
    title: '11. Events Module',
    path: '/api/events',
    icon: 'event',
    color: 'from-yellow-600 to-amber-600',
    actors: ['Alumni', 'Alumni Office', 'Admin'],
    useCases: [
      'Create Events (Admin) — Schedule webinars, workshops, or reunions.',
      'Manage Events (Admin) — Update details or cancel scheduled events.',
      'RSVP to Events (Alumni) — Confirm attendance (Going/Not Going) for an upcoming event.',
      'View Event Attendees — See the list of people attending an event.',
    ],
    endpoints: [
      { method: 'POST', path: '/events', access: 'ADMIN, ALUMNI_OFFICE', body: { title: 'string', description: 'string', date: 'datetime', location: 'string', type: 'IN_PERSON|VIRTUAL' } },
      { method: 'POST', path: '/events/:id/rsvp', access: 'ALUMNI', body: { status: 'GOING|NOT_GOING' } },
    ],
  },
  {
    id: 'documents',
    title: '12. Documents Module',
    path: '/api/documents',
    icon: 'description',
    color: 'from-stone-600 to-neutral-600',
    actors: ['Alumni', 'Admin', 'Registrar'],
    useCases: [
      'Submit Document Request — Request official paperwork.',
      'Review System-Wide Requests — Registrar views all pending document requests in one place.',
      'Update Document Status — Registrar marks a document request as Processing, Completed, or Rejected.',
    ],
    endpoints: [
      { method: 'POST', path: '/documents', access: 'ALUMNI', body: { documentType: 'TRANSCRIPT|VERIFICATION', additionalInstructions: 'string' } },
      { method: 'PUT', path: '/documents/:id/status', access: 'ADMIN, REGISTRAR', body: { status: 'PENDING|COMPLETED|REJECTED' } },
    ],
  },
  {
    id: 'notifications',
    title: '13. Notifications Module',
    path: '/api/notifications',
    icon: 'notifications',
    color: 'from-red-600 to-orange-600',
    actors: ['All Users', 'Admin'],
    useCases: [
      'Receive In-App Notifications — View alerts for survey deadlines, job matches, and profile approvals.',
      'Mark Notifications as Read — Dismiss seen notifications individually or all at once.',
      'Send Manual Notifications (Admin) — Push custom alerts to specific users.',
    ],
    endpoints: [
      { method: 'POST', path: '/notifications', access: 'ADMIN', body: { userId: 'uuid', title: 'string', content: 'string' } },
      { method: 'PUT', path: '/notifications/:id/read', access: 'Authenticated', body: null },
    ],
  },
  {
    id: 'audit',
    title: '14. Audit Module',
    path: '/api/audit',
    icon: 'history',
    color: 'from-slate-600 to-gray-600',
    actors: ['Admin'],
    useCases: [
      'View System Audit Trail — Track all sensitive actions performed by admins and users.',
      'Track User Actions — Filter logs to see everything a specific user has done.',
      'Purge Old Logs — Delete audit logs older than the retention policy to save space.',
    ],
    endpoints: [
      { method: 'DELETE', path: '/audit/purge', access: 'ADMIN', body: { daysOld: 'number' } },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  POST: 'bg-blue-100 text-blue-800 border-blue-200',
  PUT: 'bg-amber-100 text-amber-800 border-amber-200',
  PATCH: 'bg-purple-100 text-purple-800 border-purple-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
};

export const SystemDocumentationTab: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = MODULES.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.useCases.some((u) => u.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.actors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#003580] via-[#0f4f86] to-[#1d9e75] px-6 py-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Reference v1.0
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">ASTU-AMS System Documentation</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
            Complete reference for all {MODULES.length} system modules — use cases and API endpoints mapped from the system architecture.
          </p>
        </div>
      </section>

      {/* Stats + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {[
            { label: 'Modules', count: MODULES.length, color: 'bg-blue-100 text-blue-700 border-blue-200' },
            { label: 'Use Cases', count: MODULES.reduce((s, m) => s + m.useCases.length, 0), color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
            { label: 'Endpoints', count: MODULES.reduce((s, m) => s + m.endpoints.length, 0), color: 'bg-amber-100 text-amber-700 border-amber-200' },
          ].map((s) => (
            <span key={s.label} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${s.color}`}>
              {s.count} {s.label}
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search modules, use cases, or actors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
        />
      </div>

      {/* Module Detail Panel */}
      {selectedModule && (() => {
        const mod = MODULES.find((m) => m.id === selectedModule)!;
        return (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${mod.color} px-6 py-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl">{mod.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold">{mod.title}</h3>
                    <code className="text-sm text-white/70 font-mono">{mod.path}</code>
                  </div>
                </div>
                <button onClick={() => setSelectedModule(null)} className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25 transition-colors">
                  Close
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Primary Actors</h4>
                <div className="flex flex-wrap gap-2">
                  {mod.actors.map((a) => (
                    <span key={a} className="rounded-full bg-[#003580]/10 px-3 py-1 text-xs font-semibold text-[#003580]">{a}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Use Cases</h4>
                <div className="space-y-2">
                  {mod.useCases.map((uc, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003580] text-[10px] font-bold text-white">{i + 1}</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{uc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">API Endpoints</h4>
                <div className="space-y-2">
                  {mod.endpoints.map((ep, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className={`rounded-md border px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${METHOD_COLORS[ep.method] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {ep.method}
                        </span>
                        <code className="flex-1 text-sm font-mono text-gray-800">{ep.path}</code>
                        <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500 border border-gray-200">{ep.access}</span>
                      </div>
                      {ep.body && (
                        <div className="border-t border-gray-200 px-4 py-2.5 bg-white">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Request Body</p>
                          <pre className="text-xs text-gray-600 font-mono leading-relaxed">{JSON.stringify(ep.body, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Module Grid Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredModules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setSelectedModule(mod.id)}
            className={`group relative rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
              selectedModule === mod.id ? 'border-[#003580] ring-2 ring-[#003580]/20' : 'border-gray-200'
            }`}
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mod.color} shadow-sm group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-white text-2xl">{mod.icon}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#003580] transition-colors">{mod.title}</h3>
            <code className="mt-1 block text-[10px] font-mono text-gray-400">{mod.path}</code>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span>{mod.useCases.length} use cases</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{mod.endpoints.length} endpoints</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mod.actors.slice(0, 3).map((a) => (
                <span key={a} className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-gray-500">{a}</span>
              ))}
              {mod.actors.length > 3 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-gray-400">+{mod.actors.length - 3}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

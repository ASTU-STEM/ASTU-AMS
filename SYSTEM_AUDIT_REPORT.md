# ASTU-AMS Comprehensive System Audit & Integration Report

**Date of Audit**: November 2, 2026  
**System**: Adama Science and Technology University - Alumni Management System (ASTU-AMS)  
**Scope**: Full Stack Inspection — Frontend Pages (Public, Auth, Alumni, Employer, Registrar, Department, ICT Admin, Super Admin, CMS), Backend API Gateway & Modules, Database Schemas, Authentication/Authorization, and Integration Health.

---

## 1. Executive Summary

A comprehensive architectural and functional audit of the entire ASTU-AMS platform was conducted. Both frontend (`Vite + React 18 + TypeScript + TailwindCSS`) and backend (`Node.js + Express + Prisma ORM + PostgreSQL`) build successfully with **zero compile/transpilation errors**.

However, several critical **integration disconnects**, **API route mismatches**, **unmounted authentication flows**, and **UI/UX routing inconsistencies** were identified across portals. Resolving these issues will ensure seamless end-to-end operation between all 6 core university portals.

---

## 2. Portal-by-Portal Health & Audit Matrix

| Portal / Module | Route Prefix | Primary Users | Build Status | Integration Status | Findings & Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Portal** | `/`, `/about`, `/events`, etc. | Prospective Alumni, Public, Guests | ✅ Healthy | 🟡 Mostly Integrated | Live CMS fallbacks exist; Chapa guest donations supported; dynamic news/announcements functional. |
| **Auth & Verification** | `/login`, `/register`, `/verify-*` | All Users, New Alumni, Employers | ✅ Healthy | 🔴 Disconnect Found | `AlumniActivationPage` unmounted in router; OTP/Didit flows operational; 2FA active. |
| **Alumni Portal** | `/alumni/dashboard`, `/alumni/tools` | Verified Alumni Graduates | ✅ Healthy | ✅ Fully Integrated | Profile editing, job applications, mentorship, CV upload, Chapa payment, and forum operational. |
| **Employer Portal** | `/employer/dashboard` | Corporate Recruiters & Partners | ✅ Healthy | ✅ Fully Integrated | Job posting, applicant pipeline, candidate messaging, interview scheduling, and Chapa premium. |
| **Registrar Portal** | `/registrar/dashboard` | University Registrar Officers | ✅ Healthy | ✅ Fully Integrated | SIS batch import, manual document verification, student ID verification, and scheduled reports. |
| **Department Head** | `/department/dashboard` | Department Chairs & Deans | ✅ Healthy | 🔴 Broken Routes | Service calls non-existent `/departments/my-department` & `/:id/stats`, causing 404 in sub-tabs. |
| **ICT Technical Admin** | `/ict/*` | ICT Directorate & DevOps | ✅ Healthy | 🔴 Broken Routes | Universal Logs and Forensics Audit call `/system-logs` instead of `/logs`, resulting in blank audit tables. |
| **Super Admin** | `/admin/*` | University Executives | ✅ Healthy | 🟡 Minor UI Quirk | Super admin metrics and role management functional; "New Event" quick action points to `/admin/reports`. |
| **CMS & Alumni Office** | `/cms/*` | Alumni Office Communications | ✅ Healthy | ✅ Fully Integrated | Dynamic homepage controls, media library, content approval workflow, templates, and registrations. |

---

## 3. High-Priority Bugs & Integration Errors

### 🔴 Critical Bug 1: Department Service Endpoint Mismatches (404 Not Found)
* **File Affected**: `frontend/src/features/departments/services/department.service.ts`
* **Underlying Cause**:
  The frontend service attempts to call endpoints that do not exist in `backend/src/modules/department/presentation/department.routes.ts`:
  - `GET /api/departments/my-department` (line 96) — Route does not exist.
  - `GET /api/departments/:departmentId/profile` (line 96) — Route does not exist.
  - `GET /api/departments/:departmentId/stats` (line 103) — Route does not exist.
  - `GET /api/departments/:departmentId/alumni` (line 110) — Route does not exist.
  - `GET /api/departments/my-analytics` (line 117) — Route does not exist.
* **Impact**:
  When a Department Head or Admin views department details (e.g. navigating to `/admin/departments/:id` or loading `useDepartmentData`), the frontend encounters 404 errors, causing components like `DepartmentInsights` and `GraduatesDirectory` to throw uncaught API exceptions or remain in perpetual error states.
* **Recommended Fix**:
  In `backend/src/modules/department/presentation/department.routes.ts`, alias or mount:
  ```ts
  router.get('/my-department', asyncHandler(DepartmentController.getMyDepartmentProfile));
  router.get('/:departmentId/profile', asyncHandler(DepartmentController.getDepartmentProfileById));
  router.get('/:departmentId/stats', asyncHandler(DepartmentController.getDepartmentStatsById));
  router.get('/:departmentId/alumni', asyncHandler(DepartmentController.getDepartmentAlumniById));
  router.get('/my-analytics', asyncHandler(DepartmentController.getMyDepartmentAnalytics));
  ```

---

### 🔴 Critical Bug 2: ICT Universal Logs & Forensics Audit Trail 404 Route Mismatch
* **Files Affected**:
  - `frontend/src/features/ict/pages/IctUniversalLogsPage.tsx` (line 104)
  - `frontend/src/features/ict/pages/IctForensicsAuditPage.tsx` (line 35)
* **Underlying Cause**:
  Both pages issue HTTP requests to:
  ```ts
  fetch('/api/admin/system-logs', ...)
  ```
  However, in `backend/src/modules/admin/infrastructure/routes/adminRoutes.ts` (line 64), the endpoint is registered as:
  ```ts
  router.get('/logs', requirePermission('view_universal_logs'), adminController.getLogs);
  ```
* **Impact**:
  When ICT administrators visit `/ict/logs` or `/ict/audit`, the request returns a `404 Not Found`. Due to an empty `.catch(() => {})`, the UI displays an empty table ("No logs recorded") despite having hundreds of audit events in PostgreSQL.
* **Recommended Fix**:
  Update both ICT frontend pages to call `/api/admin/logs` or add a route alias in `adminRoutes.ts`:
  ```ts
  router.get('/system-logs', requirePermission('view_universal_logs'), adminController.getLogs);
  ```

---

### 🔴 Critical Bug 3: Unmounted `AlumniActivationPage` & API Method Disconnect
* **Files Affected**:
  - `frontend/src/App.tsx`
  - `frontend/src/features/auth/pages/AlumniActivationPage.tsx` (line 48)
* **Underlying Cause**:
  1. `AlumniActivationPage.tsx` exists in the codebase to allow approved graduates to set their password and activate their account via an emailed token link. However, **no route** is registered in `App.tsx` for `/activate` or `/activate-alumni`.
  2. Inside `AlumniActivationPage.tsx`, the form calls `authService.resetPassword(token, password)` instead of the backend's dedicated activation endpoint (`POST /api/auth/activate-alumni`), which is backed by `ActivateAlumni.ts`.
* **Impact**:
  Alumni receiving an activation link from the Registrar receive a `404 Page Not Found`, preventing account activation.
* **Recommended Fix**:
  1. Add route in `frontend/src/App.tsx`:
     ```tsx
     <Route path="/activate-alumni" element={<AlumniActivationPage />} />
     <Route path="/activate" element={<Navigate to="/activate-alumni" replace />} />
     ```
  2. In `authService`, call `POST /api/auth/activate-alumni` with `{ token, password }`.

---

### 🟡 Bug 4: Inconsistent API Base URL Usage & Hardcoded Relative Fetches
* **Files Affected**:
  - `frontend/src/features/ict/pages/IctObservabilityPage.tsx`
  - `frontend/src/features/ict/pages/IctCommandCenterPage.tsx`
  - `frontend/src/features/ict/pages/IctApiGatewayPage.tsx`
  - `frontend/src/features/ict/pages/IctSecuritySocPage.tsx`
  - `frontend/src/features/support/services/support.service.ts`
* **Underlying Cause**:
  Multiple files use different patterns for API calls:
  - Some files use `apiClient` / `config.apiUrl`.
  - Some files use `import.meta.env.VITE_API_BASE_URL`.
  - Several ICT pages use raw relative URLs like `fetch('/api/admin/technical-ops/...')`.
* **Impact**:
  In a production environment where the frontend is hosted on a separate CDN/subdomain from the backend API, raw relative `fetch` calls will fail unless an Nginx reverse proxy explicitly rewires `/api/*`.
* **Recommended Fix**:
  Standardize all requests through `apiClient` from `frontend/src/services/api.ts` or `config.apiUrl`.

---

### 🟡 Bug 5: Quick Action Routing Mismatch in Super Admin Dashboard
* **File Affected**: `frontend/src/features/admin/pages/AdminDashboard.tsx` (line 64)
* **Underlying Cause**:
  The Quick Action button for "New Event" is defined as:
  ```ts
  { label: 'New Event', icon: Clock3, path: '/admin/reports', accent: '#E8A020' }
  ```
* **Impact**:
  Clicking "New Event" in the Super Admin dashboard takes the user to Reports Center (`/admin/reports`) rather than the Event Management module (`/cms/events`).
* **Recommended Fix**:
  Update `path` to `/cms/events`.

---

### 🟡 Bug 6: Oversized JavaScript Bundle & Dynamic/Static Import Conflict
* **Files Affected**:
  - `frontend/src/routes/adminRoutes.tsx`
  - `frontend/src/routes/cmsRoutes.tsx`
* **Underlying Cause**:
  Vite output warning: Several administrative components (`UserManagement`, `SurveyManagement`, `JobsManagement`, `AnalyticsOverview`, `NotificationCenter`, `ReportsCenter`, `AdminProfile`, `DonationsManagement`) are dynamically imported in `cmsRoutes.tsx` via `React.lazy()` but statically imported in `adminRoutes.tsx`.
* **Impact**:
  Vite cannot code-split these pages into separate chunks, causing the main bundle (`index-*.js`) to balloon to **6,943 kB (6.94 MB)**, slowing down initial page loads on lower-bandwidth mobile networks.
* **Recommended Fix**:
  Configure `manualChunks` in `vite.config.js` or lazily load admin routes consistently.

---

### 🟡 Bug 7: E2E Pipeline Test Timeout Due to Unmocked SMTP Socket
* **File Affected**: `backend/src/core/services/EmailService.ts` & `backend/tests/e2e/tracer-study-pipeline.test.ts`
* **Underlying Cause**:
  In automated Jest tests (`npm test`), triggering tracer study instant notifications causes `EmailService.sendMail` to attempt a real TCP connection to `smtp.mailtrap.io:2525`. Without an active internet connection or Mailtrap credentials, the test blocks until Jest's 60-second test timeout expires.
* **Recommended Fix**:
  In `EmailService.ts`, check if `process.env.NODE_ENV === 'test'`, and if so, mock the delivery or resolve immediately:
  ```ts
  if (process.env.NODE_ENV === 'test') {
    return { messageId: 'test-mock-msg-id' };
  }
  ```

---

## 4. Detailed Page & Route Audit

### 4.1 Public Pages
| Page | Route | Features Checked | State / Integration | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Home Page** | `/` | Hero carousel, News & Announcements, Stories, Events, Giving, Partners, Campus Life | ✅ Healthy | CMS synchronized via local snapshot + API; fallback images verified. |
| **About Page** | `/about` | Mission, 5 Engineering Schools, Accreditation readiness (ETA/ABET), Portal directory | ✅ Healthy | Complete static + responsive UI; no console errors. |
| **Partners Page** | `/partners` | Corporate partners, MoU listings, industry recruiter showcase | ✅ Healthy | Connected to CMS partner settings. |
| **Public Info / FAQ** | `/info/:slug`, `/faq` | University policies, FAQ accordions, institutional documents | ✅ Healthy | Redirects `/faq` to `/info/faq`; properly renders markdown content. |
| **Announcements** | `/announcements`, `/:id` | Notice board, category filters, search, sharing, detailed notice page | ✅ Healthy | Full pagination + share modal; fallback notice generation working. |
| **Gallery & Stories** | `/gallery`, `/stories/:id` | Video modals, photo galleries, alumni spotlight stories | ✅ Healthy | High-resolution assets, responsive modals. |
| **Events Hub** | `/events`, `/events/:id` | Upcoming events, workshops, QR attendance pass, RSVP | ✅ Healthy | Synchronized with DB events API; RSVP updates attendance counts. |
| **Alumni Community** | `/community` | Regional chapters, global leaders directory, homecoming banner | ✅ Healthy | Integrated with `communityMembersService` and public metrics. |
| **Donations Page** | `/donations` | Active campaigns, Telebirr & Chapa payment modal, progress bars | ✅ Healthy | Real Chapa donation initialize/verify API integration with guest support. |
| **Employers Landing** | `/employers` | Recruitment value proposition, partner tiers, registration CTA | ✅ Healthy | Linked to corporate registration flow. |
| **Support Page** | `/support` | Public issue submission, error code tracking, file attachments | ✅ Healthy | Integrated with `POST /api/support/tickets` and file upload storage. |
| **Contact Registrar** | `/contact-registrar` | Identity mismatch complaints, graduation year corrections | ✅ Healthy | Integrated with `POST /api/auth/register/issue`. |

---

### 4.2 Authentication & Verification Flows
| Flow | Route | Features Checked | Status |
| :--- | :--- | :--- | :--- |
| **Sign In** | `/login` | Email/Student ID login, role redirection, 2FA challenge trigger | ✅ Verified |
| **Alumni Registration** | `/register` | Student ID verification, ASTU email check, auto-redirect on missing record | ✅ Verified |
| **OTP Verification** | `/verify-otp` | 6-digit email OTP, resend countdown timer, lockout prevention | ✅ Verified |
| **National ID (Didit)** | `/verify-national-id`, `/callback` | Live camera OCR, National ID scan, fallback to Didit session | ✅ Verified |
| **Manual Verification** | `/verify-manual` | Upload degree certificate / student ID, Registrar review submission | ✅ Verified |
| **Forgot / Reset Password** | `/forgot-password`, `/reset-password` | Token-based recovery, 15-minute expiration, password complexity checks | ✅ Verified |
| **Two-Factor Auth** | `/verify-2fa` | Email OTP / Authenticator App verification, session authorization | ✅ Verified |
| **Alumni Activation** | `/activate-alumni` | Password initialization for Registrar-approved accounts | 🔴 Needs Route Mounting in `App.tsx` |

---

### 4.3 Alumni Portal (`/alumni/*`)
| Tab / Feature | Endpoint Called | Verification Notes |
| :--- | :--- | :--- |
| **Dashboard Overview** | `GET /api/alumni/dashboard-stats` | Renders application counts, tracer study reminders, recommended jobs. |
| **Profile & Experience** | `GET /api/alumni/me`, `PUT /api/alumni/me` | Experience timeline, skill tags, profile picture upload (`POST /upload`). |
| **Career & Jobs Board** | `GET /api/jobs`, `POST /api/jobs/:id/apply` | Full listing, filter by skill, resume attachment upload, withdraw application. |
| **Mentorship Matching** | `GET /api/alumni/mentors`, `POST /mentorship/request` | Peer mentor search, request session, mentor status toggle. |
| **Surveys & Tracer Studies**| `GET /api/surveys/my-surveys`, `POST /submit` | Active 6-month / 2-year / 5-year tracer studies, auto-saving drafts. |
| **Document Services** | `POST /api/alumni/document-requests` | Transcript/English proficiency requests, Chapa fee payment gateway. |
| **Discussion Forum** | `GET /api/alumni/forum`, `POST /like`, `POST /comment` | Real-time social engagement, nested comments. |
| **Hub / Direct Chat** | `GET /api/chat/contacts`, Socket.IO | Real-time messaging, audio messages, code runner sandbox. |
| **Account Settings** | `GET /api/alumni/preferences`, `PUT /change-password` | Privacy controls, 2FA toggle, account export, GDPR/privacy compliant. |

---

### 4.4 Employer Portal (`/employer/*`)
| Tab / Feature | Endpoint Called | Verification Notes |
| :--- | :--- | :--- |
| **Dashboard Telemetry** | `GET /api/employer/dashboard` | Active jobs count, candidate applicants, scheduled interviews. |
| **Company Profile** | `GET /api/employer/profile`, `PUT /profile` | TIN verification display, corporate logo upload, HR authorization docs. |
| **Job Postings** | `GET /my-jobs`, `POST /jobs`, `PUT /:id/status` | Create Full-time/Internship/Contract roles, candidate criteria filters. |
| **Candidate Applications** | `GET /api/employer/applications` | Review CVs, shortlist, reject, schedule interview. |
| **Interview Scheduler** | `GET /interviews`, `POST /interviews` | Automated interview notifications to candidate email & dashboard. |
| **Talent Search Engine** | `GET /api/employer/talent` | Search verified ASTU graduates by skill, CGPA, graduation batch. |
| **Direct Messaging** | `GET /api/employer/messages` | Real-time recruiter-to-alumni communication channel. |
| **Curriculum Feedback** | `POST /api/employer/feedback` | Graduate competency rating submitted to department heads for ETA compliance. |

---

### 4.5 Registrar Portal (`/registrar/*`)
| Tab / Feature | Endpoint Called | Verification Notes |
| :--- | :--- | :--- |
| **Verification Queue** | `GET /api/registrar/verifications` | Approve/Reject pending alumni student ID verifications. |
| **SIS Import Center** | `POST /api/registrar/import`, `POST /batch-import` | Upload CSV/Excel graduation rosters with auto-record creation. |
| **Manual Document Requests**| `GET /document-requests`, `POST /bulk-approve` | Review uploaded degrees, attach signed digital certificates. |
| **Registration Issues** | `GET /registration-issues`, `PUT /resolve` | Resolve alumni name/graduation year mismatch complaints. |
| **Scheduled Reports** | `GET /scheduled-reports`, `POST /scheduled-reports` | Automated daily/weekly PDF audit exports. |

---

### 4.6 Department Head Portal (`/department/*`)
| Tab / Feature | Status | Notes |
| :--- | :--- | :--- |
| **Overview & KPIs** | 🟡 Functional with fallback | Employment rate, graduate count, salary metrics. |
| **Employment Analytics** | 🟡 Functional with fallback | Top hiring industries, regional placement, salary progression. |
| **Skill Gap Analysis** | 🟡 Functional with fallback | Discrepancy between curricula and employer-required competencies. |
| **Tracer Reports** | 🟡 Functional with fallback | Longitudinal survey response rates and feedback. |
| **Curriculum Insights** | 🟡 Functional with fallback | Actionable course update recommendations based on recruiter ratings. |
| **Accreditation Reports** | 🟡 Functional with fallback | One-click ETA and ABET audit readiness export packs. |
| **Sub-service Calls** | 🔴 404 Disconnect | As noted in Bug 1, `department.service.ts` needs endpoint alignment in backend. |

---

### 4.7 ICT Technical Admin Portal (`/ict/*`)
| Page | Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Command Center** | `/ict/dashboard` | ✅ Operational | Real-time CPU, RAM, API latency, services health matrix. |
| **Universal Logs & Diffs** | `/ict/logs` | 🔴 404 Bug | Needs route alignment (`/system-logs` -> `/logs`). |
| **API Gateway Provisioning** | `/ict/api-gateway` | ✅ Operational | Provision external partner keys (Ministry, Chapa, SIS), rate limiting. |
| **Observability & Tracing** | `/ict/observability` | ✅ Operational | Roundtrip latency diagnostics, database backup integrity monitoring. |
| **Disaster Recovery** | `/ict/incidents` | ✅ Operational | Incident response workflow, failover procedures. |
| **OWASP Top 10 SOC** | `/ict/security` | ✅ Operational | A01-A10 security matrix, automated vulnerability scanner. |
| **Forensic Audit Trail** | `/ict/audit` | 🔴 404 Bug | Needs route alignment (`/system-logs` -> `/logs`). |
| **Registrar Sync Connector**| `/ict/integrations` | ✅ Operational | External SIS gateway health, heartbeat pings. |
| **Feature Flags** | `/ict/feature-flags` | ✅ Operational | Dynamic feature toggle engine with instant persistence. |
| **Security Policies** | `/ict/policies` | ✅ Operational | Session revocation, IP whitelisting, brute-force limits. |
| **Architecture & ASTU AI** | `/ict/architecture` | ✅ Operational | Interactive LangGraph agent status and architecture diagrams. |
| **ICT Support Desk** | `/ict/support-tickets` | ✅ Operational | Resolve escalated tickets from Super Admin and users. |

---

### 4.8 Super Admin Portal (`/admin/*`)
| Page | Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Admin Dashboard** | `/admin/dashboard` | ✅ Operational | Executive telemetry, registered alumni metrics, recent activity feed. |
| **User Management** | `/admin/users` | ✅ Operational | User search, role change, status toggle (Active/Suspended), password reset. |
| **Role & Permissions** | `/admin/roles` | ✅ Operational | Granular permission matrix (`view_users`, `manage_roles`, `edit_settings`). |
| **Survey Engine** | `/admin/surveys` | ✅ Operational | Create multi-step surveys, instant send, schedule, response analysis. |
| **Job Moderation** | `/admin/jobs` | ✅ Operational | Review, approve, feature, or close employer job postings. |
| **Department Management**| `/admin/departments` | ✅ Operational | School and department registry, head assignment. |
| **Notification Center** | `/admin/notifications` | ✅ Operational | Tri-channel broadcast (Dashboard, Email, SMS) with role targeting. |
| **Universal System Logs** | `/admin/logs` | ✅ Operational | Centralized audit log stream with JSON before/after state diff inspector. |
| **Backup & Security** | `/admin/backup` | ✅ Operational | One-click PostgreSQL backup dump, restore, download, session revocation. |
| **System Settings** | `/admin/settings` | ✅ Operational | General settings, SMTP configuration, integration test harness. |
| **Reports Center** | `/admin/reports` | ✅ Operational | Institutional reporting downloads (PDF, Excel, CSV). |
| **Admin Profile** | `/admin/profile` | ✅ Operational | Profile management, 2FA setup, security log. |

---

### 4.9 CMS & Alumni Office Portal (`/cms/*`)
| Page | Route | Status | Notes |
| :--- | :--- | :--- | :--- |
| **CMS Dashboard** | `/cms/dashboard` | ✅ Operational | Content status breakdown, quick actions, draft metrics. |
| **Content & Announcements**| `/cms/content` | ✅ Operational | Rich text editor, status (Draft/Review/Published), tags, pinned items. |
| **Dedicated Registrations**| `/cms/registrations` | ✅ Operational | Full-page alumni registration review table with export capability. |
| **Events & Workshops** | `/cms/events` | ✅ Operational | Event creation, speaker assignment, capacity and RSVP management. |
| **Homepage Management** | `/cms/homepage` | ✅ Operational | Live preview, hero slides manager, impact statistics, partner logos. |
| **Community Management** | `/cms/community` | ✅ Operational | Global alumni chapters, alumni leaders, community spotlight members. |
| **Media Library Hub** | `/cms/media` | ✅ Operational | Image and document asset uploads (`POST /api/content/media/upload`). |
| **SEO & Meta Management** | `/cms/seo` | ✅ Operational | OpenGraph tags, sitemap diagnostics, meta titles and descriptions. |
| **Approval Workflow** | `/cms/approvals` | ✅ Operational | Multi-tier review for announcements before public publication. |
| **Content Templates** | `/cms/templates` | ✅ Operational | Reusable layouts for standard university communiques and newsletters. |

---

## 5. Security & Data Integrity Audit

1. **Authentication & Password Hashing**:
   - Passwords hashed using `bcryptjs` with salt round factor 10.
   - Dual-token architecture: 15-minute JWT Access Tokens + 7-day Refresh Tokens.
   - Automatic silent token refresh in `frontend/src/services/api.ts` prevents mid-session disconnections.
2. **Access Control (RBAC)**:
   - Backend `authenticateJWT` and `requireRoles` middlewares strictly guard all private endpoints.
   - Root `SUPER_ADMIN` has operational bypass for recovery scenarios.
   - Role permissions dynamically loaded from database `SystemSetting` table.
3. **Data Protection & Sanitization**:
   - Parameterized queries enforced across all models via Prisma ORM (mitigating SQL Injection).
   - Express body parser capped at 50mb with Multer file type filtering (images, PDFs only).
   - Static upload folders (`/uploads`) explicitly protected with CORS and CORP headers.

---

## 6. Actionable Resolution Checklist

To bring all portals to 100% integration readiness, the following fixes are recommended:

- [x] **Fix 1**: Mount `/activate-alumni` in `frontend/src/App.tsx` and connect `AlumniActivationPage` to `POST /api/auth/activate-alumni`.
- [x] **Fix 2**: Add route aliases in `backend/src/modules/admin/infrastructure/routes/adminRoutes.ts` for `/system-logs` so ICT Universal Logs and Forensics Audit trails load immediately.
- [x] **Fix 3**: Add missing department routes in `backend/src/modules/department/presentation/department.routes.ts` (`/my-department`, `/:id/profile`, `/:id/stats`, `/:id/alumni`, `/my-analytics`).
- [x] **Fix 4**: Standardize ICT pages to use `apiClient` or `config.apiUrl` instead of relative `fetch('/api/...')`.
- [x] **Fix 5**: Update Quick Action "New Event" path in `AdminDashboard.tsx` to point to `/cms/events`.
- [x] **Fix 6**: Configure `rollupOptions.output.manualChunks` in `frontend/vite.config.js` to eliminate the 6.9MB chunk warning and improve initial page load speeds.
- [x] **Fix 7**: Add `process.env.NODE_ENV === 'test'` guard in `EmailService.ts` to prevent Jest test timeouts during instant survey notification testing.

> **Implementation note (Nov 2, 2026):** All seven checklist items were applied in `/home/melkamu/Desktop/Work/ASTU-AMS`. ICT log pages now call `/admin/logs` via `apiClient` (with `/system-logs` kept as a backend alias). Admin routes were also converted to `React.lazy` for consistent code-splitting with CMS.

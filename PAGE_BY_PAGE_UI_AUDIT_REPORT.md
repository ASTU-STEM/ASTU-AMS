# ASTU-AMS Exhaustive Page-by-Page UI, Routing & Enhancement Audit

**Date of Audit**: November 2, 2026  
**System**: Adama Science and Technology University - Alumni Management System (ASTU-AMS)  
**Total Pages Audited**: 75+ Pages, Workspaces & Dynamic Views  

---

## SECTION 1: PUBLIC PORTAL PAGES

### 1.1 Home Page
* **File**: `frontend/src/pages/HomePage.tsx`
* **Route**: `/`
* **Access**: Public (Unauthenticated)
* **Redirects / Guards**:
  - Checks `localStorage.getItem("user")` on mount to show user welcome chips or role-specific shortcuts.
  - No redirect guard; serves as primary landing for guests and returning alumni.
* **UI Structure**:
  - **Header**: Global sticky `Navbar` with mega menus, notification bell, theme toggle, and search dialog.
  - **Top Progress Bar**: Scroll position indicator fixed at `top-0`.
  - **Hero Carousel**: 3 full-bleed slides with text badges, headings, CTA buttons, and auto-scroll (6s interval).
  - **Live Impact Counter**: Total registered alumni, engineering schools, corporate partners, historic batches.
  - **News & Announcements Carousel**: Multi-slide grid with category tags, publication dates, and read more links.
  - **Alumni Success Stories**: Interactive card slider with graduation years, companies, quotes, and profile avatars.
  - **Upcoming Events & Workshops**: Dual-column tabbed selector for conferences and technical labs.
  - **Giving & Philanthropy Section**: Active scholarship and laboratory equipment campaigns with Telebirr/Chapa donation triggers.
  - **Corporate Partners Logo Wall**: Strategic enterprise partners (Ethio Telecom, Ethiopian Airlines, INSA, Huawei).
  - **Interactive Campus Life Gallery**: Modal preview for graduation, lab research, and drone videos.
  - **Footer**: Multi-column links, social media handles, accreditation seals, and copyright disclaimer.
* **UI States Handled**:
  - *Loading*: Renders instant cached localStorage snapshot followed by transparent SWR API reconciliation.
  - *Empty State*: Hides empty announcement/event blocks or shows clean placeholder without breaking layout.
  - *Modals*: `TelebirrDonationModal`, `ShareCampaignModal`, `VideoDetailModal`, `ShareModal`.
* **Identified UI Bugs & Flaws**:
  - *File Length & Monolithic Architecture*: File is 5,039 lines long, making re-renders sluggish on low-spec mobile devices.
  - *Scroll Jitter*: Multiple `IntersectionObserver` instances update DOM classes simultaneously, causing micro-stutters.
  - *Image Fallbacks*: External Unsplash image URLs occasionally fail on restricted university intranets.
* **Enhancements Recommended**:
  - Modularize the 11 homepage sections into dedicated components under `features/public/components/home/`.
  - Implement CSS `content-visibility: auto` on offscreen carousels to cut initial paint time by 45%.
  - Add skeleton placeholders for dynamic news and event cards during API synchronization.

---

### 1.2 About ASTU Page
* **File**: `frontend/src/pages/AboutPage.tsx`
* **Route**: `/about`
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - **Hero Banner**: Navy gradient with blur orbs, breadcrumb navigation, and institution tagline.
  - **Stats Bar**: 4-column metric grid (Founded 1993, 35,000+ Alumni, 5 Engineering Schools, 120+ Employers).
  - **Core Pillars**: Cards with Lucide icons (Technological Excellence, Tracer Studies, Industry Co-Creation, Accreditation).
  - **Portal Interactive Matrix**: Accordion tab switching between Alumni, Employer, Registrar, and Department portals with direct login CTAs.
  - **5 Engineering Schools Showcase**: Detailed cards for SEEC, SCEA, SoMCME, SANS, and SHSS.
  - **FAQ Section**: Accordion collapse for ETA accreditation, alumni card verification, and partnerships.
* **UI States Handled**:
  - Tab toggles between Overview, Portals, Schools, Accreditation, and Campus.
* **Identified UI Bugs & Flaws**:
  - High-density text in school descriptions overflows on narrow mobile screens (320px–375px).
* **Enhancements Recommended**:
  - Add interactive SVG campus blueprint map highlighting research institutes and engineering laboratories.
  - Add printable PDF institution brochure download button in the header.

---

### 1.3 Partners & Industry Stakeholders Page
* **File**: `frontend/src/pages/PartnersPage.tsx`
* **Route**: `/partners`
* **Access**: Public
* **Redirects / Guards**: URL query parameter support (`?tab=stakeholders` or `?tab=employers`).
* **UI Structure**:
  - Tabbed interface separating Corporate Employers, Strategic Stakeholders, and Research Partners.
  - Partner grid displaying tier badges (Strategic, Technology, Research, Recruitment).
  - Employer MoU benefits breakdown and partnership proposal submission modal.
* **Identified UI Bugs & Flaws**:
  - Empty logo fallback renders an unstyled placeholder if an employer has no SVG logo defined.
* **Enhancements Recommended**:
  - Add auto-generated corporate monogram avatars (e.g. "ET" with colored badge) when logo image fails to load.

---

### 1.4 Institutional Info & FAQ Dynamic Pages
* **File**: `frontend/src/pages/PublicInfoPage.tsx`
* **Route**: `/info/:slug` (and `/faq` which redirects to `/info/faq`)
* **Access**: Public
* **Redirects / Guards**: Redirect `/faq` -> `/info/faq`.
* **UI Structure**:
  - Dynamically renders content according to `:slug` (`campuses`, `campus-life`, `research`, `alumni-stories`, `video-gallery`, `faq`, etc.).
  - Left navigation sidebar listing sibling institutional topics.
  - Breadcrumb navigation and share modal.
* **Identified UI Bugs & Flaws**:
  - Large embedded videos in `video-gallery` slug load synchronously, causing initial layout shifts (CLS).
* **Enhancements Recommended**:
  - Wrap embedded YouTube/Vimeo players in lazy-loaded facades that only fetch iframes on click.

---

### 1.5 Announcements Directory Page
* **File**: `frontend/src/pages/AnnouncementListPage.tsx`
* **Route**: `/announcements`
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - Filter tabs: All Notices, Announcements, Posts & Articles, Pages, Galleries.
  - Live search bar and pagination bar (6 items per page).
  - Notice cards featuring Directorate badges, publication dates, and excerpt previews.
* **Identified UI Bugs & Flaws**:
  - Search query clears on tab switch without persisting in URL search params.
* **Enhancements Recommended**:
  - Synchronize filter and search query into URL query params (`/announcements?category=news&q=workshop`).

---

### 1.6 Announcement Detail Page
* **File**: `frontend/src/pages/AnnouncementDetailPage.tsx`
* **Route**: `/announcements/:id`
* **Access**: Public
* **Redirects / Guards**: Resolves `:id` by numeric ID or slugified title; displays styled fallback if missing.
* **UI Structure**:
  - Hero header with breadcrumbs (Home > Announcements > Title).
  - Formatted article body with responsive typography and image attachments.
  - "Related Notices" sidebar (top 4 recent announcements) and Share modal.
* **Enhancements Recommended**:
  - Add "Estimated Read Time" indicator (e.g. "3 min read") and TTS (Text-to-Speech) audio reader.

---

### 1.7 Public Photo & Media Gallery Page
* **File**: `frontend/src/pages/PublicGalleryPage.tsx`
* **Route**: `/gallery`
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - Category filters: All Media, Graduation, Workshops, Campus, Research, Labs.
  - Masonry image grid with hover zoom, lightbox image viewer modal, and video modal launcher.
* **Enhancements Recommended**:
  - Add full-screen slideshow mode with keyboard navigation (`ArrowLeft` / `ArrowRight` / `Escape`).

---

### 1.8 Alumni Success Story Detail Page
* **File**: `frontend/src/pages/StoryDetailPage.tsx`
* **Route**: `/stories/:id`
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - Full-width hero banner with graduate portrait, graduation batch, and current executive role.
  - Career journey milestones timeline and quote highlight callout.
* **Enhancements Recommended**:
  - Add LinkedIn direct profile connection link and mentorship booking CTA for registered alumni.

---

### 1.9 Events & Workshops Hub Page
* **File**: `frontend/src/pages/EventsPage.tsx`
* **Route**: `/events`
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - Category filters (Upcoming, Past, Workshops, Conferences, Career Fairs).
  - Search input with clear button.
  - Event cards with calendar badges, venue tags, speaker photos, and RSVP buttons.
  - RSVP modal generating digital QR entrance pass with one-click download.
* **Enhancements Recommended**:
  - Add "Add to Google Calendar" / "Add to Outlook" ICS file download button.

---

### 1.10 Event Detail Page
* **File**: `frontend/src/pages/EventDetailPage.tsx`
* **Route**: `/events/:id`
* **Access**: Public
* **Redirects / Guards**: Dynamic matching by event ID or slugified title.
* **UI Structure**:
  - Hero header with event banner, venue location pin, and schedule time.
  - Speaker bios, workshop curriculum breakdown, and live RSVP form.
* **Enhancements Recommended**:
  - Add interactive Leaflet map component showing exact ASTU Main Campus building coordinates.

---

### 1.11 Alumni Community & Global Chapters Page
* **File**: `frontend/src/pages/AlumniCommunityPage.tsx`
* **Route**: `/community`
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - Dynamic hero statistics (Globally verified graduates, corporate partners, historic batches).
  - Global leaders directory filtering by Executive, Policy, Academia, and Infrastructure.
  - Regional chapters accordion (Addis Ababa, Adama, North America, Europe, Middle East).
  - Flagship Homecoming Carnival 2026 registration banner.
* **Enhancements Recommended**:
  - Add interactive 3D WebGL globe showing geographic density of ASTU graduates worldwide.

---

### 1.12 Giving & Donations Page
* **File**: `frontend/src/pages/DonationsPage.tsx`
* **Route**: `/donations`
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - Hero banner with transparency audit badge.
  - Active campaigns grid (Scholarship Fund 2026, AI Research Lab, Innovation Makerspace, Solar Microgrid).
  - Real-time funding progress bars, percentage raised, and total donor counts.
  - Integrated `TelebirrDonationModal` supporting Telebirr, CBE Birr, and Chapa card payments.
* **Enhancements Recommended**:
  - Add live donor recognition wall with anonymous donation toggle and digital tax receipt PDF generation.

---

### 1.13 Employers Public Landing Page
* **File**: `frontend/src/pages/EmployersPage.tsx`
* **Route**: `/employers`
* **Access**: Public
* **Redirects / Guards**: Directs to `/employers/register` for signup and `/login` for corporate portal.
* **UI Structure**:
  - Enterprise recruitment value proposition: direct SIS verification, talent search, and campus hackathons.
  - Featured partner logo carousel and employer FAQs.
* **Enhancements Recommended**:
  - Add interactive salary benchmark calculator by engineering discipline.

---

### 1.14 404 Not Found Page
* **File**: `frontend/src/pages/NotFoundPage.tsx`
* **Route**: `*` (Catch-all)
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - Centered error container with search icon, 404 badge, explanatory text, and "Go to Homepage" button.
* **Enhancements Recommended**:
  - Add quick search bar and list of top visited links (Home, Login, Events, Announcements).

---

## SECTION 2: AUTHENTICATION, REGISTRATION & VERIFICATION FLOWS

### 2.1 Sign In Page
* **File**: `frontend/src/features/auth/pages/LoginPage.tsx`
* **Route**: `/login`
* **Access**: Public (Unauthenticated)
* **Redirects / Guards**:
  - If authenticated, redirects to role dashboard (`/alumni/dashboard`, `/employer/dashboard`, `/admin/dashboard`, `/ict/dashboard`, etc.).
  - Handles `?redirect=` query param for deep links.
  - If user account has 2FA enabled, redirects to `/verify-2fa`.
* **UI Structure**:
  - Two-tone AuthLayout shell with institutional ASTU seal.
  - Tabbed input supporting Email or Student ID (`UGR/XXXXX/YY`).
  - Password visibility toggle, "Remember Me" checkbox, and "Forgot Password" link.
  - Role-specific login helper tooltips.
* **Identified UI Bugs & Flaws**:
  - Toast notification "Login successful" occasionally flickers twice on quick double-clicks.
* **Enhancements Recommended**:
  - Add WebAuthn / Passkey fingerprint / Face ID sign-in option for modern devices.

---

### 2.2 Alumni Registration Page
* **File**: `frontend/src/features/auth/pages/AlumniRegistrationPage.tsx`
* **Route**: `/register`
* **Access**: Public
* **Redirects / Guards**:
  - On submit with missing institutional record: navigates to `/contact-registrar`.
  - On submit with valid email: navigates to `/verify-otp`.
* **UI Structure**:
  - Multi-field registration form: First/Middle/Last Name, Gender, Student ID, Graduation Year, Department.
  - Password meter with visual strength indicator (Weak, Fair, Strong).
  - Checkbox toggle: "I don't have an active ASTU institutional email".
* **Enhancements Recommended**:
  - Add real-time debounced Student ID format checker with inline green checkmark indicator.

---

### 2.3 Employer Registration Page
* **File**: `frontend/src/features/auth/pages/EmployerRegistrationPage.tsx`
* **Route**: `/employers/register`
* **Access**: Public
* **Redirects / Guards**:
  - On successful submission: displays pending verification modal and link to login.
* **UI Structure**:
  - Company Legal Name, 10-digit TIN validation, Industry selector, Location, HR contact, Official corporate email, Password.
* **Enhancements Recommended**:
  - Add commercial registry document upload zone directly during registration to expedite approval.

---

### 2.4 OTP Email Verification Page
* **File**: `frontend/src/features/auth/pages/VerifyOtpPage.tsx`
* **Route**: `/verify-otp`
* **Access**: Guarded by `VerificationRouteGuard` (requires active registration in memory).
* **Redirects / Guards**:
  - If user indicated no ASTU email, renders buttons to verify via National ID or Manual verification.
* **UI Structure**:
  - 6-digit individual numeric input boxes with auto-focus advancing.
  - Resend countdown timer (45 seconds cooldown).
  - Lockout warning banner after 3 incorrect attempts.
* **Enhancements Recommended**:
  - Support automatic clipboard paste of 6-digit code across all boxes.

---

### 2.5 National ID Verification Page
* **File**: `frontend/src/features/auth/pages/NationalIdVerificationPage.tsx`
* **Route**: `/verify-national-id`
* **Access**: Guarded by `VerificationRouteGuard`.
* **Redirects / Guards**:
  - Launches Didit session and redirects to `/verify-national-id/callback?sessionId=...`.
* **UI Structure**:
  - Step indicator (Step 2 of 3: Verify identity).
  - Privacy policy disclaimer regarding Didit biometric handling.
  - "Continue with Didit" primary CTA and "Try Manual Verification" fallback.
* **Enhancements Recommended**:
  - Add video tutorial animation demonstrating how to hold the National ID card to the camera.

---

### 2.6 National ID Camera OCR Callback Page
* **File**: `frontend/src/features/auth/pages/VerifyNationalIdCallbackPage.tsx`
* **Route**: `/verify-national-id/callback`
* **Access**: Guarded by `VerificationRouteGuard`.
* **Redirects / Guards**: Navigates to `/login` upon successful verification.
* **UI Structure**:
  - Live WebRTC camera viewfinder with rectangular ID card overlay guide.
  - Snapshot capture button with client-side Tesseract.js OCR progress bar.
  - Verification review screen comparing OCR extracted name against Registrar registration record.
* **Enhancements Recommended**:
  - Add automatic card detection using edge detection before manual shutter press.

---

### 2.7 Manual Verification Document Upload Page
* **File**: `frontend/src/features/auth/pages/VerifyManualPage.tsx`
* **Route**: `/verify-manual`
* **Access**: Guarded by `VerificationRouteGuard`.
* **Redirects / Guards**: Redirects to confirmation screen with generated Tracking Request ID.
* **UI Structure**:
  - Drag-and-drop document upload zone supporting PDF, PNG, JPG (up to 5MB).
  - Document type dropdown (Degree Certificate, Temporary Certificate, Student ID, National Passport).
* **Enhancements Recommended**:
  - Add PDF client-side thumbnail preview before submission.

---

### 2.8 Forgot Password Page
* **File**: `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`
* **Route**: `/forgot-password`
* **Access**: Public
* **Redirects / Guards**: None.
* **UI Structure**:
  - Method selector toggle (Email recovery vs SMS Phone recovery).
  - Confirmation screen showing masked destination and 15-minute expiry notice.
* **Enhancements Recommended**:
  - Add security challenge question fallback if recovery email is lost.

---

### 2.9 Reset Password Page
* **File**: `frontend/src/features/auth/pages/ResetPasswordPage.tsx`
* **Route**: `/reset-password`
* **Access**: Public with query param (`?token=...`).
* **Redirects / Guards**: Redirects to `/login` after successful reset.
* **UI Structure**:
  - New Password, Confirm Password, Password Strength criteria checklist.
* **Enhancements Recommended**:
  - Display informative warning if reset token has expired with one-click "Request New Link" button.

---

### 2.10 Two-Factor Authentication Challenge Page
* **File**: `frontend/src/features/auth/pages/Verify2FAPage.tsx`
* **Route**: `/verify-2fa`
* **Access**: Public; requires pending session state from login.
* **Redirects / Guards**:
  - If navigated directly without pending credentials: redirects to `/login`.
  - On verification: navigates to role-specific dashboard.
* **UI Structure**:
  - Tabbed selection: Authenticator App (TOTP) vs Email OTP.
  - 6-digit code entry with instant submit on 6th digit.
* **Enhancements Recommended**:
  - Add "Trust this browser for 30 days" checkbox.

---

### 2.11 Contact Registrar Data Correction Page
* **File**: `frontend/src/features/auth/pages/ContactRegistrarPage.tsx`
* **Route**: `/contact-registrar`
* **Access**: Public
* **Redirects / Guards**: Pre-fills fields if navigated from registration failure.
* **UI Structure**:
  - Student ID, Full Name, Graduation Year, Contact Email, Phone, Department.
  - Issue Type dropdown (Missing SIS Record, Misspelled Name, Graduation Year Discrepancy, Lost Credentials).
  - File attachment zone for supporting university documents.
* **Enhancements Recommended**:
  - Add ticket lookup bar so alumni can track the resolution status of their previous complaint.

---

### 2.12 Technical Support Desk Page
* **File**: `frontend/src/features/support/pages/SupportPage.tsx`
* **Route**: `/support`
* **Access**: Public
* **Redirects / Guards**: Auto-captures `currentRoute` and `lastErrorCode` from React Router state.
* **UI Structure**:
  - Category selector (Auth Verification, Tracer Studies, Document Services, General Inquiry).
  - Message textarea, file attachment zone, and privacy consent checkbox.
  - Success receipt screen showing generated Ticket ID.
* **Enhancements Recommended**:
  - Add live chatbot resolution suggestion widget before submitting ticket.

---

### 2.13 Alumni Account Activation Page (Unmounted)
* **File**: `frontend/src/features/auth/pages/AlumniActivationPage.tsx`
* **Route**: `/activate-alumni` (Needs registration in `App.tsx`)
* **Access**: Public with query param (`?token=...`).
* **Redirects / Guards**: Navigates to `/login` on completion.
* **UI Structure**:
  - Welcome greeting, New Password, Confirm Password, Account activation CTA.
* **Identified UI Bugs & Flaws**:
  - Currently not routed in `App.tsx` (returns 404). Calls `resetPassword` instead of `activateAlumni`.
* **Enhancements Recommended**:
  - Mount route `/activate-alumni` in `App.tsx` and connect to `POST /api/auth/activate-alumni`.

---

## SECTION 3: ALUMNI WORKSPACE PORTAL (`/alumni/*`)

### 3.1 Alumni Master Shell
* **File**: `frontend/src/features/alumni/pages/AlumniDashboard.tsx`
* **Route**: `/alumni/dashboard`, `/alumni/tools`, `/alumni/jobs`
* **Access Guard**: `ProtectedRoute` (`allowedRoles: ['ALUMNI']`).
* **Redirects / Guards**: Unauthenticated users redirected to `/login?redirect=/alumni/dashboard`.
* **UI Structure**:
  - **Sidebar**: Collapsible drawer with institutional seal, navigation items, unread counters, and profile completion badge.
  - **Top Bar**: Search input, HelpCenter dialog trigger, theme toggle, notification bell with unread badge, and user dropdown.
  - **Tab Switcher**: 11 core sub-tabs.

### 3.2 Alumni Sub-Tabs Detail:
1. **Dashboard Overview Tab** (`DashboardOverview.tsx`): Profile completion progress ring, recent job matches, pending survey alert banner, and alumni forum highlights.
2. **Profile & Experience Tab** (`ProfileTab.tsx`): Personal info, avatar upload, degree credentials, work history timeline, and skills tags editor.
3. **Jobs Board Tab** (`JobsTab.tsx`): Search by skill/location, job type badges (Full-Time, Internship), single-click application with resume upload, and saved jobs shelf.
4. **Tracer Studies Tab** (`SurveysTab.tsx`): Active surveys list, completion status badges, multi-step survey modal with auto-save draft.
5. **Mentorship Tab** (`MentorshipTab.tsx`): Mentor registry search, request mentorship modal, scheduled mentoring sessions, and "Become a Mentor" profile toggle.
6. **Document Services Tab** (`DocumentServicesTab.tsx`): Request official transcripts or medium of instruction letters; integrates real Chapa payment processing.
7. **Directory Tab** (`AlumniDirectoryTab.tsx`): Search fellow graduates by batch, company, and department with direct "Connect" CTA.
8. **Direct Messages Tab** (`MessagingTab.tsx` / `TelegramChat.tsx`): Real-time chat with recruiters and mentors, voice audio player, and built-in JavaScript/Python/C++ code sandbox.
9. **Settings Tab** (`SettingsTab.tsx`): Notification preferences, profile privacy visibility toggles, 2FA management, and GDPR account data export.
10. **Alumni AI Tools Studio** (`AlumniToolsPage.tsx`): AI CV Builder, cover letter generator, and career path simulator.

---

## SECTION 4: EMPLOYER WORKSPACE PORTAL (`/employer/*`)

### 4.1 Employer Master Shell
* **File**: `frontend/src/features/employers/pages/EmployerDashboard.tsx`
* **Route**: `/employer/dashboard`
* **Access Guard**: `ProtectedRoute` (`allowedRoles: ['EMPLOYER']`).
* **Redirects / Guards**: Unauthenticated users redirected to `/login`.
* **UI Structure**:
  - **Header Stats**: Active Requisitions, Total Applications Received, Shortlisted Candidates, Confirmed Hires, Feedback Files.
  - **Sub-Tabs**:
    1. *Dashboard Overview*: Hiring funnel pipeline chart, recent applicant activity stream, quick requisition drawer.
    2. *Company Profile*: Corporate description, official TIN badge, company logo uploader, HR authorization verification.
    3. *Job Postings*: Post new job modal, status toggle (Open/Closed), applications count per job.
    4. *Candidates Pipeline*: Kanban/Table view of applicants, CV PDF viewer modal, status updater (Shortlist, Interview, Hire, Reject).
    5. *Interview Scheduler*: Date/time picker, video meeting link generator, automated candidate email invitation.
    6. *Talent Search*: Filter verified ASTU graduates by department, skills, graduation batch, and CGPA.
    7. *Direct Messages*: Real-time chat with applicants and university career advisors.
    8. *Curriculum Feedback*: Submit 2-year employer competency ratings that directly feed into university accreditation review boards.

---

## SECTION 5: REGISTRAR WORKSPACE PORTAL (`/registrar/*`)

### 5.1 Registrar Master Shell
* **File**: `frontend/src/features/registrar/pages/RegistrarDashboard.tsx`
* **Route**: `/registrar/dashboard`
* **Access Guard**: `ProtectedRoute` (`allowedRoles: ['REGISTRAR']`).
* **Redirects / Guards**: Unauthenticated users redirected to `/login`.
* **UI Structure**:
  - **Telemetry Banner**: Total SIS Graduates, Verified Alumni, Pending Verifications, Pending Document Requests.
  - **Sub-Tabs**:
    1. *Verification Queue*: Approve or reject pending student registrations with student ID match.
    2. *SIS Roster Batch Upload*: Drag-and-drop CSV/Excel roster import with live validation and sync status logs.
    3. *Manual Document Requests*: Digital signature attachment, draft certificate review, and bulk approve/reject.
    4. *Alumni Registry*: Searchable database of all ASTU graduates with status indicators (Active, Suspended).
    5. *Data Issues Desk*: Resolve alumni complaints regarding misspelled names or graduation year discrepancies.
    6. *Scheduled Reports*: Schedule recurring PDF audit reports (daily/weekly) with automatic email dispatch.

---

## SECTION 6: DEPARTMENT HEAD WORKSPACE PORTAL (`/department/*`)

### 6.1 Department Head Master Shell
* **File**: `frontend/src/features/departments/pages/DepartmentDashboard.tsx`
* **Route**: `/department/dashboard` (and `/department` redirecting to `/department/dashboard`).
* **Access Guard**: `ProtectedRoute` (`allowedRoles: ['DEPARTMENT_HEAD', 'ADMIN']`).
* **UI Structure**:
  - **Sub-Tabs**:
    1. *Overview*: Department graduate employability rate, average salary, and top hiring employers.
    2. *Employment Analytics*: Salary progression, regional placement distribution, and industry share.
    3. *Skill Gap Analysis*: Comparison between curricula outcomes and recruiter missing skills.
    4. *Tracer Reports*: Longitudinal survey response rates and alumni feedback.
    5. *Curriculum Insights*: Automated course alignment recommendations based on market demand.
    6. *Accreditation Dossier*: Export readiness packages for Education and Training Authority (ETA) and ABET.
    7. *Department Survey Center*: Create and dispatch department-specific surveys.
    8. *Export Center*: Generate PDF, Excel, and CSV executive reports.

---

## SECTION 7: ICT TECHNICAL ADMIN PORTAL (`/ict/*`)

### 7.1 ICT Master Layout & 12 Standalone Pages
* **Layout**: `frontend/src/layouts/IctLayout.tsx` & `IctSidebar.tsx`
* **Route Base**: `/ict/*`
* **Access Guard**: `ProtectedRoute` (`allowedRoles: ['ADMIN', 'SUPER_ADMIN']`).
* **Pages Audited**:
  1. `/ict/dashboard` (`IctCommandCenterPage.tsx`): CPU/RAM load, services operational matrix, roundtrip latency.
  2. `/ict/logs` (`IctUniversalLogsPage.tsx`): Cross-portal audit stream with Before/After JSON state mutation diff inspector.
  3. `/ict/api-gateway` (`IctApiGatewayPage.tsx`): External API keys provisioning (Registrar SIS, Ministry of Education, Chapa), rate limits, IP whitelists.
  4. `/ict/observability` (`IctObservabilityPage.tsx`): Live roundtrip latency metrics, PostgreSQL backup integrity, distributed request tracing.
  5. `/ict/incidents` (`IctIncidentsPage.tsx`): Incident response workflows, failover switches, disaster recovery runbooks.
  6. `/ict/security` (`IctSecuritySocPage.tsx`): OWASP Top 10 (A01-A10) active mitigation matrix and automated security scanner.
  7. `/ict/audit` (`IctForensicsAuditPage.tsx`): Immutable forensics audit trail tracking IP, user mutations, and database records.
  8. `/ict/integrations` (`IctIntegrationsPage.tsx`): External connectors health and registrar sync status.
  9. `/ict/feature-flags` (`IctFeatureFlagsPage.tsx`): Dynamic feature flag toggles with instant persistence.
  10. `/ict/policies` (`IctPoliciesSessionsPage.tsx`): Session revocation, IP whitelists, and brute-force lockout policies.
  11. `/ict/architecture` (`IctArchitecturePage.tsx`): Interactive LangGraph agent topology and server architecture diagnostics.
  12. `/ict/support-tickets` (`IctSupportTicketsPage.tsx`): Support ticket triage and resolution desk for escalated technical issues.

---

## SECTION 8: SUPER ADMIN EXECUTIVE PORTAL (`/admin/*`)

### 8.1 Super Admin Layout & 18 Administrative Pages
* **Layout**: `frontend/src/layouts/AdminLayout.tsx`
* **Route Base**: `/admin/*`
* **Access Guard**: `ProtectedRoute` (`allowedRoles: ['SUPER_ADMIN']`).
* **Pages Audited**:
  1. `/admin/dashboard` (`AdminDashboard.tsx`): Executive platform telemetry, total registered alumni, employment rate, quick actions.
  2. `/admin/ict-portal` (`IctAdminDashboard.tsx`): Direct bridge to technical operations.
  3. `/admin/users` (`UserManagement.tsx`): User database, role elevation, account suspension, password reset.
  4. `/admin/roles` (`RoleManagement.tsx`): Granular permission matrix (`view_users`, `manage_roles`, `edit_settings`).
  5. `/admin/analytics` (`AnalyticsOverview.tsx`): Longitudinal alumni employment trends, salary distributions, department comparisons.
  6. `/admin/surveys` (`SurveyManagement.tsx`): Create, clone, schedule, and analyze graduate tracer surveys.
  7. `/admin/jobs` (`JobsManagement.tsx`): Job posting moderation, feature job toggle, application status updates.
  8. `/admin/departments` (`DepartmentManagement.tsx`): Create and manage schools and academic departments.
  9. `/admin/departments/:id` (`DepartmentManagement.tsx`): Specific department deep-dive inspection view.
  10. `/admin/donations` (`DonationsManagement.tsx`): Campaign creation, target goal tracking, donor ledger.
  11. `/admin/notifications` (`NotificationCenter.tsx`): Multi-channel broadcast (Dashboard, Email, SMS).
  12. `/admin/logs` (`SystemLogs.tsx`): Centralized system audit logs with JSON mutation inspection.
  13. `/admin/backup` (`BackupSecurity.tsx`): One-click database backup creation, restore, and session termination.
  14. `/admin/settings` (`SystemSettings.tsx`): System parameters, branding logos, SMTP settings, integration tests.
  15. `/admin/reports` (`ReportsCenter.tsx`): Institutional compliance report generation and export.
  16. `/admin/support-tickets` (`SupportDeskManagement.tsx`): Platform-wide support ticket management and escalation to ICT.
  17. `/admin/messages` (`AdminChatPage.tsx`): Multi-role administrative messaging hub.
  18. `/admin/profile` (`AdminProfile.tsx`): Super admin profile and 2FA configuration.

---

## SECTION 9: CMS & ALUMNI OFFICE PORTAL (`/cms/*`)

### 9.1 CMS Layout & 15 Content Management Pages
* **Layout**: `frontend/src/layouts/CmsLayout.tsx`
* **Route Base**: `/cms/*`
* **Access Guard**: `ProtectedRoute` (`allowedRoles: ['ADMIN', 'CMS_MANAGER', 'ALUMNI_OFFICE']`).
* **Pages Audited**:
  1. `/cms/dashboard` (`CmsDashboard.tsx`): Publication status breakdown, quick content editor, pending drafts.
  2. `/cms/content` & `/cms/announcements` (`ContentList.tsx`): News and official announcement manager.
  3. `/cms/registrations/full` (`DedicatedRegistrationsPage.tsx`): Standalone full-width registration directory without sidebar.
  4. `/cms/registrations` (`AnnouncementRegistrations.tsx`): Announcement attendee registrations manager.
  5. `/cms/events` (`EventWorkshopManagement.tsx`): Event scheduling, speaker profiles, and venue capacity.
  6. `/cms/homepage` & `/cms/institutional-pages` (`HomepageManagement.tsx`): Real-time live homepage visual editor.
  7. `/cms/partners` & `/cms/employers` (`PartnersManagement.tsx`): Strategic partner logo registry and descriptions.
  8. `/cms/community` (`CommunityManagement.tsx`): Regional chapter coordinator profiles and contacts.
  9. `/cms/community-members` (`CommunityMembersManagement.tsx`): Notable alumni spotlight manager.
  10. `/cms/media` & `/cms/gallery` (`MediaGalleryHub.tsx`): Asset library for images, banners, and documents.
  11. `/cms/seo` (`SEOManagement.tsx`): Meta tags, OpenGraph images, and sitemap diagnostics.
  12. `/cms/approvals` (`ApprovalWorkflow.tsx`): Draft review and approval queue before publication.
  13. `/cms/templates` (`ContentTemplates.tsx`): Reusable layout templates for university communiques.
  14. `/cms/messages` (`CmsChatPage.tsx`): Direct communication channel for alumni office staff.
  15. `/cms/settings` (`CmsSettings.tsx`): CMS configuration and publishing defaults.

---

## SECTION 10: MASTER UI ENHANCEMENT BLUEPRINT

1. **Accessibility (WCAG 2.1 AA Compliance)**:
   - Ensure all color contrasts across light and dark modes achieve at least 4.5:1 ratio for text and 3:1 for interactive icons.
   - Add explicit `aria-label` tags to icon-only buttons across all dashboards.
2. **Design System Standardization**:
   - Consolidate color variables into `global.css` using ASTU Official palette: Primary Navy (`#003580`), Gold Accent (`#E8A020`), Crimson (`#D32F2F`), and Deep Teal (`#1D9E75`).
3. **Responsive Breakpoints & Touch Targets**:
   - Ensure all table action buttons on mobile screens meet the minimum 44x44px touch target guidelines.
4. **Performance & Code-Splitting**:
   - Refactor `HomePage.tsx` from 5,039 lines into modular component slices to optimize virtual DOM reconciliation.
   - Split admin and CMS dynamic imports into dedicated Rollup vendor chunks in `vite.config.js`.

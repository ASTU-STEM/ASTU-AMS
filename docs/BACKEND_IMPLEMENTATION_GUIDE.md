# ASTU-AMS Backend Implementation Guide

This document defines the backend contract needed by the frontend modules implemented in `frontend/src/app`, `frontend/src/features/*`, and `frontend/src/components/*`.

## Backend Goal

The backend should provide a secure REST API for the ASTU Alumni Management System. It must support role-based portals for alumni, employers, registrar staff, department heads, and administrators.

## Recommended Stack

- Node.js + Express + TypeScript
- PostgreSQL
- Prisma ORM
- JWT access tokens and refresh tokens
- RBAC middleware
- Zod or Yup request validation
- Swagger/OpenAPI documentation
- Background jobs for email, survey reminders, backup checks, and SIS imports

## Required Modules

### Auth

Responsibilities:
- Login, logout, refresh token
- Alumni activation
- Employer registration approval
- Password reset
- MFA readiness for admin and registrar roles

Core endpoints:
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/alumni/activate`
- `POST /api/auth/password/forgot`
- `POST /api/auth/password/reset`

### Users and RBAC

Responsibilities:
- User CRUD
- Role assignment
- Permission matrix
- Session revocation
- Login history

Core endpoints:
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/roles`
- `PATCH /api/admin/roles/:id/permissions`
- `GET /api/admin/login-history`
- `POST /api/admin/sessions/:id/revoke`

### Registrar

Responsibilities:
- Graduate record management
- Academic history verification
- Batch imports
- Certificate verification
- Clearance tracking
- Student-to-alumni migration
- Transcript workflows

Core endpoints:
- `GET /api/registrar/graduates`
- `POST /api/registrar/graduates`
- `POST /api/registrar/batches`
- `POST /api/registrar/batches/:id/import`
- `GET /api/registrar/academic-history/:studentId`
- `GET /api/registrar/certificates`
- `GET /api/registrar/clearances`
- `POST /api/registrar/migrations`
- `GET /api/registrar/transcripts`
- `PATCH /api/transcripts/:id/process`

### Employers

Responsibilities:
- Company profile
- Job posting
- Bulk job imports
- AI candidate matching
- Talent pools
- Shortlisting
- Campus recruitment
- Internship cohorts
- Job fair management
- Verification requests
- Recruitment analytics

Core endpoints:
- `GET /api/employers/:id/profile`
- `PATCH /api/employers/:id/profile`
- `GET /api/employers/:id/jobs`
- `POST /api/employers/:id/jobs`
- `POST /api/employers/:id/jobs/bulk`
- `POST /api/employers/:id/matches`
- `GET /api/jobs/:id/matches`
- `GET /api/employers/:id/talent-pools`
- `POST /api/talent-pools/:id/members`
- `PATCH /api/applications/:id/status`
- `GET /api/employers/:id/campus-events`
- `GET /api/employers/:id/internships`
- `GET /api/employers/:id/recruitment-analytics`
- `POST /api/employers/:id/verifications`

### Departments

Responsibilities:
- Graduate outcomes
- Curriculum review
- KPI dashboards
- Ranking evidence
- Research collaboration
- Skill gap and tracer analytics
- Employer feedback reports
- Accreditation exports

Core endpoints:
- `GET /api/departments/:id/graduate-outcomes`
- `GET /api/departments/:id/curriculum-reviews`
- `POST /api/departments/:id/curriculum-reviews`
- `GET /api/departments/:id/kpis`
- `POST /api/departments/:id/kpi-targets`
- `GET /api/departments/rankings`
- `GET /api/departments/:id/ranking-evidence`
- `GET /api/departments/:id/research-collaborations`
- `POST /api/research-collaborations`
- `GET /api/departments/:id/outcomes/export`

### Admin and CMS

Responsibilities:
- Activity logs
- Advertisement banners
- API client management
- Asset library
- Backup and restore checks
- CMS pages
- Data exports
- Email templates
- FAQ
- Monitoring
- Notifications
- Partners
- Popups
- Security policies
- SEO
- Success stories

Core endpoints:
- `GET /api/admin/activity-logs`
- `GET /api/admin/ads`
- `POST /api/admin/ads`
- `GET /api/admin/api-clients`
- `POST /api/admin/api-keys/rotate`
- `GET /api/admin/assets`
- `POST /api/admin/assets/upload`
- `GET /api/admin/backups`
- `POST /api/admin/backups/:id/restore-test`
- `GET /api/admin/cms/pages`
- `PATCH /api/admin/cms/pages/:id`
- `POST /api/admin/exports`
- `GET /api/admin/exports/:id/download`
- `GET /api/admin/email-templates`
- `PATCH /api/admin/email-templates/:id`
- `GET /api/admin/faqs`
- `POST /api/admin/faqs`
- `GET /api/admin/health`
- `GET /api/admin/queues`
- `POST /api/admin/notifications`
- `GET /api/admin/partners`
- `GET /api/admin/popups`
- `GET /api/admin/security`
- `PATCH /api/admin/security/policies`
- `GET /api/admin/seo`
- `PATCH /api/admin/seo/:slug`
- `GET /api/admin/success-stories`
- `PATCH /api/admin/success-stories/:id/status`

## Suggested Database Tables

Core identity:
- `users`
- `roles`
- `permissions`
- `role_permissions`
- `sessions`
- `login_history`
- `activity_logs`

Academic and alumni:
- `graduates`
- `academic_histories`
- `graduation_batches`
- `batch_import_rows`
- `clearance_records`
- `certificate_verifications`
- `transcript_requests`
- `alumni_profiles`
- `alumni_migrations`

Employer:
- `employers`
- `company_profiles`
- `jobs`
- `bulk_job_imports`
- `applications`
- `candidate_matches`
- `talent_pools`
- `talent_pool_members`
- `campus_events`
- `internships`
- `job_fairs`
- `verification_requests`

Department and analytics:
- `departments`
- `graduate_outcomes`
- `curriculum_reviews`
- `curriculum_evidence`
- `department_kpis`
- `department_rankings`
- `research_collaborations`
- `skill_gap_reports`
- `employer_feedback`
- `tracer_surveys`
- `tracer_responses`

Admin and CMS:
- `cms_pages`
- `digital_assets`
- `advertisements`
- `email_templates`
- `faqs`
- `notifications`
- `notification_campaigns`
- `partners`
- `popups`
- `seo_settings`
- `success_stories`
- `api_clients`
- `api_keys`
- `backups`
- `data_exports`

## Event Names Used by Frontend Contracts

The frontend module catalog documents event names that the backend should eventually emit through logs, queues, or websocket notifications:

- `curriculum.review.created`
- `curriculum.evidence.attached`
- `outcomes.snapshot.created`
- `tracer.response.ingested`
- `kpi.threshold.crossed`
- `ranking.snapshot.generated`
- `candidate.match.generated`
- `candidate.shortlisted`
- `jobs.bulk.imported`
- `campus.event.created`
- `internship.feedback.submitted`
- `verification.completed`
- `batch.imported`
- `batch.approved`
- `migration.started`
- `alumni.activation.created`
- `audit.log.created`
- `backup.completed`
- `export.completed`
- `notification.sent`
- `security.alert.created`

## Security Requirements

- Every protected endpoint must require JWT authentication.
- Every module endpoint must check role permissions.
- Registrar academic endpoints must be restricted to registrar, admin, and explicitly approved verification flows.
- Exports containing personal data must create an activity log entry.
- File uploads must validate MIME type, size, extension, and ownership.
- Passwords must be hashed with bcrypt or argon2.
- Refresh tokens should be stored hashed and revocable.
- Admin and registrar roles should support MFA.

## Response Shape

Use a consistent API envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Error shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

## Frontend Integration Notes

- The frontend API client is `frontend/src/app/apiClient.ts`.
- Set `VITE_API_URL=http://localhost:4000/api` in `frontend/.env`.
- Replace current mock services incrementally by moving each service function to `apiClient`.
- Keep the mock data until backend parity is complete so the UI remains demoable.
- The module endpoint list is centralized in `frontend/src/app/moduleCatalog.ts`.

## Suggested Build Order

1. Auth, users, roles, and protected route parity.
2. Registrar graduate records, batch import, and activation.
3. Alumni profile and tracer surveys.
4. Employer jobs, applications, and talent search.
5. Department analytics and exports.
6. Admin CMS, notifications, logs, backups, and monitoring.
7. Websocket or queued event notifications.
8. OpenAPI docs and integration tests.

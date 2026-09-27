# ASTU-AMS: University-Wide Digital Alumni Ecosystem

ASTU Alumni Management System (ASTU-AMS) is an enterprise-style platform designed to connect Alumni, Registrar Office, Employers, Departments, University Management, and Accreditation Agencies in one centralized system.

## 1. Vision and Core Outcome

ASTU-AMS is built to automatically answer high-impact university questions:

- Where are graduates working?
- How long does it take graduates to get jobs?
- Which departments perform best?
- Which skills are missing in the current curriculum?
- Which companies hire ASTU graduates most?
- Is the curriculum aligned with industry demand?
- Can ASTU demonstrate employability outcomes for accreditation?

## 2. High-Level Architecture

```text
Registrar Office (Student DB)
        |
   Data Sync/API or Excel Import
        v
+------------------------------------------+
|              ASTU-AMS Backend            |
|------------------------------------------|
| Auth Service                             |
| Alumni Service                           |
| Tracer Study Engine                      |
| Job Board Service                        |
| Employer Feedback Service                |
| Analytics Engine                         |
| Notification Service                     |
| Admin Management                         |
+-------------------+----------------------+
                    |
              REST APIs (JWT)
                    |
                    v
+------------------------------------------+
|             React Frontend               |
|------------------------------------------|
| Alumni Portal                            |
| Registrar Portal                         |
| Employer Portal                          |
| Department Head Portal                   |
| Admin Portal                             |
+-------------------+----------------------+
                    |
                    v
             PostgreSQL Database
```

## 3. Core Actors

- Alumni
- Registrar Office
- Employers
- Department Heads
- System Admin

Each actor has role-based access and sees only their permitted modules.

## 4. Technology Stack

### Frontend
- React + TypeScript
- Vite
- Redux Toolkit (state management)
- Recharts / Chart.js (analytics visualizations)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- JWT authentication + RBAC authorization
- Node-cron for scheduled jobs

### Database and Storage
- PostgreSQL
- Local or cloud object storage for files (CV, profile image, Excel imports, documents)

### Platform Services
- Email notifications
- In-app notifications
- API documentation with Swagger/OpenAPI

## 5. Monorepo/Project Structure

```text
ASTU-AMS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── core/                # Shared infrastructure (middleware, utils, config)
│   │   ├── modules/             # Feature modules (Clean Architecture)
│   │   │   ├── alumni/
│   │   │   ├── analytics/
│   │   │   ├── audit/
│   │   │   ├── auth/
│   │   │   ├── department/
│   │   │   ├── documents/
│   │   │   ├── employer/
│   │   │   ├── notifications/
│   │   │   ├── registrar/
│   │   │   └── surveys/
│   │   ├── app.ts               # Express app setup
│   │   └── server.ts            # Entry point
│   ├── architecture.md          # Detailed backend architecture docs
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── frontend/                    # (Planned React/Vite App)
└── README.md
```

## 6. Portal Design (Role-Based)

### 6.1 Alumni Portal
Key modules:
- Dashboard (profile completion, survey status, job matches, notifications)
- My Profile
- Career Information
- Tracer Surveys
- Jobs and Internships
- Mentorship
- Events
- Document Requests
- Settings

### 6.2 Registrar Portal
Key modules:
- Graduate Records
- Import Data (CSV/Excel)
- Verification
- Document Requests
- Reports

### 6.3 Employer Portal
Key modules:
- Post Jobs
- Applications
- Talent Search
- Graduate Feedback
- Company Profile

### 6.4 Department Head Portal
Key modules:
- Employment Analytics
- Skill Gap Reports
- Employer Feedback Reports
- Tracer Reports
- Curriculum Insights
- Export Reports

### 6.5 Admin Portal
Key modules:
- User and Role Management
- Survey Management
- Jobs Management
- Notifications
- Logs
- Settings
- Backup and Security Controls

## 7. Core Functional Modules

1. Authentication and Authorization (JWT + RBAC)
2. Registrar Integration (Excel-first import pipeline)
3. Alumni Profile Management
4. Tracer Study Engine (6, 12, 24 month lifecycle)
5. Employer Feedback and Competency Ratings
6. Job Board and Application Tracking
7. Analytics and Reporting
8. Notification Service (email + in-app)
9. Document Request Workflow

## 8. Getting Real Data In (Registrar Import)

This project publishes placement, salary and tracer figures, so it must never
contain invented people. The database is provisioned with **structure only** —
no demo alumni, employers or jobs — and real records are loaded explicitly.

### 8.1 Bootstrap (runs automatically with `prisma migrate dev`)

`prisma/seed.ts` creates only what a real deployment needs:

- the four ASTU departments (`SWE`, `MEG`, `ECE`, `CVE`)
- the first super-admin account

The admin password comes from `BOOTSTRAP_ADMIN_PASSWORD`. If that variable is
unset a strong random password is generated and printed **once** — there is no
shared hardcoded password in version control.

```bash
export BOOTSTRAP_ADMIN_EMAIL="admin@astust.edu.et"
export BOOTSTRAP_ADMIN_PASSWORD="choose-a-long-unique-password"
npx prisma migrate deploy     # schema + structure
npm run prisma:seed           # departments + first admin
```

Re-running the seed is safe: it never overwrites an existing admin and never
deletes data.

### 8.2 Importing real records (CSV or Excel)

```bash
# 1. Always dry-run first. Nothing is written.
npm run import:csv -- --file ./exports/alumni.xlsx --type alumni

# 2. Review the report, fix the file, then commit.
npm run import:csv -- --file ./exports/alumni.xlsx --type alumni --commit

# Or import only the rows that pass validation.
npm run import:csv -- --file ./exports/alumni.xlsx --type alumni --commit --skip-invalid
```

Supported `--type`: `alumni`, `employers`, `jobs`. `.csv`, `.xlsx` and `.xls`
are all accepted.

The importer:

- **auto-maps columns** through an alias table, so `Student ID`, `student_id`
  and `Registration No` all resolve to `studentId`. Override with
  `--mapping '{"Your Header":"studentId"}'`.
- **validates every row** and reports the spreadsheet row number for each
  rejection (blank required fields, unparseable numbers, unknown departments,
  duplicate student IDs both within the file and against the database).
- **refuses to write** while any row is rejected unless `--skip-invalid` is
  given. Re-running a file is safe: already-imported IDs are reported rather
  than duplicated.
- **never invents an employment status.** A blank or unrecognised cell becomes
  `UNSPECIFIED` ("Status not reported"), which is excluded from the
  unemployment rate. Free text is normalised, and the substring trap is handled
  correctly: `"unemployed"` contains `"employed"`, so negative answers are
  matched first.
- **imports employers with a random password**, so employer accounts must use
  "forgot password" to sign in.

New profiles default to `employmentStatus = UNSPECIFIED`. Only a graduate
explicitly recorded as `UNEMPLOYED` counts as unemployed.

### 8.3 Demo data (local sandbox only)

The old demo dataset — fabricated alumni, employers and jobs — is preserved in
`prisma/seed-demo.ts` and is never automatic:

```bash
npm run prisma:seed:demo    # opt-in; do not run against a reported database
```

### 8.4 Local development without PostgreSQL

If `DATABASE_URL` is unset the backend falls back to an in-memory JSON store at
`backend/data/dev-db.json`. That file is a per-developer artifact: it is
git-ignored, starts empty, and is never a source of truth. Tests always use the
in-memory store, so `npm test` can never mutate a real database.

## 9. Backend Clean Architecture

The backend strictly follows a Vertical Slice / Feature-based Clean Architecture, where each module is fully self-contained across 4 layers:

- **Domain Layer (`domain/`)**: Pure TypeScript entities and custom error classes. No framework dependencies.
- **Application Layer (`application/`)**: Repository interfaces (ports) and pure business logic (use cases).
- **Infrastructure Layer (`infrastructure/`)**: Prisma implementations of the repository interfaces.
- **Presentation Layer (`presentation/`)**: Express controllers, Zod validation, and routes.

Example module layout:

```text
src/modules/employer/
├── domain/
│   ├── entities/Employer.ts
│   └── errors/EmployerErrors.ts
├── application/
│   ├── ports/IJobRepository.ts
│   └── use-cases/ManageJobs.ts
├── infrastructure/
│   └── repositories/PrismaJobRepository.ts
├── presentation/
│   ├── employer.controller.ts
│   ├── employer.routes.ts
│   └── employer.validation.ts
└── tests/
    └── application/use-cases/ManageJobs.test.ts
```

## 10. Database Design (Core Tables)

- users
- roles
- permissions
- alumni_profiles
- departments
- employers
- jobs
- applications
- surveys
- survey_questions
- survey_responses
- notifications
- events
- audit_logs
- document_requests

### Key Relationships
- User -> Alumni Profile
- User -> Survey Responses
- User -> Applications
- Employer -> Jobs
- Employer -> Feedback
- Department -> Alumni Profiles

## 11. API Surface (Sample)

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Alumni
- `GET /api/alumni/me`
- `PUT /api/alumni/me`

### Jobs
- `GET /api/jobs`
- `GET /api/jobs/:id`

### Registrar
- `POST /api/registrar/import` (multipart upload)
- `GET /api/registrar/verify/:studentId`
- `GET /api/registrar/logs`
- `GET /api/registrar/students/:studentId`

> The HTTP upload endpoint and the section 8 importer are separate paths. For
> audited, reviewable bulk loading prefer the importer, which dry-runs and
> reports rejected rows.

### Surveys
- `GET /api/surveys`
- `POST /api/surveys/submit`

### Analytics
- `GET /api/analytics/employment`
- `GET /api/analytics/skills`

## 12. Tracer Study Automation

Scheduled lifecycle:
- 6-month survey trigger
- 12-month survey trigger
- 24-month survey trigger

Automation jobs:
- survey dispatch
- reminder notifications
- periodic reporting generation
- expired job cleanup

## 13. Analytics and Decision Intelligence

The analytics engine should generate:
- Employment rate by department
- Average time-to-hire
- Salary distribution
- Top hiring companies
- Industry distribution
- Skill gap and curriculum alignment insights

## 14. Security and Compliance

- Password hashing with bcrypt
- JWT access + refresh token strategy
- Helmet and secure HTTP headers
- Rate limiting
- CORS controls
- Input validation and sanitization
- Audit logging for traceability

## 15. DevOps and Delivery

Suggested deployment model:
- Frontend: Vercel
- Backend: Render, Railway, or VPS
- Database: PostgreSQL

Engineering standards:
- Branching: `main`, `develop`, `feature/*`, `bugfix/*`
- Conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `docs:`
- API docs: Swagger/OpenAPI
- Testing: Jest + Supertest

## 16. Future Expansion

Potential service splits:
- Notification microservice
- Analytics microservice
- Recommendation engine
- AI employability prediction

Future integrations:
- ERP/SIS APIs
- LinkedIn API
- SMS gateway
- OAuth (Google)
- National payment or verification services

## 17. Project Status

The backend is **fully implemented, tested, and complete**. All 11 initial milestones and core feature modules have been delivered using strictly typed Test-Driven Development (TDD) and Clean Architecture.

Features completed:
1. Auth + RBAC (JWT)
2. Registrar module (data import and verification)
3. Alumni profile management
4. Job board, applications, and Employer profiles
5. Department Head insights
6. Tracer studies and Survey engine
7. Advanced Analytics and statistics aggregation
8. Document Request workflow
9. In-app Notifications
10. Security Audit Trail (Admin only view & purge)

For a complete breakdown of the backend architecture, see `backend/architecture.md`.

---

Prepared for ASTU STEM initiative as a production-oriented architecture blueprint for ASTU Alumni Management System.

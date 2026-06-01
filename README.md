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

## 8. Registrar Data Import (Recommended MVP)

### Import Strategy
Use **CSV/Excel upload** first (practical for student project delivery).

### Import Pipeline
```text
Registrar Excel File
      -> Data Validation
      -> Duplicate Detection
      -> Error Reporting
      -> Persist to Database
      -> Auto-create Alumni Accounts
      -> Send Activation Notices
```

### Expected Columns
- Student ID
- Full Name
- Department
- Graduation Year
- Email
- Phone
- CGPA

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
- `GET /api/alumni/jobs`

### Registrar
- `POST /api/registrar/import`
- `GET /api/registrar/graduates`

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

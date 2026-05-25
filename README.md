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
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── styles/
│   │   ├── config/
│   │   ├── middleware/
│   │   └── main.tsx
│   ├── .env
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── alumni/
│   │   │   ├── registrar/
│   │   │   ├── employers/
│   │   │   ├── jobs/
│   │   │   ├── surveys/
│   │   │   ├── analytics/
│   │   │   ├── notifications/
│   │   │   └── departments/
│   │   ├── common/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── jobs/
│   │   ├── events/
│   │   ├── database/
│   │   ├── interfaces/
│   │   ├── types/
│   │   ├── validators/
│   │   ├── docs/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   ├── uploads/
│   │   ├── cvs/
│   │   ├── profiles/
│   │   ├── excel/
│   │   └── documents/
│   ├── tests/
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
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

## 9. Backend Layered Architecture

- Controller Layer: request handling, validation, response formatting
- Service Layer: business logic and workflow orchestration
- Repository Layer: database access via Prisma

Example module layout:

```text
modules/alumni/
├── alumni.controller.ts
├── alumni.service.ts
├── alumni.repository.ts
├── alumni.routes.ts
├── alumni.validation.ts
├── alumni.types.ts
└── alumni.constants.ts
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

This repository currently contains the foundational architecture documentation. Implementation can proceed module-by-module, starting with:

1. Auth + RBAC
2. Registrar Excel import
3. Alumni profile and tracer surveys
4. Job board and employer feedback
5. Analytics dashboard

---

Prepared for ASTU STEM initiative as a production-oriented architecture blueprint for ASTU Alumni Management System.

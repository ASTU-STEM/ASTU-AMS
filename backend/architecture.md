# ASTU Alumni Management System — Backend Architecture

> **Pattern**: Vertical Slice / Feature-based Clean Architecture  
> **Methodology**: Test-Driven Development (TDD)  
> **Stack**: Node.js · Express · TypeScript · Prisma · PostgreSQL · Jest · Zod

---

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [Root Directory](#root-directory)
- [Source Code (`src/`)](#source-code-src)
  - [Entry Points](#entry-points)
  - [Core (`src/core/`)](#core-srccore)
  - [Modules (`src/modules/`)](#modules-srcmodules)
- [Module Internal Architecture](#module-internal-architecture)
  - [Domain Layer](#1-domain-layer)
  - [Application Layer](#2-application-layer)
  - [Infrastructure Layer](#3-infrastructure-layer)
  - [Presentation Layer](#4-presentation-layer)
  - [Tests](#5-tests)
- [Data Flow](#data-flow)
- [Database (`prisma/`)](#database-prisma)
- [Module Registry](#module-registry)
- [Testing Strategy](#testing-strategy)

---

## High-Level Overview

```
backend/
├── prisma/                    # Database schema & migrations
├── src/
│   ├── core/                  # Shared infrastructure (framework-level)
│   ├── modules/               # Feature modules (business-level)
│   ├── app.ts                 # Express application bootstrap
│   └── server.ts              # HTTP server entry point
├── dist/                      # Compiled JavaScript output
├── uploads/                   # File upload destination (resumes, imports)
├── logs/                      # Application log files
├── data/                      # Static seed data
├── tests/                     # Legacy/integration test directory
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript compiler configuration
└── jest.config.js             # Jest test runner configuration
```

---

## Root Directory

| File/Folder | Purpose |
|---|---|
| `package.json` | Project metadata, dependencies (`express`, `prisma`, `zod`, `jsonwebtoken`, `bcryptjs`, `multer`, etc.), and npm scripts (`dev`, `build`, `test`). |
| `tsconfig.json` | TypeScript configuration. Targets ES2020, uses strict mode, outputs to `dist/`. |
| `jest.config.js` | Jest configuration. Uses `ts-jest` preset so tests run directly from `.ts` source files without a separate compilation step. |
| `.gitignore` | Excludes `node_modules/`, `dist/`, `.env`, `uploads/`, and `logs/`. |
| `prisma/` | Contains `schema.prisma` — the single source of truth for the database schema. |
| `dist/` | Auto-generated compiled JavaScript. **Never edit directly.** |
| `uploads/` | Runtime directory where `multer` stores uploaded files (resumes, CSV imports). |
| `logs/` | Application logs written by the Winston logger utility. |
| `data/` | Static seed data or reference files. |

---

## Source Code (`src/`)

### Entry Points

#### `server.ts`
The HTTP server bootstrap. Imports the configured Express `app` from `app.ts`, reads the `PORT` from environment variables, and calls `app.listen()`. This is the process entry point (`npm run dev` or `node dist/server.js`).

#### `app.ts`
The Express application factory. Responsible for:
1. **Initializing Express** and attaching the JSON body parser.
2. **Configuring CORS** for cross-origin frontend requests.
3. **Mounting the global error handler** (`error.middleware.ts`).
4. **Registering all module routers** — each feature module exports a router that gets mounted here under its `/api/<module>` prefix.
5. **Health check endpoint** at `GET /health`.

```
Currently mounted routes:
  /api/auth            → Auth Module
  /api/alumni          → Alumni Module
  /api/registrar       → Registrar Module
  /api/employer        → Employer Module (includes Jobs & Applications)
  /api/departments     → Department Head Module
  /api/surveys         → Tracer Study / Surveys Module
  /api/analytics       → Analytics Module
  /api/documents       → Documents Module
  /api/notifications   → Notifications Module
```

---

### Core (`src/core/`)

The `core/` directory contains **framework-level shared infrastructure** that is used across all feature modules. It has **zero business logic** — only technical plumbing.

```
src/core/
├── config/
│   ├── db.ts              # Prisma client singleton
│   └── env.ts             # Environment variable validation (Zod)
├── errors/
│   └── ApiError.ts        # Base error class with HTTP status codes
├── middleware/
│   ├── auth.middleware.ts  # JWT authentication guard
│   ├── role.middleware.ts  # Role-based access control (RBAC)
│   └── error.middleware.ts # Global error handler (catches all thrown errors)
├── types/                  # Shared TypeScript type declarations
└── utils/
    ├── asyncHandler.ts     # Express async/await error wrapper
    ├── jwt.utils.ts        # JWT token generation & verification
    ├── logger.utils.ts     # Winston logger configuration
    └── response.utils.ts   # Standardized API response helpers (sendSuccess, sendError)
```

#### `config/db.ts`
Exports a **singleton** `PrismaClient` instance. Every repository across every module imports this single client to interact with the PostgreSQL database. This ensures connection pooling is managed centrally.

#### `config/env.ts`
Uses **Zod** to validate and parse environment variables at startup. If required variables like `DATABASE_URL`, `JWT_ACCESS_SECRET`, or `JWT_REFRESH_SECRET` are missing, the application terminates immediately with a descriptive error.

#### `errors/ApiError.ts`
A base `ApiError` class extending `Error` with an HTTP `statusCode` property. All domain-specific error classes (e.g., `AlumniNotFoundError`, `JobNotFoundError`) follow this pattern, allowing the global error middleware to extract the correct status code automatically.

#### `middleware/auth.middleware.ts`
Extracts the JWT `Bearer` token from the `Authorization` header, verifies it using `jwt.utils.ts`, and attaches the decoded user payload (`userId`, `role`) to `req.user`. If the token is missing or invalid, it responds with `401 Unauthorized`.

#### `middleware/role.middleware.ts`
A higher-order middleware factory: `requireRoles([Role.ADMIN, Role.REGISTRAR])`. It reads `req.user.role` (set by the auth middleware) and returns `403 Forbidden` if the user's role is not in the allowed list.

#### `middleware/error.middleware.ts`
The **global catch-all** error handler. It intercepts any error thrown or passed via `next(err)` from controllers, extracts the status code (defaulting to 500), and returns a standardized JSON error response. It also handles Zod validation errors and Prisma-specific errors gracefully.

#### `utils/asyncHandler.ts`
A tiny wrapper that catches rejected promises in Express route handlers and forwards them to `next()`. Without this, unhandled async errors would crash the server.

#### `utils/response.utils.ts`
Provides `sendSuccess(res, message, data, statusCode)` and `sendError(res, message, error, statusCode)` to ensure every API response has a consistent JSON shape:
```json
{ "success": true, "message": "...", "data": { ... } }
```

---

### Modules (`src/modules/`)

The `modules/` directory is the heart of the application. Each subdirectory represents a **bounded context** — a self-contained vertical slice of the application that owns its own domain logic, data access, and HTTP endpoints.

```
src/modules/
├── alumni/           # Alumni profile management, work experience, file uploads
├── analytics/        # Data aggregation: employment rates, skill gaps, department metrics
├── auth/             # Authentication: login, register, activation, logout
├── department/       # Department head dashboard: stats and alumni lists per department
├── documents/        # Document requests: transcripts, degree verifications
├── employer/         # Employer profiles, job postings, job applications
├── notifications/    # In-app notifications: send, read, mark-all-read
├── registrar/        # Graduate data import, student verification, alumni status
└── surveys/          # Tracer studies: survey creation, response submission
```

> **Note**: Some legacy empty directories (`notification/`, `tracer-study/`) may exist from earlier scaffolding but are not actively used. The canonical modules are listed above.

---

## Module Internal Architecture — Deep Dive

Every feature module follows an **identical 4-layer structure** inspired by Clean Architecture (Robert C. Martin) and Hexagonal Architecture (Alistair Cockburn). If you understand how **one** module works, you understand **all** of them.

### Why This Structure?

Imagine you're building a house. You wouldn't mix your plumbing pipes inside your walls without any separation — if a pipe bursts, you'd have to tear down the wall. Software works the same way. By separating our code into layers with strict rules about who can talk to whom, we can:

- **Swap the database** from PostgreSQL to MongoDB without rewriting business logic.
- **Test business rules** without needing a running database or HTTP server.
- **Replace Express** with Fastify or any other framework without touching domain logic.
- **Onboard new developers** quickly because every module looks the same.

### The 4 Layers at a Glance

```
src/modules/<module>/
│
├── domain/                        # 🧠 Layer 1: THE BRAIN
│   ├── entities/                  #    "What things ARE" — pure data shapes
│   └── errors/                    #    "What can go WRONG" — business rule violations
│
├── application/                   # 🎯 Layer 2: THE COORDINATOR
│   ├── ports/                     #    "What I NEED" — abstract interfaces
│   ├── use-cases/                 #    "What to DO" — business logic orchestration
│   └── dto/                       #    "What shape data takes" — transfer objects
│
├── infrastructure/                # 🔌 Layer 3: THE PLUGS
│   ├── repositories/              #    "HOW to get data" — Prisma implementations
│   ├── services/                  #    "HOW to call external APIs" — 3rd party integrations
│   └── storage/                   #    "HOW to store files" — file system adapters
│
├── presentation/                  # 🌐 Layer 4: THE FRONT DOOR
│   ├── <module>.validation.ts     #    "Is this request valid?" — Zod schemas
│   ├── <module>.controller.ts     #    "Handle this HTTP request" — Express handlers
│   └── <module>.routes.ts         #    "Which URL maps to what?" — route definitions
│
└── tests/                         # 🧪 TESTS
    └── application/
        └── use-cases/             #    Unit tests with mocked dependencies
            └── <UseCaseName>.test.ts
```

### The Golden Rule: The Dependency Rule

```
  Outer layers CAN import from inner layers.
  Inner layers CANNOT import from outer layers.
  
  presentation/ → can import from → application/, infrastructure/, domain/
  infrastructure/ → can import from → application/, domain/
  application/ → can import from → domain/
  domain/ → imports from → NOTHING
```

This means if you delete the entire `presentation/` folder, the business logic still compiles. If you delete the entire `infrastructure/` folder, the use cases still compile. The **domain** is the most stable, independent core.

---

### 1. Domain Layer — `domain/`

> **Analogy**: The domain layer is like the **rulebook of a board game**. It defines what pieces exist (entities) and what illegal moves look like (errors). The rulebook doesn't care whether you're playing on a wooden board or a phone app — the rules are the same.

**Location**: `<module>/domain/`  
**Depends on**: Nothing. Zero imports. Pure TypeScript.

```
domain/
├── entities/          # What things ARE
│   └── Employer.ts    # EmployerProfile, Job, JobApplication classes
└── errors/            # What can go WRONG
    └── EmployerErrors.ts  # EmployerNotFoundError, JobNotFoundError, etc.
```

#### `entities/` — What Things ARE

Entities are **plain TypeScript classes** that represent your business objects. They have **no behavior** in our implementation — they're pure data containers. They intentionally mirror the database models but are defined independently so your business logic never depends on Prisma's generated types.

**Real example** from the Employer module (`domain/entities/Employer.ts`):

```typescript
export class EmployerProfile {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly companyName: string,
    public readonly industry: string,
    public readonly location: string,
    public readonly hrContact: string,
    public readonly website: string | null,
    public readonly logoUrl: string | null,
    public readonly isVerified: boolean
  ) {}
}

export class Job {
  constructor(
    public readonly id: string,
    public readonly employerId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly location: string,
    public readonly employmentType: string,    // "FULL_TIME", "PART_TIME", etc.
    public readonly experienceRequired: number,
    public readonly skillsRequired: string[],
    public readonly deadline: Date,
    public readonly salary: string | null,
    public readonly isActive: boolean
  ) {}
}

export class JobApplication {
  constructor(
    public readonly id: string,
    public readonly jobId: string,
    public readonly alumniId: string,
    public readonly status: string,            // "PENDING", "SHORTLISTED", etc.
    public readonly resumeUrl: string | null,
    public readonly coverLetter: string | null
  ) {}
}
```

**Key design decisions**:
- All properties are `readonly` — entities are **immutable**. You don't mutate them; you create new ones.
- No `import` statements at all — these classes know nothing about databases, HTTP, or frameworks.
- Nullable fields use `string | null` explicitly rather than `?:` to match the database schema precisely.
- Related entities (e.g., `Job` and `JobApplication`) that share a bounded context live in the **same file**. This is intentional — they belong to the same business concept.

**Why not just use Prisma's types directly?** Because if you ever switch from Prisma to TypeORM, Drizzle, or raw SQL, your entire business logic would break. By defining our own entities, the domain layer is **database-agnostic**.

#### `errors/` — What Can Go WRONG

Every module defines its own error classes. These are **not HTTP errors** — they're **business rule violations**. The fact that they carry an HTTP status code is a convenience for the error middleware, but conceptually they represent domain-level problems.

**Real example** from the Employer module (`domain/errors/EmployerErrors.ts`):

```typescript
export class EmployerError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'EmployerError';
    Object.setPrototypeOf(this, EmployerError.prototype);
  }
}

export class EmployerNotFoundError extends EmployerError {
  constructor() {
    super('Employer profile not found', 404);
    Object.setPrototypeOf(this, EmployerNotFoundError.prototype);
  }
}

export class JobNotFoundError extends EmployerError {
  constructor() {
    super('Job posting not found', 404);
    Object.setPrototypeOf(this, JobNotFoundError.prototype);
  }
}

export class UnauthorizedEmployerActionError extends EmployerError {
  constructor(message: string = 'You do not have permission to modify this resource') {
    super(message, 403);
    Object.setPrototypeOf(this, UnauthorizedEmployerActionError.prototype);
  }
}

export class JobApplicationError extends EmployerError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, JobApplicationError.prototype);
  }
}
```

**The inheritance pattern**: Each module has a base error class (e.g., `EmployerError`) that all specific errors extend. This lets you catch all employer-related errors with a single `catch` if needed.

**Why `Object.setPrototypeOf`?** This is a TypeScript quirk. When extending built-in classes like `Error`, the prototype chain can break. This line fixes `instanceof` checks so `catch (e) { if (e instanceof JobNotFoundError) }` works correctly.

**Complete list of errors per module:**

| Module | Error Classes |
|---|---|
| Alumni | `AlumniNotFoundError` (404) |
| Employer | `EmployerNotFoundError` (404), `JobNotFoundError` (404), `UnauthorizedEmployerActionError` (403), `JobApplicationError` (400) |
| Registrar | `GraduateNotFoundError` (404), `InvalidFileFormatError` (400), `AlumniStatusUpdateError` (400) |
| Department | `DepartmentNotFoundError` (404), `UnauthorizedDepartmentActionError` (403) |
| Surveys | `SurveyNotFoundError` (404), `DuplicateSurveyResponseError` (409), `InactiveSurveyError` (403) |
| Documents | `DocumentNotFoundError` (404), `DuplicateDocumentRequestError` (409) |
| Notifications | `NotificationNotFoundError` (404) |
| Analytics | `AnalyticsDataNotAvailableError` (503) |

---

### 2. Application Layer — `application/`

> **Analogy**: The application layer is like a **restaurant manager**. The manager knows WHAT needs to happen ("take the customer's order, send it to the kitchen, bring the food back") but doesn't know HOW the kitchen actually cooks ("use oven at 350°F for 20 minutes"). The manager works through **abstractions** — they just say "make this dish" and trust the kitchen to handle it.

**Location**: `<module>/application/`  
**Depends on**: Only `domain/` (entities and errors). Never imports Prisma, Express, or anything concrete.

```
application/
├── ports/             # "What I NEED" — interfaces/contracts
│   ├── IJobRepository.ts
│   ├── IEmployerProfileRepository.ts
│   └── IJobApplicationRepository.ts
├── use-cases/         # "What to DO" — business logic
│   ├── ManageJobs.ts           # CreateJob, UpdateJob, DeleteJob
│   ├── ManageEmployerProfile.ts # GetEmployerProfile, UpdateEmployerProfile
│   └── ManageJobApplications.ts # ApplyForJob, UpdateApplicationStatus
└── dto/               # Data Transfer Objects (optional, used in some modules)
```

#### `ports/` — The Contracts (What I Need)

Ports are **TypeScript interfaces** — they define what data operations a use case needs without specifying how those operations are performed. Think of them as a **menu** that says "we serve pizza, pasta, and salad" without specifying the recipe.

**Real example** from `application/ports/IJobRepository.ts`:

```typescript
import { Job } from '../../domain/entities/Employer';

export interface IJobRepository {
  findById(jobId: string): Promise<Job | null>;
  findByEmployerId(employerId: string): Promise<Job[]>;
  search(criteria: any): Promise<Job[]>;
  create(data: Omit<Job, 'id'>): Promise<Job>;
  update(jobId: string, data: Partial<Job>): Promise<Job>;
  delete(jobId: string): Promise<void>;
}
```

**Key things to notice**:
- The import points **inward** to `domain/entities/` — never outward.
- Return types use domain entities (`Job`), not Prisma types.
- `Omit<Job, 'id'>` means "everything in a Job except the id" — because the database generates the id.
- `Partial<Job>` means "any subset of Job fields" — for partial updates.
- Everything returns `Promise<...>` because data access is always async.

**Why interfaces instead of classes?** Because interfaces have **zero runtime cost** — they're erased during compilation. They exist purely to define a contract. This is what makes testing possible: in tests, you provide a **mock** implementation; in production, you provide the **Prisma** implementation.

Each module typically has 1-3 port files:

| Module | Ports |
|---|---|
| Alumni | `IAlumniProfileRepository` |
| Employer | `IEmployerProfileRepository`, `IJobRepository`, `IJobApplicationRepository` |
| Registrar | `IGraduateRecordRepository`, `ISyncLogRepository`, `IRegistrarAlumniRepository` |
| Department | `IDepartmentRepository`, `IDepartmentHeadRepository`, `IAlumniDepartmentRepository` |
| Surveys | `ISurveyRepository`, `ISurveyResponseRepository` |
| Documents | `IDocumentRequestRepository` |
| Notifications | `INotificationRepository` |
| Analytics | `IAnalyticsRepository` |

#### `use-cases/` — The Business Logic (What to Do)

Use cases are **the most important code in the entire system**. They contain the actual business rules — the logic that makes this application specifically an "Alumni Management System" rather than a generic CRUD app.

Each use case is a **class with a single public `execute()` method**. It receives repository interfaces through its constructor (this is called **Dependency Injection**), and orchestrates the business logic by calling methods on those interfaces.

**Real example** — Creating a Job (from `application/use-cases/ManageJobs.ts`):

```typescript
import { IJobRepository } from '../ports/IJobRepository';
import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import { EmployerNotFoundError, JobNotFoundError, UnauthorizedEmployerActionError } 
  from '../../domain/errors/EmployerErrors';

// USE CASE 1: Create a new job posting
export class CreateJob {
  // Step 1: Receive dependencies through the constructor (Dependency Injection)
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  // Step 2: The single public method that executes the business logic
  async execute(userId: string, data: any) {
    // Business Rule: Only users with an employer profile can create jobs
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) {
      throw new EmployerNotFoundError();
    }

    // Business Rule: The job is automatically linked to the employer
    // and starts as active
    const job = await this.jobRepo.create({
      employerId: employer.id,
      ...data,
      isActive: true,
      deadline: data.deadline ? new Date(data.deadline) : new Date(),
    });

    return job;
  }
}

// USE CASE 2: Update an existing job
export class UpdateJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string, data: any) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    // Business Rule: An employer can ONLY update their OWN jobs
    // This is a critical security check — without it, Employer A
    // could edit Employer B's job postings!
    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only update your own jobs.');
    }

    const updated = await this.jobRepo.update(jobId, data);
    return updated;
  }
}

// USE CASE 3: Delete a job
export class DeleteJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    // Same ownership check as UpdateJob
    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only delete your own jobs.');
    }

    await this.jobRepo.delete(jobId);
  }
}
```

**Let's trace through `DeleteJob.execute("user123", "job456")` step by step**:

1. The use case calls `this.empRepo.findByUserId("user123")` — it doesn't know if this hits PostgreSQL, MongoDB, or a mock. It just knows it gets back an `EmployerProfile | null`.
2. If `null`, it throws `EmployerNotFoundError` — the user doesn't have an employer profile.
3. It calls `this.jobRepo.findById("job456")` — again, database-agnostic.
4. If `null`, it throws `JobNotFoundError`.
5. **The critical check**: Is `job.employerId === employer.id`? This is a **business rule** — "employers can only delete their own jobs." This is NOT a database constraint — it's application logic.
6. If the check passes, it calls `this.jobRepo.delete("job456")`.

**Another real example** — Preventing duplicate survey submissions (`application/use-cases/SubmitSurveyResponse.ts`):

```typescript
export class SubmitSurveyResponse {
  constructor(
    private readonly surveyRepo: ISurveyRepository,
    private readonly responseRepo: ISurveyResponseRepository
  ) {}

  async execute(surveyId: string, alumniId: string, answers: any[]) {
    // Business Rule 1: The survey must exist
    const survey = await this.surveyRepo.findById(surveyId);
    if (!survey) throw new SurveyNotFoundError();

    // Business Rule 2: The survey must still be active
    if (!survey.isActive) throw new InactiveSurveyError();

    // Business Rule 3: An alumni cannot submit twice for the same survey
    const existing = await this.responseRepo.findByAlumniAndSurvey(alumniId, surveyId);
    if (existing) throw new DuplicateSurveyResponseError();

    // All rules passed — create the response
    const response = await this.responseRepo.create({
      surveyId,
      alumniId,
      answers,
    });

    return response;
  }
}
```

**Notice**: There's no `try/catch` inside use cases. Errors are thrown and bubble up to the presentation layer's error middleware. This keeps use cases clean and focused.

#### `dto/` — Data Transfer Objects (Optional)

Some modules have a `dto/` folder for defining the shape of data that flows between layers. In our codebase, we mostly use inline types or Zod-inferred types instead of dedicated DTO files. This folder exists in the Alumni module for more complex data transformations.

---

### 3. Infrastructure Layer — `infrastructure/`

> **Analogy**: The infrastructure layer is like the **kitchen staff** at the restaurant. The manager (application layer) says "make a pizza." The kitchen staff knows the specific recipe — which oven to use, what temperature, which brand of flour. If you hire new kitchen staff who use a different oven, the manager doesn't care — they still just say "make a pizza."

**Location**: `<module>/infrastructure/`  
**Depends on**: `application/` (implements the port interfaces) and `domain/` (returns domain entities).

```
infrastructure/
├── repositories/      # Database implementations of ports
│   ├── PrismaJobRepository.ts
│   ├── PrismaEmployerProfileRepository.ts
│   └── PrismaJobApplicationRepository.ts
├── services/          # External API integrations (email, SMS, etc.)
└── storage/           # File storage adapters (local disk, S3, etc.)
```

#### `repositories/` — The Database Bridge

This is where **Prisma meets your business logic**. Each repository file is a class that:
1. **Implements** a port interface (e.g., `implements IJobRepository`).
2. **Imports** the Prisma client from `core/config/db.ts`.
3. **Translates** between Prisma's auto-generated types and your domain entities.

**Real example** from `infrastructure/repositories/PrismaJobRepository.ts`:

```typescript
import { IJobRepository } from '../../application/ports/IJobRepository';
import { Job } from '../../domain/entities/Employer';
import prisma from '../../../../core/config/db';

export class PrismaJobRepository implements IJobRepository {
  
  async findById(jobId: string): Promise<Job | null> {
    // Call Prisma to query the PostgreSQL database
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    
    // If no record found, return null (the use case will handle this)
    if (!job) return null;
    
    // Cast Prisma's type to our domain entity
    // This works because our entity fields match the database columns
    return job as any as Job;
  }

  async findByEmployerId(employerId: string): Promise<Job[]> {
    const jobs = await prisma.job.findMany({
      where: { employerId },
      orderBy: { createdAt: 'desc' },  // Most recent first
    });
    return jobs as any as Job[];
  }

  async create(data: Omit<Job, 'id'>): Promise<Job> {
    const created = await prisma.job.create({ data: data as any });
    return created as any as Job;
  }

  async update(jobId: string, data: Partial<Job>): Promise<Job> {
    const updated = await prisma.job.update({
      where: { id: jobId },
      data: data as any,
    });
    return updated as any as Job;
  }

  async delete(jobId: string): Promise<void> {
    await prisma.job.delete({ where: { id: jobId } });
  }
}
```

**Key things to understand**:

1. **`implements IJobRepository`** — This is the magic word. It tells TypeScript "this class promises to have all the methods defined in `IJobRepository`." If you forget a method, TypeScript will give you a compile error.

2. **`import prisma from '../../../../core/config/db'`** — This is the **only place** in the entire module that imports Prisma. The domain doesn't know about Prisma. The use cases don't know about Prisma. Only this infrastructure layer touches it.

3. **`as any as Job`** — This type cast bridges Prisma's auto-generated types to our domain entities. Since we designed our entities to match the database columns, this is safe. In a more complex system, you'd write explicit mapper functions.

4. **Why `../../application/ports/`?** — Because the infrastructure layer implements the application layer's interfaces. The dependency arrow goes **inward** (infrastructure → application → domain).

**A more complex example** — the Surveys module creates nested records in a single transaction (`infrastructure/repositories/PrismaSurveyRepository.ts`):

```typescript
async create(data: Omit<Survey, 'id'>): Promise<Survey> {
  const survey = await prisma.survey.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      isActive: data.isActive,
      // Prisma's "nested create" — creates the survey AND its questions
      // in a single database transaction (all-or-nothing)
      questions: {
        create: data.questions?.map((q: any) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options || [],
          order: q.order,
        })) || []
      }
    },
    include: { questions: true }  // Return the created questions too
  });
  return survey as any as Survey;
}
```

**The Analytics module** shows a different pattern — using Prisma's aggregation features to compute statistics directly in the database (`infrastructure/repositories/PrismaAnalyticsRepository.ts`):

```typescript
async getSkillGapStats(): Promise<SkillGapStats> {
  // Prisma's aggregate() runs SQL AVG() and COUNT() in the database
  // This is much faster than fetching all records and computing in Node.js
  const aggregations = await prisma.employerFeedback.aggregate({
    _avg: {
      technicalSkill: true,
      communicationSkill: true,
      leadershipSkill: true,
      teamworkSkill: true,
      problemSolvingSkill: true,
      innovationSkill: true,
    },
    _count: { id: true },
  });

  return new SkillGapStats(
    aggregations._avg.technicalSkill || 0,
    aggregations._avg.communicationSkill || 0,
    // ... etc
  );
}
```

#### `services/` — External Integrations

Used for third-party API calls (email providers, SMS gateways, etc.). Currently used in the Alumni module for audit logging services. In the future, this is where you'd put an `EmailService` or `SMSService`.

#### `storage/` — File Handling

Used in the Alumni module for handling file uploads (profile photos, resumes). Abstracts the file storage mechanism so you could swap from local disk to AWS S3 without touching business logic.

---

### 4. Presentation Layer — `presentation/`

> **Analogy**: The presentation layer is the **front door and reception desk** of the restaurant. It's what the customer (HTTP client) interacts with. The receptionist checks your reservation (authentication), validates your order (Zod validation), passes it to the manager (use case), and brings back the food (JSON response).

**Location**: `<module>/presentation/`  
**Depends on**: Everything — `application/`, `infrastructure/`, `domain/`. This is the **outermost layer** and the only one that knows about Express.

```
presentation/
├── employer.validation.ts     # Input validation schemas (Zod)
├── employer.controller.ts     # HTTP request handlers
└── employer.routes.ts         # URL routing + middleware
```

#### `*.validation.ts` — The Bouncer (Input Validation)

Every piece of data entering the system from an HTTP request must be validated before it reaches the business logic. We use **Zod** — a TypeScript-first schema validation library — to define exactly what shape the data must have.

**Real example** from `presentation/employer.validation.ts`:

```typescript
import { z } from 'zod';

// Schema for creating or updating a job posting
export const jobSchema = z.object({
  title: z.string().min(2),                    // Must be a string, at least 2 chars
  description: z.string().min(10),             // At least 10 chars
  location: z.string().min(2),
  employmentType: z.enum([                     // Must be one of these exact values
    'FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'
  ]),
  experienceRequired: z.number().min(0),       // Non-negative number
  skillsRequired: z.array(z.string()),         // Array of strings
  deadline: z.preprocess(                      // Auto-convert string dates to Date objects
    (arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    },
    z.date()
  ),
  salary: z.string().optional().nullable(),    // Optional field
});

// Schema for updating application status
export const updateJobStatusSchema = z.object({
  status: z.enum(['PENDING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED']),
});
```

**Why Zod?** Because it:
- Validates AND transforms data in one step.
- Gives excellent error messages automatically (e.g., "Expected string, received number at 'title'").
- Infers TypeScript types from schemas — so you get compile-time type safety AND runtime validation.
- Integrates with our error middleware — Zod errors are caught and formatted automatically.

#### `*.controller.ts` — The Traffic Director (Request Handlers)

The controller is a class of static methods, each handling one HTTP endpoint. It's the **glue** that connects the HTTP world to the business logic world. Every controller method follows the exact same 5-step pattern:

**Real example** from `presentation/employer.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { jobSchema } from './employer.validation';

// Import concrete repositories (infrastructure layer)
import { PrismaEmployerProfileRepository } from '../infrastructure/repositories/PrismaEmployerProfileRepository';
import { PrismaJobRepository } from '../infrastructure/repositories/PrismaJobRepository';

// Import use cases (application layer)
import { CreateJob, UpdateJob, DeleteJob } from '../application/use-cases/ManageJobs';

// Instantiate repositories ONCE (they're stateless singletons)
const empRepo = new PrismaEmployerProfileRepository();
const jobRepo = new PrismaJobRepository();

export class EmployerController {

  // STEP-BY-STEP PATTERN for every controller method:
  static async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      // Step 1: Extract the authenticated user's ID from the JWT token
      //         (attached by auth.middleware.ts)
      const userId = (req as any).user?.userId;

      // Step 2: Validate the request body against the Zod schema
      //         If invalid, Zod throws a ZodError (caught by error middleware)
      const data = jobSchema.parse(req.body);

      // Step 3: Create the use case with injected dependencies
      const useCase = new CreateJob(jobRepo, empRepo);

      // Step 4: Execute the business logic
      const result = await useCase.execute(userId, data);

      // Step 5: Send the standardized success response
      return sendSuccess(res, 'Job created successfully.', result, 201);

    } catch (err) {
      // Any error (Zod, domain error, Prisma error) is forwarded
      // to the global error middleware
      next(err);
    }
  }

  static async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new DeleteJob(jobRepo, empRepo);
      await useCase.execute(userId, req.params.jobId);  // jobId from URL params
      return sendSuccess(res, 'Job deleted successfully.', null);
    } catch (err) { next(err); }
  }
}
```

**Important details**:
- **Repositories are instantiated at module level** (lines with `const empRepo = new ...`), not inside each method. They're stateless — they just wrap Prisma calls — so sharing one instance is safe and efficient.
- **`(req as any).user?.userId`** — The auth middleware attaches the decoded JWT payload to `req.user`. The cast is needed because Express's default `Request` type doesn't know about our custom `user` property.
- **`next(err)`** — This is how Express error handling works. Instead of sending error responses manually, we forward all errors to the global `error.middleware.ts` which formats them consistently.

#### `*.routes.ts` — The URL Map (Routing + Security)

The routes file defines which HTTP method + URL path maps to which controller method, and which middleware guards protect each route.

**Real example** from `presentation/employer.routes.ts`:

```typescript
import { Router } from 'express';
import { EmployerController } from './employer.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/resumes' });
const router = Router();

// ALL routes below require a valid JWT token
router.use(authenticateJWT);

// --- ALUMNI-ONLY ROUTES ---
// Alumni can browse jobs and apply
router.get('/jobs', requireRoles([Role.ALUMNI]),
  asyncHandler(EmployerController.searchJobs));
router.post('/jobs/:jobId/apply', requireRoles([Role.ALUMNI]),
  upload.single('resume'),                    // multer handles file upload
  asyncHandler(EmployerController.applyForJob));

// --- EMPLOYER-ONLY ROUTES ---
// All routes below require EMPLOYER role
router.use(requireRoles([Role.EMPLOYER]));

// Profile management
router.get('/profile', asyncHandler(EmployerController.getProfile));
router.put('/profile', asyncHandler(EmployerController.updateProfile));

// Job CRUD
router.post('/jobs', asyncHandler(EmployerController.createJob));
router.get('/my-jobs', asyncHandler(EmployerController.getMyJobs));
router.put('/jobs/:jobId', asyncHandler(EmployerController.updateJob));
router.delete('/jobs/:jobId', asyncHandler(EmployerController.deleteJob));

// Application management
router.put('/applications/:applicationId/status',
  asyncHandler(EmployerController.updateApplicationStatus));

export default router;
```

**Reading this file tells you everything about the module's API**:
- **Line `router.use(authenticateJWT)`** — Every route in this module requires authentication. No anonymous access.
- **`requireRoles([Role.ALUMNI])`** — Only users with the ALUMNI role can search/apply for jobs.
- **`requireRoles([Role.EMPLOYER])`** — Only employers can manage profiles, create jobs, and review applications.
- **`upload.single('resume')`** — The apply route accepts a file upload via `multipart/form-data`.
- **`asyncHandler(...)`** — Wraps async controller methods so rejected promises are forwarded to `next(err)` instead of crashing.
- **`:jobId` and `:applicationId`** — URL parameters accessible via `req.params.jobId`.

**This routes file is the final piece that gets mounted in `app.ts`**:
```typescript
// In app.ts
import employerRouter from './modules/employer/presentation/employer.routes';
app.use('/api/employer', employerRouter);
```

So `router.post('/jobs', ...)` becomes `POST /api/employer/jobs` in the full URL.

---

### 5. Tests — `tests/`

> **Analogy**: Tests are like a **flight simulator for pilots**. You don't need a real airplane (database) or real passengers (HTTP clients) to verify that the pilot (use case) makes the right decisions. You simulate everything and check the outcomes.

**Location**: `<module>/tests/application/use-cases/`  
**Strategy**: Unit tests with **fully mocked** repository ports.

```
tests/
└── application/
    └── use-cases/
        ├── ManageJobs.test.ts             # Tests for CreateJob, UpdateJob, DeleteJob
        ├── ManageEmployerProfile.test.ts   # Tests for Get/Update profile
        └── ManageJobApplications.test.ts   # Tests for Apply, UpdateStatus
```

#### How a Test Works — Step by Step

**Real example** from `tests/application/use-cases/ManageJobs.test.ts`:

```typescript
import { CreateJob, UpdateJob, DeleteJob } from '../../../application/use-cases/ManageJobs';
import { IJobRepository } from '../../../application/ports/IJobRepository';
import { IEmployerProfileRepository } from '../../../application/ports/IEmployerProfileRepository';
import { EmployerNotFoundError, JobNotFoundError, UnauthorizedEmployerActionError } 
  from '../../../domain/errors/EmployerErrors';
import { EmployerProfile, Job } from '../../../domain/entities/Employer';

describe('ManageJobs Use Cases', () => {

  // STEP 1: Create mock versions of the repository interfaces
  // jest.Mocked<T> creates a version where every method is a jest.fn()
  let mockJobRepo: jest.Mocked<IJobRepository>;
  let mockEmpRepo: jest.Mocked<IEmployerProfileRepository>;
  
  // STEP 2: Create fake data that our mocks will return
  const mockEmp = new EmployerProfile(
    'emp1', 'usr1', 'Tech Corp', 'IT', 'Addis', 'HR', null, null, true
  );
  const mockJob = new Job(
    'job1', 'emp1', 'Developer', 'Build stuff', 'Remote',
    'FULL_TIME', 2, ['JS'], new Date(), null, true
  );

  // STEP 3: Before each test, create fresh mocks (so tests don't interfere)
  beforeEach(() => {
    mockJobRepo = {
      findById: jest.fn(),
      findByEmployerId: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    mockEmpRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
  });

  // STEP 4: Write tests!

  describe('CreateJob', () => {
    it('should create job successfully', async () => {
      // Arrange: Configure mock to return an employer when asked
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockJobRepo.create.mockResolvedValue(mockJob);

      // Act: Run the use case
      const useCase = new CreateJob(mockJobRepo, mockEmpRepo);
      const result = await useCase.execute('usr1', { title: 'Developer' });

      // Assert: Verify the result and that the right methods were called
      expect(result).toEqual(mockJob);
      expect(mockJobRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Developer', employerId: 'emp1' })
      );
    });
  });

  describe('UpdateJob', () => {
    it('should throw UnauthorizedEmployerActionError if not owner', async () => {
      // Arrange: Employer "otherEmp" tries to update a job owned by "emp1"
      mockEmpRepo.findByUserId.mockResolvedValue({ ...mockEmp, id: 'otherEmp' });
      mockJobRepo.findById.mockResolvedValue(mockJob); // Job belongs to 'emp1'

      // Act + Assert: The use case should throw
      const useCase = new UpdateJob(mockJobRepo, mockEmpRepo);
      await expect(
        useCase.execute('usr1', 'job1', {})
      ).rejects.toThrow(UnauthorizedEmployerActionError);
    });
  });

  describe('DeleteJob', () => {
    it('should delete job if owned by employer', async () => {
      // Arrange
      mockEmpRepo.findByUserId.mockResolvedValue(mockEmp);
      mockJobRepo.findById.mockResolvedValue(mockJob);

      // Act
      const useCase = new DeleteJob(mockJobRepo, mockEmpRepo);
      await useCase.execute('usr1', 'job1');

      // Assert: Verify delete was called with the correct ID
      expect(mockJobRepo.delete).toHaveBeenCalledWith('job1');
    });
  });
});
```

**Why this approach is powerful**:

1. **No database needed** — Tests run in milliseconds, not seconds. No PostgreSQL setup, no test database, no migrations.
2. **No HTTP server needed** — We test the business logic directly, not through HTTP requests.
3. **Deterministic** — Mocks return exactly what you tell them to. No flaky tests due to network issues or stale data.
4. **Edge cases are easy** — Want to test what happens when the database is empty? Just mock `findById` to return `null`. Want to test a security violation? Mock the employer to have a different ID.
5. **Refactoring is safe** — If you change how Prisma queries work in the infrastructure layer, these tests still pass because they don't test Prisma — they test business logic.

**The TDD cycle we followed for every module**:

```
1. RED:    Write the test FIRST (it fails because the use case doesn't exist yet)
2. GREEN:  Write the minimum use case code to make the test pass
3. REFACTOR: Clean up the code, add infrastructure and presentation layers
```

---

### Putting It All Together — A Complete Request Trace

Let's trace a real request through every layer: **"Employer deletes a job posting"**

```
CLIENT sends: DELETE /api/employer/jobs/job-uuid-123
Headers: { Authorization: "Bearer eyJhbG..." }
```

**Step 1 — `app.ts`**: Express matches the URL prefix `/api/employer` and forwards to the employer router.

**Step 2 — `employer.routes.ts`**: The `authenticateJWT` middleware runs first:
- Extracts the JWT token from the `Authorization` header.
- Verifies the signature and decodes it.
- Attaches `{ userId: "user-uuid-456", role: "EMPLOYER" }` to `req.user`.

**Step 3 — `employer.routes.ts`**: The `requireRoles([Role.EMPLOYER])` middleware checks `req.user.role === "EMPLOYER"` — passes.

**Step 4 — `employer.routes.ts`**: Matches `router.delete('/jobs/:jobId', ...)` and calls `EmployerController.deleteJob`.

**Step 5 — `employer.controller.ts`**: The controller:
- Reads `userId` from `req.user`.
- Reads `jobId` from `req.params`.
- Creates `new DeleteJob(jobRepo, empRepo)` — injecting the Prisma repositories.
- Calls `useCase.execute("user-uuid-456", "job-uuid-123")`.

**Step 6 — `ManageJobs.ts` (Use Case)**:
- Calls `empRepo.findByUserId("user-uuid-456")` → returns `EmployerProfile { id: "emp-789", ... }`.
- Calls `jobRepo.findById("job-uuid-123")` → returns `Job { employerId: "emp-789", ... }`.
- Checks `job.employerId === employer.id` → `"emp-789" === "emp-789"` → ✅ passes.
- Calls `jobRepo.delete("job-uuid-123")`.

**Step 7 — `PrismaJobRepository.ts` (Infrastructure)**:
- Calls `prisma.job.delete({ where: { id: "job-uuid-123" } })`.
- PostgreSQL deletes the row.

**Step 8 — Back in `employer.controller.ts`**:
- Calls `sendSuccess(res, 'Job deleted successfully.', null)`.

**Step 9 — Client receives**:
```json
{
  "success": true,
  "message": "Job deleted successfully.",
  "data": null
}
```

If **anything goes wrong** at any step (e.g., the job doesn't belong to this employer), a domain error is thrown, caught by `next(err)`, and the global `error.middleware.ts` returns:
```json
{
  "success": false,
  "message": "You can only delete your own jobs.",
  "error": "UnauthorizedEmployerActionError"
}
```

---

## Data Flow

A typical request flows through the layers like this:

```
HTTP Request
    │
    ▼
┌─────────────────────────────┐
│  Presentation Layer         │
│  (Routes → Middleware →     │
│   Validation → Controller)  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Application Layer          │
│  (Use Case receives ports   │
│   via constructor injection)│
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Infrastructure Layer       │
│  (Prisma Repository         │
│   implements port interface)│
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  PostgreSQL Database        │
│  (via Prisma Client)        │
└─────────────────────────────┘
```

**The Dependency Rule**: Source code dependencies always point **inward**. The Domain Layer knows nothing about Express, Prisma, or HTTP. The Application Layer knows nothing about Prisma or Express. Only the outermost layers (Infrastructure and Presentation) deal with concrete frameworks.

---

## Database (`prisma/`)

```
prisma/
└── schema.prisma        # Single source of truth for all database models
```

### Key Models

| Model | Description |
|---|---|
| `User` | Core user account with `email`, `role`, `password`, `isActive` |
| `AlumniProfile` | Extended profile linked to `User` and `Department` |
| `EmployerProfile` | Company profile linked to `User` |
| `DepartmentHeadProfile` | Links a `DEPARTMENT_HEAD` user to a specific `Department` |
| `Department` | Academic departments (e.g., SWE, ECE, MEG) |
| `Job` | Job postings created by employers |
| `JobApplication` | Alumni applications to jobs |
| `Survey` / `SurveyQuestion` | Tracer study surveys with nested questions |
| `SurveyResponse` / `SurveyAnswer` | Alumni responses with nested answers |
| `EmployerFeedback` | Skill ratings (1–10) given by employers for alumni |
| `DocumentRequest` | Alumni requests for official documents |
| `Notification` | In-app notifications per user |
| `RegistrarStudent` / `RegistrarSyncLog` | Imported graduate data and sync history |
| `AuditLog` | Security audit trail of administrative actions |

### Commands
```bash
npx prisma generate    # Regenerate the Prisma client after schema changes
npx prisma db push     # Push schema changes to the database (dev only)
npx prisma migrate dev # Create and apply a migration (production workflow)
```

---

## Module Registry

| API Prefix | Module | Roles | Key Features |
|---|---|---|---|
| `/api/auth` | Auth | Public | Login, Register, Activate, Logout, JWT Refresh |
| `/api/alumni` | Alumni | `ALUMNI` | Profile CRUD, Work Experience, File Uploads, Document Requests |
| `/api/registrar` | Registrar | `ADMIN`, `REGISTRAR` | Graduate Import (CSV/Excel), Student Verification, Alumni Status |
| `/api/employer` | Employer | `EMPLOYER`, `ALUMNI` | Company Profile, Job CRUD, Apply for Jobs, Review Applications |
| `/api/departments` | Department | `DEPARTMENT_HEAD` | Department Stats, Alumni by Department |
| `/api/surveys` | Surveys | `ADMIN`, `REGISTRAR`, `ALUMNI` | Create Surveys, Submit Responses |
| `/api/analytics` | Analytics | `ADMIN`, `REGISTRAR`, `DEPARTMENT_HEAD` | Employment Rates, Skill Gaps, Department Metrics |
| `/api/documents` | Documents | `ALUMNI`, `ADMIN`, `REGISTRAR` | Request Documents, Process Requests |
| `/api/notifications` | Notifications | Any Authenticated | Get, Read, Mark All Read, Send (Admin) |

---

## Testing Strategy

- **Methodology**: Test-Driven Development (TDD) — Red → Green → Refactor
- **Tool**: Jest with `ts-jest`
- **Scope**: Unit tests on Use Cases with mocked repository ports
- **Coverage**: 34 test suites, 99 unit tests — all passing
- **Isolation**: Tests never hit the database. Repositories are fully mocked via `jest.Mocked<IRepository>`.

```bash
# Run all tests
npx jest

# Run tests for a specific module
npx jest src/modules/employer

# Run with verbose output
npx jest --verbose

# Type-check without emitting
npx tsc --noEmit
```

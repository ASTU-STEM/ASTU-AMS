# ASTU-AMS Backend Implementation Guide

## Overview

This guide provides implementation instructions for the ASTU Alumni Management System (ASTU-AMS) backend. The backend follows a modular layered architecture with Node.js/Express, TypeScript, Prisma ORM, and PostgreSQL.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Setup
```bash
cd ASTU-AMS/backend
npm init -y
npm install express cors helmet morgan compression express-rate-limit
npm install @prisma/client bcryptjs jsonwebtoken zod
npm install nodemailer multer csv-parse exceljs
npm install -D typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken
npm install -D @types/nodemailer @types/multer ts-node nodemon
npx prisma init
```

### Environment
```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/astu_ams"
JWT_SECRET="your-256-bit-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
PORT=5000
```

### Run
```bash
npx prisma db push
npx ts-node src/server.ts
# or with nodemon for development
npx nodemon --exec ts-node src/server.ts
```

---

## 2. Project Structure

```
backend/src/
├── server.ts              # Entry point
├── app.ts                 # Express app setup
├── config/                # Environment config
├── database/              # Prisma client singleton
├── middlewares/            # Auth, validation, error handling
├── modules/               # Feature modules
│   ├── auth/              # Authentication & authorization
│   ├── users/             # User management
│   ├── alumni/            # Alumni profiles
│   ├── employers/         # Employer profiles
│   ├── jobs/              # Job board
│   ├── surveys/           # Tracer studies
│   ├── analytics/         # Analytics endpoints
│   ├── registrar/         # Registrar operations
│   ├── departments/       # Department analytics
│   ├── notifications/     # Notification system
│   ├── events/            # Event management
│   ├── mentorship/        # Mentorship system
│   ├── documents/         # Document requests
│   ├── donations/         # Donation portal
│   ├── gallery/           # Media gallery
│   └── admin/             # Admin operations
├── common/                # Shared utilities
├── interfaces/            # TypeScript interfaces
├── types/                 # Shared types
├── validators/            # Zod schemas
├── services/              # Shared services (email, upload)
├── jobs/                  # Cron jobs (tracer reminders)
├── events/                # Event emitter setup
├── routes/                # Route aggregation
└── docs/                  # Documentation
    ├── API_CONTRACT.md    # Full API contract
    └── this-file          # Implementation guide
```

---

## 3. Module Architecture (per module)

Each module follows the same structure:

```
modules/example/
├── example.controller.ts   # Request handlers
├── example.service.ts      # Business logic
├── example.repository.ts   # Prisma DB access
├── example.routes.ts       # Route definitions
├── example.validation.ts   # Zod schemas
├── example.types.ts        # Module-specific types
└── example.constants.ts    # Module constants
```

### Controller Pattern
```typescript
// example.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ExampleService } from './example.service';

export class ExampleController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ExampleService.getAll(req.query);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Pattern
```typescript
// example.service.ts
import { ExampleRepository } from './example.repository';

export class ExampleService {
  static async getAll(filters: Record<string, unknown>) {
    return ExampleRepository.findAll(filters);
  }
}
```

### Repository Pattern
```typescript
// example.repository.ts
import { prisma } from '../../database/prisma-client';

export class ExampleRepository {
  static async findAll(filters: Record<string, unknown>) {
    return prisma.example.findMany({ where: filters });
  }
}
```

### Route Pattern
```typescript
// example.routes.ts
import { Router } from 'express';
import { ExampleController } from './example.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { exampleSchema } from './example.validation';

const router = Router();

router.get('/', authenticate, ExampleController.getAll);
router.post('/', authenticate, validate(exampleSchema), ExampleController.create);

export default router;
```

---

## 4. Middleware Stack

```typescript
// app.ts — order matters
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use('/api', routes);
app.use(errorHandler);
```

### Auth Middleware
```typescript
// middlewares/auth.middleware.ts
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};
```

### Error Handler
```typescript
// middlewares/error.middleware.ts
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
```

---

## 5. Authentication Flow

```
1. User submits login form
2. POST /api/auth/login
3. Validate credentials against DB (bcrypt.compare)
4. Generate JWT access token (1h) + refresh token (7d)
5. Store refresh token in Session table
6. Return tokens + user data to frontend
7. Frontend stores tokens in localStorage
8. All subsequent API calls include Authorization: Bearer <token>
9. On 401, frontend calls POST /api/auth/refresh
10. Old refresh token validated, new token pair issued
11. On logout, session deleted from DB
```

### Token Payload
```typescript
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
```

---

## 6. Tracer Study Automation (Cron Jobs)

```typescript
// jobs/tracer-study.job.ts
import cron from 'node-cron';

// Run daily at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  // 1. Find alumni who graduated 6 months ago
  // 2. Create survey for them if not already created
  // 3. Send email notification
  // 4. Create in-app notification
});

// Survey reminder (3 days before deadline)
cron.schedule('0 9 * * *', async () => {
  // 1. Find pending surveys expiring in 3 days
  // 2. Send reminder notifications
});

// Generate monthly analytics report
cron.schedule('0 7 1 * *', async () => {
  // 1. Aggregate employment data
  // 2. Generate department reports
  // 3. Update AnalyticsSnapshot table
});
```

---

## 7. File Upload Strategy

```typescript
// services/upload.service.ts
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads', file.fieldname);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});
```

Upload directories:
- `uploads/profiles/` — Profile avatars
- `uploads/cvs/` — CV/resume files
- `uploads/documents/` — Transcripts and certificates
- `uploads/excel/` — Registrar import files

---

## 8. Email Service

```typescript
// services/email.service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"ASTU-AMS" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
```

### Email Templates
- Account activation / welcome
- Login notification
- Tracer survey invitation
- Survey reminder
- Job match notification
- Document request status update
- Mentorship request
- Password reset
- Event registration confirmation

---

## 9. RBAC Permission Matrix

| Feature | ALUMNI | EMPLOYER | REGISTRAR | DEPT_HEAD | ADMIN |
|---|---|---|---|---|---|
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| View alumni directory | ✅ | ✅ | ❌ | ✅ | ✅ |
| Post jobs | ❌ | ✅ | ❌ | ❌ | ✅ |
| Apply to jobs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Submit surveys | ✅ | ❌ | ❌ | ❌ | ❌ |
| View survey analytics | ❌ | ❌ | ✅ | ✅ | ✅ |
| Import graduates | ❌ | ❌ | ✅ | ❌ | ✅ |
| View department analytics | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage homepage content | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create notifications | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage events | ❌ | ❌ | ❌ | ❌ | ✅ |
| Process documents | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 10. Frontend-Backend Integration Checklist

### Phase 1: Auth
- [ ] `POST /api/auth/login` — LoginPage.tsx
- [ ] `POST /api/auth/register` — AlumniRegistrationPage.tsx
- [ ] `POST /api/auth/refresh` — api.ts interceptor
- [ ] `GET /api/auth/me` — AuthContext.tsx initialization

### Phase 2: Alumni
- [ ] `GET /api/alumni/me` — ProfileTab.tsx
- [ ] `PUT /api/alumni/me` — ProfileTab.tsx save
- [ ] `POST /api/alumni/avatar` — Avatar upload
- [ ] `GET /api/alumni/directory` — Alumni directory browsing

### Phase 3: Jobs
- [ ] `GET /api/jobs` — JobsTab.tsx
- [ ] `GET /api/jobs/:id` — JobDetailsModal.tsx
- [ ] `POST /api/jobs/:id/apply` — JobsTab.tsx apply

### Phase 4: Surveys
- [ ] `GET /api/surveys` — SurveysTab.tsx
- [ ] `GET /api/surveys/:id` — Survey questions
- [ ] `POST /api/surveys/:id/submit` — Survey completion

### Phase 5: Analytics
- [ ] `GET /api/analytics/dashboard` — DepartmentDashboard.tsx
- [ ] `GET /api/analytics/employment-rate` — Employment charts
- [ ] `GET /api/analytics/skill-gaps` — Skill gap charts

---

## 11. Deployment

### Docker (Recommended)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file: ./backend/.env
    depends_on:
      - db
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: astu_ams
      POSTGRES_USER: astu
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Production Considerations
- Use `pm2` or `docker compose` for process management
- Set up reverse proxy with Nginx
- Enable SSL/TLS
- Configure database connection pooling
- Set up monitoring (Sentry, PM2 metrics)
- Regular database backups
- Rate limiting on auth endpoints

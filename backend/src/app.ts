import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './core/config/env';
import path from 'path';
import { globalErrorHandler } from './core/middleware/error.middleware';
import { sendSuccess } from './core/utils/response.utils';

const app = express();

// 1. Basic Security Headers (Helmet) - ASTU AI Active
app.use(helmet({
  crossOriginResourcePolicy: false, // Permit loading uploaded local files on frontend
}));

// 2. CORS Policy Configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://astualumni.getastuye.com',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
}));

// 3. API Rate Limiting
// A general ceiling for the whole API surface...
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  // Never disabled outright: `skip: () => true` left production with no
  // throttling at all. Only relaxed outside production.
  skip: () => env.NODE_ENV !== 'production',
});
app.use('/api', limiter);

// Credential endpoints get a much tighter budget so passwords and OTPs cannot
// be brute-forced even though the general limit is generous.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => env.NODE_ENV !== 'production',
});
for (const p of [
  '/api/auth/login',
  '/api/auth/employer/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/send-2fa-otp',
  '/api/auth/verify-2fa-code',
  '/api/auth/register/verify-email',
  '/api/auth/register/verify-national-id',
  '/api/auth/resend-otp',
]) {
  app.use(p, authLimiter);
}

// 4. Request Body Parsers
// JSON/urlencoded stay small; only the file-upload routes need a large ceiling,
// and those enforce their own tighter limit (multer `limits.fileSize`).
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// 5. Static Files Route for Uploads (CVs, profile images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 6. Mount Module Routes
import authRouter from './modules/auth/presentation/auth.routes';
import alumniRouter from './modules/alumni/presentation/alumni.routes';
import registrarRouter from './modules/registrar/presentation/registrar.routes';
import employerRouter from './modules/employer/presentation/employer.routes';
import departmentRouter from './modules/department/presentation/department.routes';
import surveyRouter from './modules/surveys/presentation/surveys.routes';
import analyticsRouter from './modules/analytics/presentation/analytics.routes';
import documentsRouter from './modules/documents/presentation/documents.routes';
import notificationsRouter from './modules/notifications/presentation/notifications.routes';
import aiRouter from './modules/ai/presentation/ai.routes';
import eventsRouter from './modules/events/presentation/events.routes';
import mentorshipRouter from './modules/mentorship/presentation/mentorship.routes';
import jobboardRouter from './modules/jobboard/presentation/jobboard.routes';
import supportRouter from './modules/support/presentation/support.routes';
import adminRouter from './modules/admin/infrastructure/routes/adminRoutes';
import contentRouter from './modules/content/presentation/content.routes';
import chatRouter from './modules/chat/presentation/chat.routes';
import toolsRouter from './modules/tools/presentation/tools.routes';

app.use('/api/auth', authRouter);
app.use('/api/alumni', alumniRouter);
app.use('/api/registrar', registrarRouter);
app.use('/api/employer', employerRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/department', departmentRouter);
app.use('/api/surveys', surveyRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/events', eventsRouter);
app.use('/api/content', contentRouter);
app.use('/api/mentorship', mentorshipRouter);
app.use('/api/jobs', jobboardRouter);
app.use('/api/support', supportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);
app.use('/api/tools', toolsRouter);

// 7. Base API Health Check
app.get('/health', (req, res) => {
  return sendSuccess(res, 'API is healthy', { timestamp: new Date().toISOString() });
});

// 8. 404 Fallback Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// 9. Global Error Handler Middleware
app.use(globalErrorHandler);

export default app;
export { app };

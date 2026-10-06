import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Always skip rate limiting during development
});
app.use('/api', limiter);

// 4. Request Body Parsers (Support large file attachments up to 50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import { owaspSecurityInspectorMiddleware } from './core/security/owaspSecurityEngine';
app.use(owaspSecurityInspectorMiddleware);

import { serverLogBuffer } from './core/utils/logger.utils';

// Live HTTP Traffic & Server Terminal Stream Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (...args: any[]) {
    const latencyMs = Date.now() - start;
    const reqPath = req.originalUrl || req.url;
    if (reqPath && !reqPath.includes('/static') && !reqPath.includes('/assets') && !reqPath.includes('/uploads')) {
      const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '::1';
      const clientIp = rawIp.replace(/^::ffff:/, '');
      let clientName = 'Guest Client';
      if ((req as any).user) {
        clientName = (req as any).user.email || (req as any).user.name || 'Authenticated User';
      }

      serverLogBuffer.addLog({
        type: 'HTTP_REQUEST',
        level: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'HTTP',
        statusCode: res.statusCode,
        method: req.method as any,
        path: reqPath,
        clientName,
        ipAddress: clientIp,
        latencyMs,
        message: `${res.statusCode} ${req.method} ${reqPath} - Client: ${clientName} (IP: ${clientIp}) - ${latencyMs}ms`,
        source: 'BACKEND',
      });
    }
    return originalEnd.apply(res, args as any);
  };
  next();
});

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

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { globalErrorHandler } from './core/middleware/error.middleware';
import { sendSuccess } from './core/utils/response.utils';

const app = express();

// 1. Basic Security Headers (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: false, // Permit loading uploaded local files on frontend
}));

// 2. CORS Policy Configuration
app.use(cors({
  origin: '*', // In production, replace with specific frontend URL (e.g. env.FRONTEND_URL)
  credentials: true,
}));

// 3. API Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 4. Request Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Static Files Route for Uploads (CVs, profile images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 6. Mount Module Routes
import authRouter from './modules/auth/presentation/auth.routes';
import alumniRouter from './modules/alumni/presentation/alumni.routes';
import registrarRouter from './modules/registrar/presentation/registrar.routes';
import employerRouter from './modules/employer/presentation/employer.routes';
import departmentRouter from './modules/department/presentation/department.routes';
import surveyRouter from './modules/surveys/presentation/surveys.routes';
import analyticsRouter from './modules/analytics/presentation/analytics.routes';

app.use('/api/auth', authRouter);
app.use('/api/alumni', alumniRouter);
app.use('/api/registrar', registrarRouter);
app.use('/api/employer', employerRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/surveys', surveyRouter);
app.use('/api/analytics', analyticsRouter);

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

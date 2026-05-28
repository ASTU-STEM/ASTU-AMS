import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes';
import registrarRouter from '../modules/registrar/registrar.routes';
import alumniRouter from '../modules/alumni/alumni.routes';
import jobsRouter from '../modules/jobs/jobs.routes';
import surveysRouter from '../modules/surveys/surveys.routes';
import analyticsRouter from '../modules/analytics/analytics.routes';
import usersRouter from '../modules/users/users.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/registrar', registrarRouter);
router.use('/alumni', alumniRouter);
router.use('/jobs', jobsRouter);
router.use('/surveys', surveysRouter);
router.use('/analytics', analyticsRouter);
router.use('/users', usersRouter);

export default router;

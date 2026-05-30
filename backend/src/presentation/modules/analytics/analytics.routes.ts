import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticateJWT, requireRoles } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

// Protect all analytics endpoints
router.use(authenticateJWT);

router.get('/kpis', requireRoles([Role.ADMIN, Role.DEPARTMENT_HEAD, Role.REGISTRAR]), asyncHandler(AnalyticsController.getKpis));
router.get('/employment-by-department', requireRoles([Role.ADMIN, Role.DEPARTMENT_HEAD]), asyncHandler(AnalyticsController.getEmploymentByDepartment));
router.get('/skill-gaps', requireRoles([Role.ADMIN, Role.DEPARTMENT_HEAD]), asyncHandler(AnalyticsController.getSkillGaps));
router.get('/top-employers', asyncHandler(AnalyticsController.getTopEmployers));
router.get('/advanced-metrics', requireRoles([Role.ADMIN, Role.DEPARTMENT_HEAD]), asyncHandler(AnalyticsController.getAdvancedMetrics));

export default router;

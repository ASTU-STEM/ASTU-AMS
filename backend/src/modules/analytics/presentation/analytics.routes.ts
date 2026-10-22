import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// Secure all endpoints to ADMIN, REGISTRAR, DEPARTMENT_HEAD, and ALUMNI_OFFICE
router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]));

// Legacy mapping to prevent breaks
router.get('/report', asyncHandler(AnalyticsController.getDashboard));

// New analytics endpoints
router.get('/dashboard', asyncHandler(AnalyticsController.getDashboard));
router.get('/employment', asyncHandler(AnalyticsController.getEmployment));
router.get('/employers', asyncHandler(AnalyticsController.getEmployers));
router.get('/departments', asyncHandler(AnalyticsController.getDepartments));
router.get('/skills', asyncHandler(AnalyticsController.getSkills));
router.get('/tracer', asyncHandler(AnalyticsController.getTracer));
router.get('/insights', asyncHandler(AnalyticsController.getInsights));
router.get('/recommendations', asyncHandler(AnalyticsController.getRecommendations));

export default router;

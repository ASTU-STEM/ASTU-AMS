import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]));

router.get('/report', asyncHandler(AnalyticsController.getReport));

export default router;

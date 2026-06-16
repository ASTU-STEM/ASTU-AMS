import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN]));

router.get('/users', asyncHandler(AdminController.getAllUsers));
router.patch('/users/:userId/status', asyncHandler(AdminController.updateUserStatus));
router.get('/jobs', asyncHandler(AdminController.getJobs));
router.get('/departments', asyncHandler(AdminController.getDepartments));
router.get('/surveys', asyncHandler(AdminController.getSurveys));
router.get('/logs', asyncHandler(AdminController.getLogs));
router.get('/overview', asyncHandler(AdminController.getOverview));
router.get('/analytics', asyncHandler(AdminController.getAnalytics));

export default router;

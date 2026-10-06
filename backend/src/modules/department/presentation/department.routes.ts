import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticateJWT, optionalAuthenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// Publicly available for registration dropdowns; overview supports scoped optional auth.
router.get('/', asyncHandler(DepartmentController.listDepartments));
router.get('/overview', optionalAuthenticateJWT, asyncHandler(DepartmentController.getDashboardOverview));
router.get('/dashboard-overview', optionalAuthenticateJWT, asyncHandler(DepartmentController.getDashboardOverview));

router.use(authenticateJWT);
router.use(requireRoles([Role.DEPARTMENT_HEAD, Role.ADMIN, Role.SUPER_ADMIN]));

router.get('/my-department', asyncHandler(DepartmentController.getMyDepartment));
router.get('/my-stats', asyncHandler(DepartmentController.getMyDepartmentStats));
router.get('/my-alumni', asyncHandler(DepartmentController.getMyDepartmentAlumni));
router.get('/my-analytics', asyncHandler(DepartmentController.getMyDepartmentAnalytics));

export default router;

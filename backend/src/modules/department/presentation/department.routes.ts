import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticateJWT, optionalAuthenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// Publicly available (or with optional token)
router.get('/', asyncHandler(DepartmentController.listDepartments));
router.get('/overview', optionalAuthenticateJWT, asyncHandler(DepartmentController.getDashboardOverview));
router.get('/dashboard-overview', optionalAuthenticateJWT, asyncHandler(DepartmentController.getDashboardOverview));

// Department Head Specific Routes
router.use(authenticateJWT);
router.use(requireRoles([Role.DEPARTMENT_HEAD, Role.ADMIN, Role.SUPER_ADMIN]));

router.get('/my-stats', asyncHandler(DepartmentController.getMyDepartmentStats));
router.get('/my-alumni', asyncHandler(DepartmentController.getMyDepartmentAlumni));
router.get('/my-department', asyncHandler(DepartmentController.getDashboardOverview));
router.get('/my-analytics', asyncHandler(DepartmentController.getDashboardOverview));

router.get('/:departmentId/stats', asyncHandler(DepartmentController.getMyDepartmentStats));
router.get('/:departmentId/alumni', asyncHandler(DepartmentController.getMyDepartmentAlumni));
router.get('/:departmentId/profile', asyncHandler(DepartmentController.getDashboardOverview));
router.get('/:departmentId/analytics', asyncHandler(DepartmentController.getDashboardOverview));

export default router;

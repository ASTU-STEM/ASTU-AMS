import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// Publicly available (registration dropdowns)
router.get('/', asyncHandler(DepartmentController.listDepartments));

// Department Head Specific Routes (ADMIN may pass ?departmentId=)
router.use(authenticateJWT);
router.use(requireRoles([Role.DEPARTMENT_HEAD, Role.ADMIN]));

router.get('/my-department', asyncHandler(DepartmentController.getMyDepartment));
router.get('/my-stats', asyncHandler(DepartmentController.getMyDepartmentStats));
router.get('/my-alumni', asyncHandler(DepartmentController.getMyDepartmentAlumni));
router.get('/my-analytics', asyncHandler(DepartmentController.getMyDepartmentAnalytics));

export default router;

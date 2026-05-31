import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// Publicly available (or for any logged-in user)
router.get('/', asyncHandler(DepartmentController.listDepartments));

// Department Head Specific Routes
router.use(authenticateJWT);
router.use(requireRoles([Role.DEPARTMENT_HEAD]));

router.get('/my-stats', asyncHandler(DepartmentController.getMyDepartmentStats));
router.get('/my-alumni', asyncHandler(DepartmentController.getMyDepartmentAlumni));

export default router;

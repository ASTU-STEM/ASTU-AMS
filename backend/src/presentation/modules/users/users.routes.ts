import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticateJWT, requireRoles } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

// Protect all user management routes
router.use(authenticateJWT);

// Profile verification is accessible to REGISTRAR or ADMIN
router.put('/:id/verify', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(UsersController.verifyUser));

// Alumni management (Admin and Registrar)
router.get('/alumni/all', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(UsersController.getAlumniList));
router.put('/alumni/:alumniId/status', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(UsersController.updateAlumniStatus));
router.post('/alumni/:alumniId/activate', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(UsersController.activateAlumni));
router.post('/alumni/:alumniId/suspend', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(UsersController.suspendAlumni));
router.post('/alumni/:alumniId/inactivate', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(UsersController.inactivateAlumni));

// All other endpoints are ADMIN only
router.use(requireRoles([Role.ADMIN]));

router.get('/', asyncHandler(UsersController.listUsers));
router.post('/', asyncHandler(UsersController.createUser));
router.put('/:id', asyncHandler(UsersController.updateUser));
router.put('/:id/ban', asyncHandler(UsersController.banUser));
router.put('/:id/role', asyncHandler(UsersController.assignRole));
router.get('/:id/profile', asyncHandler(UsersController.getUserProfile));
router.get('/:id/activity', asyncHandler(UsersController.getUserActivity));

export default router;

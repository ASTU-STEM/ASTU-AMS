import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT, requireRoles } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

// ============ PUBLIC ROUTES ============
// Alumni public registration (pending admin approval)
router.post('/register', asyncHandler(AuthController.registerAlumni));

// Main system login (alumni, registrar, department head, admin)
router.post('/login', asyncHandler(AuthController.login));

// Alumni activation (after admin approval)
router.post('/activate-alumni', asyncHandler(AuthController.activateAlumni));

// Token refresh
router.post('/refresh', asyncHandler(AuthController.refresh));

// ============ EMPLOYER SEPARATE FLOW ============
// Employer registration
router.post('/employer/register', asyncHandler(AuthController.registerEmployer));

// Employer login
router.post('/employer/login', asyncHandler(AuthController.employerLogin));

// ============ PROTECTED ROUTES ============
// Logout (requires authentication)
router.post('/logout', authenticateJWT, asyncHandler(AuthController.logout));

// ============ ADMIN ONLY ROUTES ============
// Admin: Create Registrar/Department Head accounts with auto-generated credentials
router.post(
  '/admin/create-user',
  authenticateJWT,
  requireRoles([Role.ADMIN]),
  asyncHandler(AuthController.adminCreateUser)
);

// Admin: Approve alumni accounts
router.post(
  '/admin/approve-alumni/:userId',
  authenticateJWT,
  requireRoles([Role.ADMIN]),
  asyncHandler(AuthController.adminApproveAlumni)
);

// Admin: Approve employer accounts
router.post(
  '/admin/approve-employer/:userId',
  authenticateJWT,
  requireRoles([Role.ADMIN]),
  asyncHandler(AuthController.adminApproveEmployer)
);

export default router;

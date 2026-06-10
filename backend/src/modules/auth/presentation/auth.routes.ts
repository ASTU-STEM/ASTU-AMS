import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Public Routes
router.post('/login', asyncHandler(AuthController.login));
router.post('/activate-alumni', asyncHandler(AuthController.activateAlumni));
router.post('/refresh', asyncHandler(AuthController.refresh));

// Alumni Registration Flow
router.post('/register', asyncHandler(AuthController.registerAlumni));
router.post('/register/verify-email', asyncHandler(AuthController.verifyAlumniEmail));
router.post('/register/verify-national-id', asyncHandler(AuthController.verifyAlumniNationalId));

// Manual Verification (with file uploads)
router.post(
  '/register/verify-manual',
  upload.array('documents', 5),
  asyncHandler(AuthController.submitManualVerification)
);

// Didit Verification Flow
router.post('/didit-session', asyncHandler(AuthController.startDiditSession));
router.get('/didit-status/:sessionId', asyncHandler(AuthController.getDiditStatus));

// Employer Specific Flows
router.post('/employer/login', asyncHandler(AuthController.employerLogin));
router.post('/employer/register', asyncHandler(AuthController.registerEmployer));

// Forgot / Reset Password
router.post('/forgot-password', asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', asyncHandler(AuthController.resetPassword));

// Protected Routes
router.post('/logout', authenticateJWT, asyncHandler(AuthController.logout));

// Admin Only Routes
router.post(
  '/admin/create-user',
  authenticateJWT,
  requireRoles([Role.ADMIN]),
  asyncHandler(AuthController.adminCreateUser)
);

export default router;

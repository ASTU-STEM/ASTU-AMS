import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// Public Routes
router.post('/login', asyncHandler(AuthController.login));
router.post('/activate-alumni', asyncHandler(AuthController.activateAlumni));
router.post('/refresh', asyncHandler(AuthController.refresh));

// Employer Specific Flows
router.post('/employer/login', asyncHandler(AuthController.employerLogin));
router.post('/employer/register', asyncHandler(AuthController.registerEmployer));

// Protected Routes
router.post('/logout', authenticateJWT, asyncHandler(AuthController.logout));

export default router;

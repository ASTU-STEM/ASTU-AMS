import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/login', asyncHandler(AuthController.login));
router.post('/register-employer', asyncHandler(AuthController.registerEmployer));
router.post('/activate-alumni', asyncHandler(AuthController.activateAlumni));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', authenticateJWT, asyncHandler(AuthController.logout));

export default router;

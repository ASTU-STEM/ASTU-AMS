import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import multer from 'multer';

const router = Router();
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'uploads', 'VerificationDocument');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Public Routes
router.post('/login', asyncHandler(AuthController.login));
router.post('/send-2fa-otp', asyncHandler(AuthController.send2FAOTP));
router.post('/verify-2fa-code', asyncHandler(AuthController.verify2FACode));
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

router.post(
  '/register/issue',
  upload.fields([{ name: 'identificationDocument', maxCount: 1 }]),
  asyncHandler(AuthController.submitRegistrationIssue)
);

// Didit Verification Flow
router.post('/didit-session', asyncHandler(AuthController.startDiditSession));
router.get('/didit-status/:sessionId', asyncHandler(AuthController.getDiditStatus));
router.post('/didit-verify', asyncHandler(AuthController.verifyDiditSession));

// Employer Specific Flows
router.post('/employer/login', asyncHandler(AuthController.employerLogin));
router.post('/employer/register', asyncHandler(AuthController.registerEmployer));

// Forgot / Reset Password
router.post('/forgot-password', asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', asyncHandler(AuthController.resetPassword));

// Protected Routes
router.post('/logout', authenticateJWT, asyncHandler(AuthController.logout));
router.put('/change-password', authenticateJWT, asyncHandler(AuthController.changePassword));
router.put('/toggle-2fa', authenticateJWT, asyncHandler(AuthController.toggle2FA));

// Admin Only Routes
router.post(
  '/admin/create-user',
  authenticateJWT,
  requireRoles([Role.ADMIN]),
  asyncHandler(AuthController.adminCreateUser)
);

export default router;

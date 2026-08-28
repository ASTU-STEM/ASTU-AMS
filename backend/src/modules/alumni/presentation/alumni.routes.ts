import { Router } from 'express';
import { AlumniController } from './alumni.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import { uploadMiddleware } from '../../../core/middlewares/upload.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireRoles([Role.ALUMNI]));

// Profile
router.get('/me', asyncHandler(AlumniController.getMe));
router.put('/me', uploadMiddleware.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), asyncHandler(AlumniController.updateMe));

// Work Experience
router.post('/experiences', asyncHandler(AlumniController.addExperience));
router.put('/experiences/:id', asyncHandler(AlumniController.updateExperience));
router.delete('/experiences/:id', asyncHandler(AlumniController.deleteExperience));

// Files
router.post('/upload', uploadMiddleware.fields([{ name: 'cv', maxCount: 1 }, { name: 'profilePicture', maxCount: 1 }]), asyncHandler(AlumniController.uploadFiles));

// Documents & Chapa Payment
router.post('/document-requests', asyncHandler(AlumniController.requestDocument));
router.get('/document-requests', asyncHandler(AlumniController.getMyDocuments));
router.post('/chapa/initialize-document-payment', asyncHandler(AlumniController.initializeChapaDocumentPayment));
router.post('/chapa/verify-document-payment', asyncHandler(AlumniController.verifyChapaDocumentPayment));

// Dashboard
router.get('/dashboard-stats', asyncHandler(AlumniController.getDashboardStats));

// Mentors
router.get('/mentors', asyncHandler(AlumniController.getMentorProfiles));
router.post('/mentorship-sessions', asyncHandler(AlumniController.scheduleSession));

// Settings Preferences
router.get('/preferences', asyncHandler(AlumniController.getPreferences));
router.put('/preferences', asyncHandler(AlumniController.updatePreferences));

// Change Password
router.put('/change-password', asyncHandler(AlumniController.changePassword));

// Security & Account
router.get('/security-status', asyncHandler(AlumniController.getSecurityStatus));
router.get('/export-data', asyncHandler(AlumniController.exportData));
router.delete('/account', asyncHandler(AlumniController.deleteAccount));

// Forum
router.get('/forum', asyncHandler(AlumniController.getForumPosts));
router.post('/forum', asyncHandler(AlumniController.createForumPost));
router.post('/forum/:id/like', asyncHandler(AlumniController.toggleForumLike));
router.post('/forum/:id/comment', asyncHandler(AlumniController.addForumComment));

// Donations & Chapa Payment
router.get('/donations', asyncHandler(AlumniController.getDonations));
router.post('/donations', asyncHandler(AlumniController.makeDonation));
router.post('/chapa/initialize-donation-payment', asyncHandler(AlumniController.initializeChapaDonationPayment));
router.post('/chapa/verify-donation-payment', asyncHandler(AlumniController.verifyChapaDonationPayment));

// Messages
router.get('/messages', asyncHandler(AlumniController.getMessageThreads));
router.get('/messages/:employerId', asyncHandler(AlumniController.getMessages));
router.post('/messages/:employerId', asyncHandler(AlumniController.sendMessage));

export default router;

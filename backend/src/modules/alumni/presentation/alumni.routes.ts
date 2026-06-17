import { Router } from 'express';
import { AlumniController } from './alumni.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.use(authenticateJWT);
router.use(requireRoles([Role.ALUMNI]));

// Workspace & Dashboard
router.get('/workspace', asyncHandler(AlumniController.getWorkspace));
router.get('/dashboard-summary', asyncHandler(AlumniController.getDashboardSummary));

// Profile
router.get('/me', asyncHandler(AlumniController.getMe));
router.put('/me', asyncHandler(AlumniController.updateMe));
router.put('/employment-status', asyncHandler(AlumniController.updateEmploymentStatus));

// Jobs
router.get('/jobs', asyncHandler(AlumniController.getJobs));
router.post('/jobs/:id/apply', asyncHandler(AlumniController.applyToJob));
router.post('/jobs/:id/withdraw', asyncHandler(AlumniController.withdrawApplication));

// Surveys
router.post('/surveys/:id/complete', asyncHandler(AlumniController.completeSurvey));

// Mentorship
router.post('/mentorship/sessions', asyncHandler(AlumniController.scheduleMentorshipSession));

// Donations
router.post('/donations', asyncHandler(AlumniController.makeDonation));

// Forum
router.post('/forum/posts', asyncHandler(AlumniController.addForumPost));
router.post('/forum/posts/:id/like', asyncHandler(AlumniController.toggleForumLike));

// Milestones
router.post('/milestones', asyncHandler(AlumniController.addMilestone));

// Work Experience
router.post('/experiences', asyncHandler(AlumniController.addExperience));
router.put('/experiences/:id', asyncHandler(AlumniController.updateExperience));
router.delete('/experiences/:id', asyncHandler(AlumniController.deleteExperience));

// Files
router.post('/upload', upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'profilePicture', maxCount: 1 }]), asyncHandler(AlumniController.uploadFiles));

// Documents
router.post('/document-requests', asyncHandler(AlumniController.requestDocument));
router.get('/document-requests', asyncHandler(AlumniController.getMyDocuments));
router.post('/documents', asyncHandler(AlumniController.requestDocument)); // Added this because frontend hits /documents

export default router;

import { Router } from 'express';
import { EmployerController } from './employer.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/resumes' });
const router = Router();

router.use(authenticateJWT);

// Alumni Routes
router.get('/jobs', requireRoles([Role.ALUMNI]), asyncHandler(EmployerController.searchJobs));
router.post('/jobs/:jobId/apply', requireRoles([Role.ALUMNI]), upload.single('resume'), asyncHandler(EmployerController.applyForJob));

// Employer Routes
router.use(requireRoles([Role.EMPLOYER]));

// Profile
router.get('/profile', asyncHandler(EmployerController.getProfile));
router.put('/profile', asyncHandler(EmployerController.updateProfile));

// Jobs
router.post('/jobs', asyncHandler(EmployerController.createJob));
router.get('/my-jobs', asyncHandler(EmployerController.getMyJobs));
router.put('/jobs/:jobId', asyncHandler(EmployerController.updateJob));
router.delete('/jobs/:jobId', asyncHandler(EmployerController.deleteJob));

// Applications
router.put('/applications/:applicationId/status', asyncHandler(EmployerController.updateApplicationStatus));

export default router;

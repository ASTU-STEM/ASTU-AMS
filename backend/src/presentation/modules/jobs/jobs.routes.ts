import { Router } from 'express';
import { JobsController } from './jobs.controller';
import { authenticateJWT, requireRoles } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

// Global auth block
router.use(authenticateJWT);

// Job listings board
router.get('/', asyncHandler(JobsController.listJobs));

// Alumni specific
router.post('/:id/apply', requireRoles([Role.ALUMNI]), upload.single('cv'), asyncHandler(JobsController.applyJob));

// Employer specific
router.post('/', requireRoles([Role.EMPLOYER]), asyncHandler(JobsController.createJob));
router.put('/:id', requireRoles([Role.EMPLOYER]), asyncHandler(JobsController.updateJob));
router.get('/:id/applicants', requireRoles([Role.EMPLOYER]), asyncHandler(JobsController.viewApplicants));
router.put('/applications/:applicationId', requireRoles([Role.EMPLOYER]), asyncHandler(JobsController.updateApplicationStatus));
router.post('/feedback', requireRoles([Role.EMPLOYER]), asyncHandler(JobsController.submitFeedback));

export default router;

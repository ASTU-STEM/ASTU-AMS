import { Router } from 'express';
import { JobBoardController } from './jobboard.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/resumes' });
const router = Router();

// ─── PUBLIC ROUTES (No Authentication Required) ─────────────────────────────
// Anyone can browse and view job details

router.get('/', asyncHandler(JobBoardController.listJobs));
router.get('/detail/:id', asyncHandler(JobBoardController.getJobDetail));

// ─── AUTHENTICATED ROUTES ───────────────────────────────────────────────────
// All routes below require a valid JWT token

router.use(authenticateJWT);

// ─── ALUMNI-ONLY ROUTES ─────────────────────────────────────────────────────

// My Applications (must be before /:id to avoid route conflict)
router.get('/my-applications',
  requireRoles([Role.ALUMNI]),
  asyncHandler(JobBoardController.getMyApplications)
);

// Saved Jobs (must be before /:id to avoid route conflict)
router.get('/saved',
  requireRoles([Role.ALUMNI]),
  asyncHandler(JobBoardController.getSavedJobs)
);

// Recommended Jobs (must be before /:id to avoid route conflict)
router.get('/recommended',
  requireRoles([Role.ALUMNI]),
  asyncHandler(JobBoardController.getRecommendedJobs)
);

// Apply to Job
router.post('/:id/apply',
  requireRoles([Role.ALUMNI]),
  upload.single('resume'),
  asyncHandler(JobBoardController.applyToJob)
);

// Withdraw Application
router.delete('/:id/application',
  requireRoles([Role.ALUMNI]),
  asyncHandler(JobBoardController.withdrawApplication)
);

// Save / Unsave Job
router.post('/:id/save',
  requireRoles([Role.ALUMNI]),
  asyncHandler(JobBoardController.saveJob)
);

router.delete('/:id/save',
  requireRoles([Role.ALUMNI]),
  asyncHandler(JobBoardController.unsaveJob)
);

export default router;

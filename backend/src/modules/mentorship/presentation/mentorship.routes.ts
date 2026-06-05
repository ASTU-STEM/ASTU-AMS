import { Router } from 'express';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import {
  requestMentorshipController,
  respondMentorshipController,
  getMyMentorsController,
  getMyMenteesController
} from './mentorship.controller';

const router = Router();

// All mentorship routes require ALUMNI role
router.use(authenticateJWT, requireRoles([Role.ALUMNI]));

// Mentee endpoints
router.post('/request', requestMentorshipController);
router.get('/my-mentors', getMyMentorsController);

// Mentor endpoints
router.put('/:requestId/respond', respondMentorshipController);
router.get('/my-mentees', getMyMenteesController);

export default router;

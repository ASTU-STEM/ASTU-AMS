import { Router } from 'express';
import { requireAuth } from '../../../../core/middlewares/auth.middleware';
import { requireAlumni } from '../../../../core/middlewares/role.middleware';
import {
  requestMentorshipController,
  respondMentorshipController,
  getMyMentorsController,
  getMyMenteesController
} from './mentorship.controller';

const router = Router();

// All mentorship routes require ALUMNI role
router.use(requireAuth, requireAlumni);

// Mentee endpoints
router.post('/request', requestMentorshipController);
router.get('/my-mentors', getMyMentorsController);

// Mentor endpoints
router.put('/:requestId/respond', respondMentorshipController);
router.get('/my-mentees', getMyMenteesController);

export default router;

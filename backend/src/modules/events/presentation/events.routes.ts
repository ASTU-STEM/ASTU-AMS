import { Router } from 'express';
import { requireAuth, requireRoles } from '../../../../core/middlewares/auth.middleware';
import { requireAlumni } from '../../../../core/middlewares/role.middleware';
import {
  createEventController,
  updateEventController,
  deleteEventController,
  getEventsController,
  rsvpController,
  getAttendeesController
} from './events.controller';

const router = Router();

// Publicly available to all authenticated users
router.get('/', requireAuth, getEventsController);
router.get('/:eventId/attendees', requireAuth, getAttendeesController);

// Restricted to ALUMNI_OFFICE and ADMIN for managing events
const allowEventManagers = requireRoles(['ADMIN', 'ALUMNI_OFFICE', 'DEPARTMENT_HEAD']);

router.post('/', requireAuth, allowEventManagers, createEventController);
router.put('/:eventId', requireAuth, allowEventManagers, updateEventController);
router.delete('/:eventId', requireAuth, allowEventManagers, deleteEventController);

// Restricted to Alumni for RSVP
router.post('/:eventId/rsvp', requireAuth, requireAlumni, rsvpController);

export default router;

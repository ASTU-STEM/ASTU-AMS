import { Router } from 'express';
import { authenticateJWT, optionalAuthenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import {
  createEventController,
  updateEventController,
  deleteEventController,
  getEventsController,
  rsvpController,
  getAttendeesController
} from './events.controller';

const router = Router();

// Publicly available for landing page (optional auth for user details)
router.get('/', optionalAuthenticateJWT, getEventsController);
router.get('/:eventId/attendees', authenticateJWT, getAttendeesController);

// Restricted to ALUMNI_OFFICE and ADMIN for managing events
const allowEventManagers = requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.DEPARTMENT_HEAD]);

router.post('/', authenticateJWT, allowEventManagers, createEventController);
router.put('/:eventId', authenticateJWT, allowEventManagers, updateEventController);
router.delete('/:eventId', authenticateJWT, allowEventManagers, deleteEventController);

// Restricted to Alumni for RSVP
router.post('/:eventId/rsvp', authenticateJWT, requireRoles([Role.ALUMNI]), rsvpController);

export default router;

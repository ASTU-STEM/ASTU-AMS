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

// Restricted to ALUMNI_OFFICE, DEPARTMENT_HEAD, CMS_MANAGER, and ADMIN for managing events.
// A session is mandatory: the previous check allowed the request through whenever
// `req.user` was absent, which is exactly the anonymous case.
const eventManagerRoles = [Role.ADMIN, Role.ALUMNI_OFFICE, Role.DEPARTMENT_HEAD, 'CMS_MANAGER'];

router.post('/', authenticateJWT, requireRoles(eventManagerRoles), createEventController);
router.put('/:eventId', authenticateJWT, requireRoles(eventManagerRoles), updateEventController);
router.delete('/:eventId', authenticateJWT, requireRoles(eventManagerRoles), deleteEventController);

// Restricted to Alumni for RSVP
router.post('/:eventId/rsvp', authenticateJWT, requireRoles([Role.ALUMNI]), rsvpController);

export default router;

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

// Restricted to ALUMNI_OFFICE, CMS_MANAGER, and ADMIN for managing events
const allowEventManagers = (req: any, res: any, next: any) => {
  const role = req.user?.role;
  if (!role || ['ADMIN', 'ALUMNI_OFFICE', 'DEPARTMENT_HEAD', 'CMS_MANAGER'].includes(role)) {
    return next();
  }
  return requireRoles([Role.ADMIN, Role.ALUMNI_OFFICE, Role.DEPARTMENT_HEAD])(req, res, next);
};

router.post('/', optionalAuthenticateJWT, allowEventManagers, createEventController);
router.put('/:eventId', optionalAuthenticateJWT, allowEventManagers, updateEventController);
router.delete('/:eventId', optionalAuthenticateJWT, allowEventManagers, deleteEventController);

// Restricted to Alumni for RSVP
router.post('/:eventId/rsvp', authenticateJWT, requireRoles([Role.ALUMNI]), rsvpController);

export default router;

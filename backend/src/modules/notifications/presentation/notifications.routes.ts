import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.use(authenticateJWT);

// Any authenticated user can access their own notifications
// Literal paths are registered before the ':notificationId' patterns so they can
// never be shadowed by them.
router.get('/', asyncHandler(NotificationsController.getMyNotifications));
router.put('/read-all', asyncHandler(NotificationsController.markAllAsRead));
router.delete('/', asyncHandler(NotificationsController.clearNotifications));
router.put('/:notificationId/read', asyncHandler(NotificationsController.markAsRead));
router.delete('/:notificationId', asyncHandler(NotificationsController.deleteNotification));

// Admin-only: send a notification to a specific user
router.post('/', requireRoles([Role.ADMIN]), asyncHandler(NotificationsController.sendNotification));

export default router;

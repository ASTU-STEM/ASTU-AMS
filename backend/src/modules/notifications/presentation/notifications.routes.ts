import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.use(authenticateJWT);

// Any authenticated user can access their own notifications
router.get('/', asyncHandler(NotificationsController.getMyNotifications));
router.put('/:notificationId/read', asyncHandler(NotificationsController.markAsRead));
router.put('/read-all', asyncHandler(NotificationsController.markAllAsRead));

// Admin-only: send a notification to a specific user
router.post('/', requireRoles([Role.ADMIN]), asyncHandler(NotificationsController.sendNotification));

export default router;

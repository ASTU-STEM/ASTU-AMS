import { Router } from 'express';
import NotificationsController from './notifications.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(NotificationsController.list));

export default router;

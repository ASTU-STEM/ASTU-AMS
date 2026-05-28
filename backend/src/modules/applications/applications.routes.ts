import { Router } from 'express';
import ApplicationsController from './applications.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(ApplicationsController.list));

export default router;

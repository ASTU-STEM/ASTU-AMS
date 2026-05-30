import { Router } from 'express';
import AuditController from './audit.controller';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

router.get('/recent', asyncHandler(AuditController.recent));

export default router;

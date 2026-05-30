import { Router } from 'express';
import MentorshipController from './mentorship.controller';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(MentorshipController.index));

export default router;

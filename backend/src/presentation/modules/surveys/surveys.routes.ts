import { Router } from 'express';
import { SurveysController } from './surveys.controller';
import { authenticateJWT, requireRoles } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

// Global auth block
router.use(authenticateJWT);

// Available surveys list & details
router.get('/', asyncHandler(SurveysController.listSurveys));
router.get('/:id', asyncHandler(SurveysController.getSurveyDetails));

// Admin-only creation
router.post('/', requireRoles([Role.ADMIN]), asyncHandler(SurveysController.createSurvey));

// Alumni-only submission
router.post('/:id/submit', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.submitResponse));

export default router;

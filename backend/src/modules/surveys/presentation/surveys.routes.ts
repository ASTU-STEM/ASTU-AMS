import { Router } from 'express';
import { SurveysController } from './surveys.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.use(authenticateJWT);

// Alumni routes
router.get('/active', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.listActiveSurveys));
router.post('/:surveyId/responses', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.submitResponse));

// Admin/Registrar/DepartmentHead routes
router.post('/', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(SurveysController.createSurvey));
router.get('/', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(SurveysController.listAllSurveys));

export default router;

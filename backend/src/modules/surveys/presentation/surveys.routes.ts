import { Router } from 'express';
import { SurveysController } from './surveys.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();
router.use(authenticateJWT);

// Alumni survey experience
router.get('/active', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.listActiveSurveys));
router.get('/my-surveys', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.getMySurveys));
router.get('/my-surveys/:assignmentId', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.getMySurveyAssignment));
router.post('/save-draft', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.saveDraft));
router.post('/submit', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.submitAssignedSurvey));
router.get('/my-history', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.getMyHistory));

// Admin/Registrar/DepartmentHead survey templates and reports
router.post('/templates', requireRoles([Role.ADMIN]), asyncHandler(SurveysController.createSurveyTemplate));
router.get('/templates', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(SurveysController.listSurveyTemplates));
router.get('/templates/:templateId', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(SurveysController.getSurveyTemplate));
router.put('/templates/:templateId', requireRoles([Role.ADMIN]), asyncHandler(SurveysController.updateSurveyTemplate));
router.delete('/templates/:templateId', requireRoles([Role.ADMIN]), asyncHandler(SurveysController.archiveSurveyTemplate));
router.post('/templates/:templateId/clone', requireRoles([Role.ADMIN]), asyncHandler(SurveysController.cloneSurveyTemplate));

router.get('/assignments', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(SurveysController.listAssignments));
router.get('/assignments/:assignmentId', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI]), asyncHandler(SurveysController.getAssignmentById));

router.get('/responses', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(SurveysController.listResponses));
router.get('/responses/:responseId', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI]), asyncHandler(SurveysController.getResponseById));

router.get('/statistics', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(SurveysController.getStatistics));
router.get('/completion-report', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(SurveysController.getCompletionReport));

// Legacy survey submission / backward compatibility
router.post('/:surveyId/responses', requireRoles([Role.ALUMNI]), asyncHandler(SurveysController.submitResponse));
router.post('/', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(SurveysController.createSurvey));
router.get('/', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD]), asyncHandler(SurveysController.listAllSurveys));

export default router;

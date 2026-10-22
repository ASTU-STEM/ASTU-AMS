import { Router } from 'express';
import { SurveysController } from './surveys.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();
router.use(authenticateJWT);

// Alumni & Employer survey experience
router.get('/active', requireRoles([Role.ALUMNI, Role.EMPLOYER]), asyncHandler(SurveysController.listActiveSurveys));
router.get('/my-surveys', requireRoles([Role.ALUMNI, Role.EMPLOYER]), asyncHandler(SurveysController.getMySurveys));
router.get('/my-surveys/:assignmentId', requireRoles([Role.ALUMNI, Role.EMPLOYER]), asyncHandler(SurveysController.getMySurveyAssignment));
router.post('/save-draft', requireRoles([Role.ALUMNI, Role.EMPLOYER]), asyncHandler(SurveysController.saveDraft));
router.post('/submit', requireRoles([Role.ALUMNI, Role.EMPLOYER]), asyncHandler(SurveysController.submitAssignedSurvey));
router.get('/my-history', requireRoles([Role.ALUMNI, Role.EMPLOYER]), asyncHandler(SurveysController.getMyHistory));
// Admin/Registrar/DepartmentHead/AlumniOffice survey templates and reports
router.post('/templates', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.createSurveyTemplate));
router.get('/templates', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.listSurveyTemplates));
router.get('/templates/:templateId', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.getSurveyTemplate));
router.put('/templates/:templateId', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.updateSurveyTemplate));
router.delete('/templates/:templateId', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.archiveSurveyTemplate));
router.post('/templates/:templateId/clone', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.cloneSurveyTemplate));
router.post('/templates/:templateId/activate', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.activateSurveyTemplate));
router.post('/templates/:templateId/send-instantly', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.sendSurveyInstantly));
router.post('/templates/:templateId/deactivate', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.deactivateSurveyTemplate));
router.get('/templates/:templateId/analysis', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.getSurveyAnalysis));
router.get('/templates/:templateId/responses', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.getResponsesBySurvey));
router.get('/assignments', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.listAssignments));
router.get('/assignments/:assignmentId', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.getAssignmentById));

router.get('/responses', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.listResponses));
router.get('/responses/:responseId', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.getResponseById));

router.get('/statistics', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.getStatistics));
router.get('/completion-report', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.getCompletionReport));
router.get('/company-hiring-stats', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.getCompanyHiringStats));
router.post('/test-engine', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.testEngineExecution));

// Legacy survey submission / backward compatibility
router.post('/:surveyId/responses', requireRoles([Role.ALUMNI, Role.EMPLOYER]), asyncHandler(SurveysController.submitResponse));
router.post('/', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.createSurvey));
router.get('/', requireRoles([Role.ADMIN, Role.REGISTRAR, Role.DEPARTMENT_HEAD, Role.ALUMNI_OFFICE]), asyncHandler(SurveysController.listAllSurveys));

export default router;

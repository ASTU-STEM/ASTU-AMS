import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// Secure all endpoints to ADMIN and REGISTRAR only
router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN, Role.REGISTRAR]));

// AI Endpoints
router.post('/chat', asyncHandler(AIController.chat));
router.post('/insights', asyncHandler(AIController.generateInsightsSummary));
router.post('/reports/executive', asyncHandler(AIController.generateExecutiveReport));
router.post('/reports/tracer', asyncHandler(AIController.generateTracerReport));
router.post('/reports/accreditation', asyncHandler(AIController.generateAccreditationReport));
router.post('/reports/curriculum', asyncHandler(AIController.generateCurriculumReport));
router.post('/reports/moe', asyncHandler(AIController.generateMoeReport));

export default router;

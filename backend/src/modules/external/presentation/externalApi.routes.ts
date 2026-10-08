import { Router } from 'express';
import { ExternalApiController } from './externalApi.controller';
import { externalApiKeyMiddleware } from '../../../core/middleware/externalApiKey.middleware';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// Public partner health ping
router.get('/health', asyncHandler(ExternalApiController.getIntegrationHealth));

// External Graduate Data Fetching Endpoint (Guarded by X-API-KEY with read:alumni scope)
router.get('/alumni', externalApiKeyMiddleware('read:alumni'), asyncHandler(ExternalApiController.getAlumniData));

// External Degree Verification Endpoint (Guarded by X-API-KEY with verify:documents scope)
router.get('/alumni/verify/:studentId', externalApiKeyMiddleware('verify:documents'), asyncHandler(ExternalApiController.verifyGraduateRecord));

// External Tracer Survey Analytics (Guarded by X-API-KEY with read:tracer scope)
router.get('/tracer-analytics', externalApiKeyMiddleware('read:tracer'), asyncHandler(ExternalApiController.getTracerAnalytics));

export default router;

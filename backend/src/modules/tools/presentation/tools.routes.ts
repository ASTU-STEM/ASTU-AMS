import { Router } from 'express';
import { ToolsController } from './tools.controller';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';

const router = Router();

// execute-ai runs LangGraph agents against a caller-supplied userProfile. It was
// mounted with no authentication at all, so anyone could drive the agent layer
// and have it echo arbitrary profile data. Reads stay public; execution does not.
router.get('/categories', asyncHandler(ToolsController.getCategories));
router.get('/summary', asyncHandler(ToolsController.getSummary));
router.post('/execute-ai', authenticateJWT, asyncHandler(ToolsController.executeAI));

export default router;

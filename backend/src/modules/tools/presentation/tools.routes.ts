import { Router } from 'express';
import { ToolsController } from './tools.controller';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.get('/categories', asyncHandler(ToolsController.getCategories));
router.get('/summary', asyncHandler(ToolsController.getSummary));
router.post('/execute-ai', asyncHandler(ToolsController.executeAI));

export default router;

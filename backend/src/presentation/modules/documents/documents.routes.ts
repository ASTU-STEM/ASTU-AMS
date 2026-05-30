import { Router } from 'express';
import DocumentsController from './documents.controller';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(DocumentsController.list));

export default router;

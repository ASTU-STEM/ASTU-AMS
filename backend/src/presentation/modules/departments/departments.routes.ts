import { Router } from 'express';
import DepartmentsController from './departments.controller';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(DepartmentsController.list));

export default router;

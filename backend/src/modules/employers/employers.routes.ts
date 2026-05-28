import { Router } from 'express';
import EmployersController from './employers.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(EmployersController.list));

export default router;

import { Router } from 'express';
import { RegistrarController } from './registrar.controller';
import { authenticateJWT, requireRoles } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Protect all registrar endpoints to ADMIN and REGISTRAR roles
router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN, Role.REGISTRAR]));

router.post('/sync', asyncHandler(RegistrarController.triggerSync));
router.get('/logs', asyncHandler(RegistrarController.getLogs));

export default router;

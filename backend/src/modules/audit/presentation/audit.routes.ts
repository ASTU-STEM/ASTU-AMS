import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

// All audit routes require authentication + ADMIN role
router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN]));

// GET all audit logs
router.get('/', asyncHandler(AuditController.getAll));

// GET audit log by ID
router.get('/:id', asyncHandler(AuditController.getById));

// GET audit logs filtered by user
router.get('/user/:userId', asyncHandler(AuditController.getByUser));

// GET audit logs filtered by action type
router.get('/action/:action', asyncHandler(AuditController.getByAction));

// POST create a new audit log entry (manual/system)
router.post('/', asyncHandler(AuditController.create));

// DELETE purge old audit logs (retention policy)
router.delete('/purge', asyncHandler(AuditController.purge));

export default router;

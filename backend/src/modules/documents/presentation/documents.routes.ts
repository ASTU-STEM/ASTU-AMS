import { Router } from 'express';
import { DocumentsController } from './documents.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';

const router = Router();

router.use(authenticateJWT);

// Alumni routes
router.post('/', requireRoles([Role.ALUMNI]), asyncHandler(DocumentsController.requestDocument));
router.get('/my-requests', requireRoles([Role.ALUMNI]), asyncHandler(DocumentsController.getMyDocuments));

// Admin/Registrar routes
router.get('/all', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(DocumentsController.getAllRequests));
router.put('/:requestId/status', requireRoles([Role.ADMIN, Role.REGISTRAR]), asyncHandler(DocumentsController.updateStatus));

export default router;

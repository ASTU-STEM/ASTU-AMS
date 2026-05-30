import { Router } from 'express';
import { RegistrarController } from './registrar.controller';
import { authenticateJWT, requireRoles } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// ============ PUBLIC ROUTES (No auth required) ============
// Verify student ID in registrar records (for alumni signup)
router.get('/verify/:studentId', asyncHandler(RegistrarController.verifyStudentId));

// ============ PROTECTED ROUTES (Admin/Registrar only) ============
router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN, Role.REGISTRAR]));

// Graduate data management
router.post('/sync', asyncHandler(RegistrarController.triggerSync));
router.post('/import', upload.single('file'), asyncHandler(RegistrarController.importFile));
router.get('/export', asyncHandler(RegistrarController.exportGraduates));
router.get('/records/:studentId', asyncHandler(RegistrarController.getStudentRecord));
router.get('/logs', asyncHandler(RegistrarController.getLogs));

// Alumni account management
router.get('/alumni', asyncHandler(RegistrarController.getAllAlumni));
router.get('/alumni/:alumniId', asyncHandler(RegistrarController.getAlumniDetails));
router.put('/alumni/:alumniId/status', asyncHandler(RegistrarController.updateAlumniStatus));
router.post('/alumni/:alumniId/approve', asyncHandler(RegistrarController.approveAlumni));
router.post('/alumni/:alumniId/suspend', asyncHandler(RegistrarController.suspendAlumni));
router.post('/alumni/:alumniId/inactivate', asyncHandler(RegistrarController.inactivateAlumni));

// Dashboard and analytics
router.get('/dashboard', asyncHandler(RegistrarController.getDashboard));

export default router;

import { Router } from 'express';
import { RegistrarController } from './registrar.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

// Public verification route for registration
router.get('/verify/:studentId', asyncHandler(RegistrarController.verifyStudentId));

// Protected registrar routes
router.use(authenticateJWT);
router.use(requireRoles([Role.ADMIN, Role.REGISTRAR]));

router.post('/import', upload.single('file'), asyncHandler(RegistrarController.importFile));
router.get('/logs', asyncHandler(RegistrarController.getLogs));
router.post('/fetch-graduates/:year', asyncHandler(RegistrarController.fetchGraduatesByYear));

router.get('/students/:studentId', asyncHandler(RegistrarController.getStudentRecord));

// Alumni Management from Registrar view
router.get('/alumni', asyncHandler(RegistrarController.getAllAlumni));
router.get('/alumni/:alumniId', asyncHandler(RegistrarController.getAlumniDetails));
router.put('/alumni/:alumniId/status', asyncHandler(RegistrarController.updateAlumniStatus));
router.post('/alumni/:alumniId/approve', asyncHandler(RegistrarController.approveAlumni));
router.post('/alumni/:alumniId/suspend', asyncHandler(RegistrarController.suspendAlumni));

export default router;

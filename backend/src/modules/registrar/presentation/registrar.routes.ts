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
router.post('/fetch-graduates/current-and-previous', asyncHandler(RegistrarController.fetchCurrentAndPreviousGraduates));

router.get('/dashboard', asyncHandler(RegistrarController.getDashboardSummary));
router.get('/students/:studentId', asyncHandler(RegistrarController.getStudentRecord));
router.get('/graduates', asyncHandler(RegistrarController.getAllGraduates));
router.post('/graduates', asyncHandler(RegistrarController.addGraduate));
router.put('/graduates/:id', asyncHandler(RegistrarController.updateGraduate));
router.get('/verifications', asyncHandler(RegistrarController.getVerifications));
router.patch('/verifications/:requestId', asyncHandler(RegistrarController.resolveVerification));

// Document Requests (Manual verification)
router.get('/document-requests', asyncHandler(RegistrarController.getDocumentRequests));

// Alumni Management from Registrar view
router.get('/alumni', asyncHandler(RegistrarController.getAllAlumni));
router.get('/alumni/:alumniId', asyncHandler(RegistrarController.getAlumniDetails));
router.put('/alumni/:alumniId/status', asyncHandler(RegistrarController.updateAlumniStatus));
router.post('/alumni/:alumniId/approve', asyncHandler(RegistrarController.approveAlumni));
router.post('/alumni/:alumniId/suspend', asyncHandler(RegistrarController.suspendAlumni));

export default router;

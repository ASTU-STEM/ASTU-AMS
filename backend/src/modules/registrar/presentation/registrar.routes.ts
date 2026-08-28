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

router.get('/students/:studentId', asyncHandler(RegistrarController.getStudentRecord));

// Document Requests (Manual verification)
router.get('/document-requests', asyncHandler(RegistrarController.getDocumentRequests));

// Alumni Management from Registrar view
router.get('/alumni', asyncHandler(RegistrarController.getAllAlumni));
router.get('/alumni/:alumniId', asyncHandler(RegistrarController.getAlumniDetails));
router.put('/alumni/:alumniId/status', asyncHandler(RegistrarController.updateAlumniStatus));
router.post('/alumni/:alumniId/approve', asyncHandler(RegistrarController.approveAlumni));
router.post('/alumni/:alumniId/suspend', asyncHandler(RegistrarController.suspendAlumni));

// Registration Issues (Data Correction Requests)
router.get('/registration-issues', asyncHandler(RegistrarController.getRegistrationIssues));
router.put('/registration-issues/:id/resolve', asyncHandler(RegistrarController.resolveRegistrationIssue));
router.post('/registration-issues/:id/create-account', asyncHandler(RegistrarController.createAccountFromIssue));

// SIS Records & Batch Import
router.get('/sis-records', asyncHandler(RegistrarController.getSisRecords));
router.post('/batch-import', asyncHandler(RegistrarController.batchImport));

// Dashboard Stats
router.get('/dashboard-stats', asyncHandler(RegistrarController.getDashboardStats));

// Verifications
router.get('/verifications', asyncHandler(RegistrarController.getVerifications));
router.patch('/verifications/:id/status', asyncHandler(RegistrarController.updateVerificationStatus));

// Document Status Update
router.patch('/document-requests/:id/status', asyncHandler(RegistrarController.updateDocumentStatus));
router.post('/document-requests/:id/approve', upload.single('document'), asyncHandler(RegistrarController.approveDocumentRequest));

export default router;

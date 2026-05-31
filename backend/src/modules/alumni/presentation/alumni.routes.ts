import { Router } from 'express';
import { AlumniController } from './alumni.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../../core/utils/asyncHandler';
// Using a mock upload middleware or assuming it exists, since this is clean arch 
// we will just define the routes
import multer from 'multer';

// Dummy multer setup for route definition
const upload = multer({ dest: 'uploads/' });

const router = Router();

router.use(authenticateJWT);
router.use(requireRoles([Role.ALUMNI]));

// Profile
router.get('/me', asyncHandler(AlumniController.getMe));
router.put('/me', asyncHandler(AlumniController.updateMe));

// Work Experience
router.post('/experiences', asyncHandler(AlumniController.addExperience));
router.put('/experiences/:id', asyncHandler(AlumniController.updateExperience));
router.delete('/experiences/:id', asyncHandler(AlumniController.deleteExperience));

// Files
router.post('/upload', upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'profilePicture', maxCount: 1 }]), asyncHandler(AlumniController.uploadFiles));

// Documents
router.post('/document-requests', asyncHandler(AlumniController.requestDocument));
router.get('/document-requests', asyncHandler(AlumniController.getMyDocuments));

export default router;

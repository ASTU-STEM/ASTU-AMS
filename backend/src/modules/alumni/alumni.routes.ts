import { Router } from 'express';
import { AlumniController } from './alumni.controller';
import { authenticateJWT, requireRoles } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Protect all alumni routes to ALUMNI role
router.use(authenticateJWT);
router.use(requireRoles([Role.ALUMNI]));

router.get('/me', asyncHandler(AlumniController.getMe));
router.put('/me', asyncHandler(AlumniController.updateMe));

router.post('/experiences', asyncHandler(AlumniController.addExperience));
router.put('/experiences/:id', asyncHandler(AlumniController.updateExperience));
router.delete('/experiences/:id', asyncHandler(AlumniController.deleteExperience));

// Multer upload route
router.post(
  '/upload',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 },
  ]),
  asyncHandler(AlumniController.uploadFiles)
);

router.post('/document-requests', asyncHandler(AlumniController.requestDocument));
router.get('/document-requests', asyncHandler(AlumniController.getMyDocuments));

export default router;

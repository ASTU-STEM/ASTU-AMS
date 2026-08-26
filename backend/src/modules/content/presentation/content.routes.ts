import { Router } from 'express';
import { optionalAuthenticateJWT, authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
import {
  getContentController,
  createContentController,
  updateContentController,
  deleteContentController,
} from './content.controller';

const router = Router();

// Publicly available GET endpoint for public landing pages and directory
router.get('/', optionalAuthenticateJWT, getContentController);

router.post('/', optionalAuthenticateJWT, createContentController);
router.put('/:id', optionalAuthenticateJWT, updateContentController);
router.delete('/:id', optionalAuthenticateJWT, deleteContentController);

export default router;

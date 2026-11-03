import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Role } from '@prisma/client';
import { SupportController } from './support.controller';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';

const router = Router();
const adminSupportRoles = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.ALUMNI_OFFICE,
  'SUPER_ADMIN',
  'ADMIN',
  'ALUMNI_OFFICE',
];

// Configure multer storage for support attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads/Support');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `support_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Public / User ticket creation
router.post('/tickets', upload.any(), SupportController.submitTicket);

// Admin Ticket Management endpoints (JWT + admin roles required)
router.get('/tickets', authenticateJWT, requireRoles(adminSupportRoles), SupportController.getTickets);
router.get('/tickets/:id', authenticateJWT, requireRoles(adminSupportRoles), SupportController.getTicketById);
router.put('/tickets/:id/status', authenticateJWT, requireRoles(adminSupportRoles), SupportController.updateTicketStatus);
router.post('/tickets/:id/escalate', authenticateJWT, requireRoles(adminSupportRoles), SupportController.escalateToIct);

export default router;

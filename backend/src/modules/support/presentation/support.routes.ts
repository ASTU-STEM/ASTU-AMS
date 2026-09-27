import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Role } from '@prisma/client';
import { authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { SupportController } from './support.controller';

const router = Router();

// Staff who may read and act on the shared support queue.
const adminRoles = [Role.ADMIN, Role.SUPER_ADMIN, Role.ALUMNI_OFFICE, Role.REGISTRAR];

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

// Ticket creation is available to any signed-in user, but still requires a session
// so that anonymous callers cannot open tickets or exhaust the 5MB upload quota.
router.post('/tickets', authenticateJWT, upload.any(), SupportController.submitTicket);

// Admin Ticket Management endpoints
router.get('/tickets', authenticateJWT, requireRoles(adminRoles), SupportController.getTickets);
router.get('/tickets/:id', authenticateJWT, requireRoles(adminRoles), SupportController.getTicketById);
router.put('/tickets/:id/status', authenticateJWT, requireRoles(adminRoles), SupportController.updateTicketStatus);
router.post('/tickets/:id/escalate', authenticateJWT, requireRoles(adminRoles), SupportController.escalateToIct);

export default router;

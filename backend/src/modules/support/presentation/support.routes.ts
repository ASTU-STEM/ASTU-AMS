import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { SupportController } from './support.controller';

const router = Router();

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

// We accept up to 2 attachments (as frontend limits it to 2)
// Frontend sends `attachment_0`, `attachment_1` etc. So we use `upload.any()` or mapped fields.
router.post('/tickets', upload.any(), SupportController.submitTicket);

export default router;

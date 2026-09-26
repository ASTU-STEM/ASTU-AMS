import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { optionalAuthenticateJWT, authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import {
  getContentController,
  getContentByIdOrSlugController,
  createContentController,
  updateContentController,
  deleteContentController,
  getHomepageConfigController,
  saveHomepageConfigController,
  uploadMediaController,
  getMediaAssetsController,
  deleteMediaAssetController,
} from './content.controller';

const router = Router();

// Ensure uploads/cms directory exists
const CMS_UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'cms');
if (!fs.existsSync(CMS_UPLOADS_DIR)) {
  fs.mkdirSync(CMS_UPLOADS_DIR, { recursive: true });
}

// Multer configuration for CMS media assets
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CMS_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${baseName}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed.'));
    }
  },
});

// ─── Public Endpoints (Accessible by Landing Page & Directory) ───
router.get('/homepage/config', optionalAuthenticateJWT, getHomepageConfigController);
router.get('/media', optionalAuthenticateJWT, getMediaAssetsController);
router.get('/', optionalAuthenticateJWT, getContentController);
router.get('/:id', optionalAuthenticateJWT, getContentByIdOrSlugController);

// ─── Administrative CMS Endpoints (Flexible JWT for dev/testing) ───
router.put('/homepage/config', optionalAuthenticateJWT, saveHomepageConfigController);
router.post('/media/upload', optionalAuthenticateJWT, upload.single('file'), uploadMediaController);
router.delete('/media/:id', optionalAuthenticateJWT, deleteMediaAssetController);

router.post('/', optionalAuthenticateJWT, createContentController);
router.put('/:id', optionalAuthenticateJWT, updateContentController);
router.delete('/:id', optionalAuthenticateJWT, deleteContentController);

export default router;

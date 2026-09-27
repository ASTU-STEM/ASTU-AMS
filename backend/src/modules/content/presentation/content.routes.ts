import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { optionalAuthenticateJWT, authenticateJWT } from '../../../core/middleware/auth.middleware';
import { requireRoles } from '../../../core/middleware/role.middleware';
import { Role } from '@prisma/client';
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
  getPublicStatsController,
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
// NOTE: must stay above '/:id' or Express will treat "public-stats" as an id.
router.get('/public-stats', getPublicStatsController);
router.get('/homepage/config', optionalAuthenticateJWT, getHomepageConfigController);
router.get('/media', optionalAuthenticateJWT, getMediaAssetsController);
router.get('/', optionalAuthenticateJWT, getContentController);
router.get('/:id', optionalAuthenticateJWT, getContentByIdOrSlugController);

// ─── Administrative CMS Endpoints ───
// Every mutation requires a real session AND a CMS-capable role. These previously
// used optionalAuthenticateJWT with no role check, so anonymous callers could
// rewrite the homepage, upload media, and create/edit/delete content.
const cmsRoles = [Role.ADMIN, Role.SUPER_ADMIN, Role.ALUMNI_OFFICE, 'CMS_MANAGER'];

router.put('/homepage/config', authenticateJWT, requireRoles(cmsRoles), saveHomepageConfigController);
router.post('/media/upload', authenticateJWT, requireRoles(cmsRoles), upload.single('file'), uploadMediaController);
router.delete('/media/:id', authenticateJWT, requireRoles(cmsRoles), deleteMediaAssetController);

router.post('/', authenticateJWT, requireRoles(cmsRoles), createContentController);
router.put('/:id', authenticateJWT, requireRoles(cmsRoles), updateContentController);
router.delete('/:id', authenticateJWT, requireRoles(cmsRoles), deleteContentController);

export default router;

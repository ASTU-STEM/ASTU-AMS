import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directories exist
const profileDirs = [
  path.join(UPLOADS_DIR, 'profiles'),
  path.join(UPLOADS_DIR, 'resumes'),
  path.join(UPLOADS_DIR, 'certifications'),
  path.join(UPLOADS_DIR, 'documents')
];

profileDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Dangerous executable file extensions to explicitly reject
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.sh', '.bat', '.cmd', '.js', '.php', '.py', '.pl', '.cgi', 
  '.asp', '.aspx', '.jar', '.vbs', '.ps1', '.html', '.htm', '.xhtml', '.svg'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, path.join(UPLOADS_DIR, 'profiles'));
    } else if (file.fieldname === 'resume') {
      cb(null, path.join(UPLOADS_DIR, 'resumes'));
    } else if (file.fieldname === 'certificateImage' || file.fieldname === 'certificationImage') {
      cb(null, path.join(UPLOADS_DIR, 'certifications'));
    } else {
      cb(null, path.join(UPLOADS_DIR, 'documents'));
    }
  },
  filename: (req, file, cb) => {
    // Sanitize original filename (remove path traversal characters)
    const sanitizedBase = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedBase).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Reject explicitly blacklisted extensions
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Security Error: Uploading file type '${ext}' is strictly prohibited.`));
  }

  if (file.fieldname === 'avatar') {
    // Accept valid images only
    const validImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (validImageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Security Error: Only JPEG, PNG, WEBP, or GIF images are permitted for avatars.'));
    }
  } else if (file.fieldname === 'resume' || file.fieldname === 'document') {
    // Accept PDF and Word documents
    const validDocMimes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (validDocMimes.includes(file.mimetype) || file.mimetype.includes('pdf') || file.mimetype.includes('word')) {
      cb(null, true);
    } else {
      cb(new Error('Security Error: Only PDF, Word, CSV, or Excel documents are permitted.'));
    }
  } else {
    cb(null, true);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Hard limit: 10MB
  }
});

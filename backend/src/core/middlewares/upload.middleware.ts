import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure directories exist
const profileDirs = [
  path.join(UPLOADS_DIR, 'profiles'),
  path.join(UPLOADS_DIR, 'resumes')
];

profileDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, path.join(UPLOADS_DIR, 'profiles'));
    } else if (file.fieldname === 'resume') {
      cb(null, path.join(UPLOADS_DIR, 'resumes'));
    } else {
      cb(null, UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'avatar') {
    // accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed for avatars.'));
    }
  } else if (file.fieldname === 'resume') {
    // accept pdf/doc
    if (file.mimetype === 'application/pdf' || file.mimetype.includes('word')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or Word documents are allowed for resumes.'));
    }
  } else {
    cb(null, true);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

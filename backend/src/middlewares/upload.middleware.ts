import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.ts';

// Ensure folders exist
const uploadDirs = ['uploads/cvs', 'uploads/profiles', 'uploads/documents', 'uploads/excel'];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/documents';
    if (file.fieldname === 'cv') {
      folder = 'uploads/cvs';
    } else if (file.fieldname === 'profilePicture') {
      folder = 'uploads/profiles';
    } else if (file.fieldname === 'excel' || file.fieldname === 'file') {
      folder = 'uploads/excel';
    }
    cb(null, path.join(process.cwd(), folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xlsx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Supported formats: ${allowedExtensions.join(', ')}`));
    }
  },
});

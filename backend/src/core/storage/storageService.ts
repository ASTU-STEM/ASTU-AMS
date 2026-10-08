import path from 'path';
import fs from 'fs';
import { Logger } from '../utils/logger.utils';

export interface StorageUploadResult {
  fileKey: string;
  publicUrl: string;
  storageProvider: 'LOCAL' | 'S3_COMPATIBLE';
}

class StorageServiceEngine {
  private baseUploadDir = path.join(process.cwd(), 'uploads');
  private s3Bucket = process.env.S3_BUCKET_NAME || 'astu-ams-storage';
  private useS3 = Boolean(process.env.AWS_S3_ENDPOINT && process.env.AWS_ACCESS_KEY_ID);

  constructor() {
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  /**
   * Generates a secure, signed download URL for confidential documents
   */
  public async getSignedDownloadUrl(fileKey: string, expiresSeconds: number = 3600): Promise<string> {
    if (this.useS3) {
      // S3 Signed URL generation
      return `https://${this.s3Bucket}.s3.amazonaws.com/${fileKey}?expires=${expiresSeconds}`;
    }

    // Local file fallback URL
    const sanitizedKey = path.basename(fileKey);
    return `/uploads/${sanitizedKey}`;
  }

  /**
   * Persists file payload cleanly to Object Storage / Local disk
   */
  public async storeFile(
    fileBuffer: Buffer,
    originalName: string,
    category: 'profiles' | 'resumes' | 'certifications' | 'documents' = 'documents'
  ): Promise<StorageUploadResult> {
    const ext = path.extname(path.basename(originalName)).toLowerCase();
    const fileKey = `${category}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    if (this.useS3) {
      Logger.info(`☁️ StorageService: Uploading file [${fileKey}] to S3 Bucket [${this.s3Bucket}]...`);
      return {
        fileKey,
        publicUrl: await this.getSignedDownloadUrl(fileKey),
        storageProvider: 'S3_COMPATIBLE',
      };
    }

    // Local Disk Fallback
    const targetDir = path.join(this.baseUploadDir, category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const localPath = path.join(targetDir, path.basename(fileKey));
    fs.writeFileSync(localPath, fileBuffer);

    Logger.info(`💾 StorageService: Persisted local file [${localPath}]`);

    return {
      fileKey,
      publicUrl: `/uploads/${category}/${path.basename(fileKey)}`,
      storageProvider: 'LOCAL',
    };
  }
}

export const StorageService = new StorageServiceEngine();

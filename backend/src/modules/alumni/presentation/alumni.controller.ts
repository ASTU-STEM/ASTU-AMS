import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { updateAlumniProfileSchema, addExperienceSchema, documentRequestSchema } from './alumni.validation';

import { PrismaAlumniProfileRepository } from '../infrastructure/repositories/PrismaAlumniProfileRepository';
import { PrismaWorkExperienceRepository } from '../infrastructure/repositories/PrismaWorkExperienceRepository';
import { PrismaDocumentRequestRepository } from '../infrastructure/repositories/PrismaDocumentRequestRepository';
import { PrismaAuditLogger } from '../infrastructure/repositories/PrismaAuditLogger';

import { GetAlumniProfile } from '../application/use-cases/GetAlumniProfile';
import { UpdateAlumniProfile } from '../application/use-cases/UpdateAlumniProfile';
import { AddWorkExperience, UpdateWorkExperience, DeleteWorkExperience } from '../application/use-cases/ManageWorkExperience';
import { UploadAlumniFiles } from '../application/use-cases/UploadAlumniFiles';
import { RequestDocument, GetMyDocuments } from '../application/use-cases/DocumentRequests';

const alumniRepo = new PrismaAlumniProfileRepository();
const expRepo = new PrismaWorkExperienceRepository();
const docRepo = new PrismaDocumentRequestRepository();
const logger = new PrismaAuditLogger();

export class AlumniController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetAlumniProfile(alumniRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Profile retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = updateAlumniProfileSchema.parse(req.body);
      const useCase = new UpdateAlumniProfile(alumniRepo);
      const result = await useCase.execute(userId, parsedData);
      return sendSuccess(res, 'Profile updated successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async addExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = addExperienceSchema.parse(req.body);
      const useCase = new AddWorkExperience(alumniRepo, expRepo);
      const result = await useCase.execute(userId, parsedData);
      return sendSuccess(res, 'Work experience added successfully', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const parsedData = addExperienceSchema.parse(req.body);
      const useCase = new UpdateWorkExperience(alumniRepo, expRepo);
      const result = await useCase.execute(userId, id, parsedData);
      return sendSuccess(res, 'Work experience updated successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async deleteExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const useCase = new DeleteWorkExperience(alumniRepo, expRepo);
      await useCase.execute(userId, id);
      return sendSuccess(res, 'Work experience deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }

  static async uploadFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      
      const updateData: { resumeUrl?: string; profilePicture?: string } = {};

      if (req.files && typeof req.files === 'object') {
        const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (filesMap['cv'] && filesMap['cv'][0]) {
          updateData.resumeUrl = `/uploads/cvs/${filesMap['cv'][0].filename}`;
        }
        if (filesMap['profilePicture'] && filesMap['profilePicture'][0]) {
          updateData.profilePicture = `/uploads/profiles/${filesMap['profilePicture'][0].filename}`;
        }
      }

      const useCase = new UploadAlumniFiles(alumniRepo);
      const result = await useCase.execute(userId, updateData);

      return sendSuccess(res, 'Files uploaded and profile updated successfully', {
        resumeUrl: result.resumeUrl,
        profilePicture: result.profilePicture,
      });
    } catch (err) {
      next(err);
    }
  }

  static async requestDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = documentRequestSchema.parse(req.body);
      const useCase = new RequestDocument(alumniRepo, docRepo, logger);
      const result = await useCase.execute(userId, parsedData, req.ip || 'unknown');
      return sendSuccess(res, 'Document request submitted successfully.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getMyDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const useCase = new GetMyDocuments(alumniRepo, docRepo);
      const result = await useCase.execute(userId);
      return sendSuccess(res, 'Fetched document requests successfully', result);
    } catch (err) {
      next(err);
    }
  }
}

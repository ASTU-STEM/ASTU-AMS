import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { updateAlumniProfileSchema, addExperienceSchema, documentRequestSchema } from './alumni.validation';
import { sendSuccess, sendError } from '../../utils/response.utils';

export class AlumniController {
  /**
   * Fetch own profile.
   * Route: GET /api/alumni/me
   */
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      const profile = await prisma.alumniProfile.findUnique({
        where: { userId },
        include: {
          department: true,
          experiences: { orderBy: { startDate: 'desc' } },
        },
      });

      if (!profile) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      return sendSuccess(res, 'Profile retrieved successfully', profile);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update own profile.
   * Route: PUT /api/alumni/me
   */
  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = updateAlumniProfileSchema.parse(req.body);

      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!profile) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const updatedProfile = await prisma.alumniProfile.update({
        where: { userId },
        data: {
          fullName: parsedData.fullName,
          phone: parsedData.phone,
          dateOfBirth: parsedData.dateOfBirth,
          skills: parsedData.skills,
          linkedIn: parsedData.linkedIn,
          gitHub: parsedData.gitHub,
          portfolio: parsedData.portfolio,
          telegram: parsedData.telegram,
        },
      });

      return sendSuccess(res, 'Profile updated successfully', updatedProfile);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Add professional work experience.
   * Route: POST /api/alumni/experiences
   */
  static async addExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = addExperienceSchema.parse(req.body);

      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!profile) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const experience = await prisma.workExperience.create({
        data: {
          alumniId: profile.id,
          companyName: parsedData.companyName,
          position: parsedData.position,
          industry: parsedData.industry,
          salaryRange: parsedData.salaryRange,
          location: parsedData.location,
          isCurrent: parsedData.isCurrent,
          startDate: parsedData.startDate,
          endDate: parsedData.endDate || null,
        },
      });

      return sendSuccess(res, 'Work experience added successfully', experience, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Update work experience details.
   * Route: PUT /api/alumni/experiences/:id
   */
  static async updateExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const parsedData = addExperienceSchema.parse(req.body);

      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!profile) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const experience = await prisma.workExperience.findUnique({ where: { id } });
      if (!experience || experience.alumniId !== profile.id) {
        return sendError(res, 'Work experience not found or unauthorized', null, 404);
      }

      const updated = await prisma.workExperience.update({
        where: { id },
        data: {
          companyName: parsedData.companyName,
          position: parsedData.position,
          industry: parsedData.industry,
          salaryRange: parsedData.salaryRange,
          location: parsedData.location,
          isCurrent: parsedData.isCurrent,
          startDate: parsedData.startDate,
          endDate: parsedData.endDate || null,
        },
      });

      return sendSuccess(res, 'Work experience updated successfully', updated);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Delete work experience item.
   * Route: DELETE /api/alumni/experiences/:id
   */
  static async deleteExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!profile) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const experience = await prisma.workExperience.findUnique({ where: { id } });
      if (!experience || experience.alumniId !== profile.id) {
        return sendError(res, 'Work experience not found or unauthorized', null, 404);
      }

      await prisma.workExperience.delete({ where: { id } });
      return sendSuccess(res, 'Work experience deleted successfully', null);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Handles CV & Profile Picture File upload.
   * Route: POST /api/alumni/upload
   */
  static async uploadFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });

      if (!profile) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

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

      if (Object.keys(updateData).length === 0) {
        return sendError(res, 'No files were uploaded. Make sure field names are "cv" or "profilePicture"', null, 400);
      }

      const updated = await prisma.alumniProfile.update({
        where: { userId },
        data: updateData,
      });

      return sendSuccess(res, 'Files uploaded and profile updated successfully', {
        resumeUrl: updated.resumeUrl,
        profilePicture: updated.profilePicture,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Request official academic documents (Transcript, certificate verification, etc.)
   * Route: POST /api/alumni/document-requests
   */
  static async requestDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const parsedData = documentRequestSchema.parse(req.body);

      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!profile) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const docRequest = await prisma.documentRequest.create({
        data: {
          alumniId: profile.id,
          documentType: parsedData.documentType,
          additionalInstructions: parsedData.additionalInstructions,
        },
      });

      // Notify Registrar office via Audit Log / system
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DOCUMENT_REQUEST',
          details: `Alumni requested ${parsedData.documentType}`,
          ipAddress: req.ip,
        },
      });

      return sendSuccess(res, 'Document request submitted successfully.', docRequest, 201);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * List submitted document requests.
   * Route: GET /api/alumni/document-requests
   */
  static async getMyDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });
      if (!profile) {
        return sendError(res, 'Alumni profile not found', null, 404);
      }

      const requests = await prisma.documentRequest.findMany({
        where: { alumniId: profile.id },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, 'Fetched document requests successfully', requests);
    } catch (err: any) {
      next(err);
    }
  }
}

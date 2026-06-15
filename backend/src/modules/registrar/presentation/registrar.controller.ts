import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../../../core/utils/response.utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { PrismaGraduateRecordRepository } from '../infrastructure/repositories/PrismaGraduateRecordRepository';
import { PrismaSyncLogRepository } from '../infrastructure/repositories/PrismaSyncLogRepository';
import { PrismaRegistrarAlumniRepository } from '../infrastructure/repositories/PrismaRegistrarAlumniRepository';

import { ImportGraduateData } from '../application/use-cases/ImportGraduateData';
import { GetGraduateRecord, VerifyStudentId } from '../application/use-cases/GraduateLookups';
import { GetAllGraduateRecords } from '../application/use-cases/GetAllGraduateRecords';
import { GetPendingVerifications } from '../application/use-cases/GetPendingVerifications';
import { ManageAlumniStatus } from '../application/use-cases/ManageAlumniStatus';
import { FetchGraduatesByAPI } from '../application/use-cases/FetchGraduatesByAPI';

import { updateAlumniStatusSchema } from './registrar.validation';
// We will mock CSV parsing here since it's just a controller representation
import fs from 'fs';
import csvParser from 'csv-parser';

const gradRepo = new PrismaGraduateRecordRepository();
const syncRepo = new PrismaSyncLogRepository();
const alumniRepo = new PrismaRegistrarAlumniRepository();
// Real app would have a PrismaAuditLogger injected here
const loggerMock = {
  log: async (userId: string, action: string, details: string, ipAddress: string) => {
    console.log(`[AUDIT] ${userId} - ${action}: ${details} from ${ipAddress}`);
  }
};

export class RegistrarController {
  
  static async importFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      if (!file) throw new Error('No file uploaded.');

      const results: any[] = [];

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(file.path)
          .pipe(csvParser())
          .on('data', (data) => {
            if (data.studentId && data.fullName) {
              results.push({
                studentId: data.studentId.trim(),
                fullName: data.fullName.trim(),
                department: data.departmentCode?.trim() || 'Unknown',
                departmentCode: data.departmentCode?.trim() || 'UNK',
                cgpa: parseFloat(data.cgpa) || 0.0,
                graduationYear: parseInt(data.graduationYear, 10) || new Date().getFullYear(),
                email: null,
                phone: null,
                source: 'CSV',
                graduationDate: new Date(parseInt(data.graduationYear, 10) || new Date().getFullYear(), 5, 30),
              });
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      // Cleanup uploaded file
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error('Error removing temporary file', e);
      }

      const useCase = new ImportGraduateData(gradRepo, syncRepo);
      const result = await useCase.execute(results);

      return sendSuccess(res, 'File import completed.', result);
    } catch (err: any) {
      next(err);
    }
  }

  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await syncRepo.getHistory();
      return sendSuccess(res, 'Fetched registrar sync history logs.', history);
    } catch (err: any) {
      next(err);
    }
  }

  static async getStudentRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetGraduateRecord(gradRepo);
      const record = await useCase.execute(req.params.studentId);
      return sendSuccess(res, 'Fetched registrar student record.', record);
    } catch (err: any) {
      next(err);
    }
  }

  static async getAllGraduates(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAllGraduateRecords(gradRepo);
      const records = await useCase.execute();
      return sendSuccess(res, 'Fetched all graduate records.', records);
    } catch (err: any) {
      next(err);
    }
  }

  static async getVerifications(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetPendingVerifications(alumniRepo);
      const pendingAlumni = await useCase.execute();
      
      // Map AlumniProfile to the VerificationRequest format expected by frontend
      const verifications = pendingAlumni.map((alumni: any) => ({
        id: alumni.id,
        studentId: alumni.studentId,
        fullName: alumni.fullName,
        email: alumni.email,
        status: alumni.status,
        createdAt: alumni.createdAt,
      }));
      
      return sendSuccess(res, 'Fetched pending verifications.', verifications);
    } catch (err: any) {
      next(err);
    }
  }

  static async verifyStudentId(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new VerifyStudentId(gradRepo);
      const result = await useCase.execute(req.params.studentId);
      return sendSuccess(res, result.valid ? 'Student found in registrar records.' : 'Student not found in registrar records.', result);
    } catch (err: any) {
      next(err);
    }
  }

  static async getAllAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const alumniList = await alumniRepo.findAll(status);
      return sendSuccess(res, 'Fetched all alumni accounts.', alumniList);
    } catch (err: any) {
      next(err);
    }
  }

  static async getAlumniDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const alumni = await alumniRepo.findById(req.params.alumniId);
      if (!alumni) return sendError(res, 'Alumni record not found', null, 404);
      return sendSuccess(res, 'Fetched alumni details.', alumni);
    } catch (err: any) {
      next(err);
    }
  }

  static async updateAlumniStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reason } = updateAlumniStatusSchema.parse(req.body);
      const adminId = (req as any).user?.userId;
      
      const useCase = new ManageAlumniStatus(alumniRepo, loggerMock);
      const result = await useCase.execute(req.params.alumniId, status, reason || '', adminId, req.ip || 'unknown');
      
      return sendSuccess(res, `Alumni status updated to ${status}.`, result);
    } catch (err: any) {
      next(err);
    }
  }

  static async approveAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user?.userId;
      const useCase = new ManageAlumniStatus(alumniRepo, loggerMock);
      const result = await useCase.execute(req.params.alumniId, 'ACTIVE', 'Approved by registrar', adminId, req.ip || 'unknown');
      return sendSuccess(res, 'Alumni account approved and activated.', result);
    } catch (err: any) {
      next(err);
    }
  }

  static async suspendAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const adminId = (req as any).user?.userId;
      const useCase = new ManageAlumniStatus(alumniRepo, loggerMock);
      const result = await useCase.execute(req.params.alumniId, 'SUSPENDED', reason || 'Suspended by registrar', adminId, req.ip || 'unknown');
      return sendSuccess(res, 'Alumni account suspended.', result);
    } catch (err: any) {
      next(err);
    }
  }

  static async fetchGraduatesByYear(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.params;
      const yearNum = parseInt(year, 10);
      
      if (!yearNum || yearNum < 1900 || yearNum > new Date().getFullYear()) {
        return sendError(res, 'Invalid graduation year', null, 400);
      }

      const fetchService = new FetchGraduatesByAPI();
      const graduates = await fetchService.fetchByYear(yearNum);
      const syncResult = await fetchService.syncGraduatesToAlumniProfiles(graduates);

      return sendSuccess(res, `Fetched and synced graduates for year ${yearNum}.`, {
        year: yearNum,
        totalFetched: graduates.length,
        syncResults: syncResult,
      });
    } catch (err: any) {
      next(err);
    }
  }

  static async fetchCurrentAndPreviousGraduates(req: Request, res: Response, next: NextFunction) {
    try {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      const fetchService = new FetchGraduatesByAPI();

      const currentGraduates = await fetchService.fetchByYear(currentYear);
      const previousGraduates = await fetchService.fetchByYear(previousYear);

      const currentSync = await fetchService.syncGraduatesToAlumniProfiles(currentGraduates);
      const previousSync = await fetchService.syncGraduatesToAlumniProfiles(previousGraduates);

      return sendSuccess(res, `Fetched and synced graduates for ${currentYear} and ${previousYear}.`, {
        years: [previousYear, currentYear],
        totalFetched: currentGraduates.length + previousGraduates.length,
        syncResults: {
          [previousYear]: previousSync,
          [currentYear]: currentSync,
        },
      });
    } catch (err: any) {
      next(err);
    }
  }

  // View manual verification document requests
  static async getDocumentRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await prisma.documentRequest.findMany({
        include: {
          alumni: {
            select: {
              fullName: true,
              studentId: true,
              graduationYear: true,
              email: true,
              phone: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return sendSuccess(res, 'Fetched document requests.', requests);
    } catch (err: any) {
      next(err);
    }
  }
}

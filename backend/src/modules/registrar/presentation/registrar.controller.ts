import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../../../core/utils/response.utils';

import { PrismaGraduateRecordRepository } from '../infrastructure/repositories/PrismaGraduateRecordRepository';
import { PrismaSyncLogRepository } from '../infrastructure/repositories/PrismaSyncLogRepository';
import { PrismaRegistrarAlumniRepository } from '../infrastructure/repositories/PrismaRegistrarAlumniRepository';

import { ImportGraduateData } from '../application/use-cases/ImportGraduateData';
import { GetGraduateRecord, VerifyStudentId } from '../application/use-cases/GraduateLookups';
import { ManageAlumniStatus } from '../application/use-cases/ManageAlumniStatus';
import { FetchGraduatesByAPI } from '../application/use-cases/FetchGraduatesByAPI';

import { updateAlumniStatusSchema } from './registrar.validation';
// We will mock CSV parsing here since it's just a controller representation
import fs from 'fs';

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

      // Mock implementation of extracting data from CSV/Excel
      // In reality, you'd use 'csv-parser' or 'xlsx' to read `file.path`
      const mockExtractedRecords = [
        { studentId: 'S100', fullName: 'Mock Student 1', department: 'CS', departmentCode: 'CS', cgpa: 3.5, graduationYear: 2022, email: null, phone: null, source: 'EXCEL', graduationDate: new Date() }
      ];

      const useCase = new ImportGraduateData(gradRepo, syncRepo);
      const result = await useCase.execute(mockExtractedRecords);

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
}

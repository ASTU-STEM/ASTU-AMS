import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../../../core/utils/response.utils';
import { PrismaClient } from '@prisma/client';

import prisma from '../../../core/config/db';

import { PrismaGraduateRecordRepository } from '../infrastructure/repositories/PrismaGraduateRecordRepository';
import { PrismaSyncLogRepository } from '../infrastructure/repositories/PrismaSyncLogRepository';
import { PrismaRegistrarAlumniRepository } from '../infrastructure/repositories/PrismaRegistrarAlumniRepository';

import { ImportGraduateData } from '../application/use-cases/ImportGraduateData';
import { GetGraduateRecord, VerifyStudentId } from '../application/use-cases/GraduateLookups';
import { ManageAlumniStatus } from '../application/use-cases/ManageAlumniStatus';
import { FetchGraduatesByAPI } from '../application/use-cases/FetchGraduatesByAPI';
import { ManageUsers } from '../../admin/application/use-cases/ManageUsers';

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

  // Registration Issues (Data Correction Requests)
  static async getRegistrationIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const issues = await prisma.registrationIssue.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return sendSuccess(res, 'Fetched registration issues.', issues);
    } catch (err: any) {
      next(err);
    }
  }

  static async resolveRegistrationIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body; // "RESOLVED" or "REJECTED"
      const issue = await prisma.registrationIssue.update({
        where: { id },
        data: { status: status || 'RESOLVED' },
      });
      return sendSuccess(res, `Registration issue marked as ${issue.status}.`, issue);
    } catch (err: any) {
      next(err);
    }
  }

  static async createAccountFromIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const issue = await prisma.registrationIssue.findUnique({ where: { id } });
      
      if (!issue) {
        return sendError(res, 'Registration issue not found', null, 404);
      }

      const manageUsers = new ManageUsers();

      // Ensure department exists or default to unknown
      const department = 'Unknown'; 
      // The issue doesn't capture department currently, but ManageUsers requires it.
      // We will just pass 'Unknown' and ManageUsers will create/find it.
      
      // Auto-generate password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

      const result = await manageUsers.createUser({
        name: issue.fullName,
        email: issue.contactEmail,
        role: 'Alumni',
        department: department,
        studentId: issue.studentId,
        phone: issue.phoneNumber,
        password: tempPassword
      });

      // Mark the issue as resolved automatically
      const updatedIssue = await prisma.registrationIssue.update({
        where: { id },
        data: { status: 'RESOLVED' },
      });

      return sendSuccess(res, 'Account created, activated and credentials sent.', updatedIssue);
    } catch (err: any) {
      // If error is about existing user, send a nice message
      if (err.message && err.message.includes('already exists')) {
        return sendError(res, err.message, null, 400);
      }
      next(err);
    }
  }

  // SIS Records listing
  static async getSisRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await prisma.registrarStudent.findMany({
        orderBy: { importedAt: 'desc' }
      });
      return sendSuccess(res, 'Fetched SIS records.', records);
    } catch (err: any) {
      next(err);
    }
  }

  // Batch SIS Import (JSON payload)
  static async batchImport(req: Request, res: Response, next: NextFunction) {
    try {
      const records = req.body.records;
      if (!records || !Array.isArray(records)) {
        return sendError(res, 'Invalid payload – records array required', null, 400);
      }

      let importedCount = 0;
      let duplicateCount = 0;

      for (const record of records) {
        const existing = await prisma.registrarStudent.findUnique({
          where: { studentId: record.studentId }
        });
        if (existing) { duplicateCount++; continue; }

        await prisma.registrarStudent.create({
          data: {
            studentId: record.studentId,
            fullName: record.fullName,
            department: record.department,
            departmentCode: record.departmentCode || record.department?.substring(0, 3).toUpperCase() || 'UNK',
            cgpa: parseFloat(record.cgpa) || 0,
            graduationYear: parseInt(record.graduationYear, 10) || new Date().getFullYear(),
            email: record.email || null,
            phone: record.phone || null,
            source: 'CSV_IMPORT'
          }
        });
        importedCount++;
      }

      await prisma.registrarSyncLog.create({
        data: { recordsCount: importedCount, status: 'SUCCESS' }
      });

      return sendSuccess(res, 'Batch import completed.', { imported: importedCount, duplicates: duplicateCount });
    } catch (err: any) {
      next(err);
    }
  }

  // Dashboard KPIs
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const totalSisGraduates = await prisma.registrarStudent.count();
      const verifiedAlumni = await prisma.alumniProfile.count({ where: { isVerified: true } });
      const pendingVerifications = await prisma.verificationRequest.count({ where: { status: 'PENDING' } });
      const pendingDocuments = await prisma.documentRequest.count({ where: { status: 'PENDING' } });
      
      return sendSuccess(res, 'Fetched dashboard stats.', {
        totalSisGraduates,
        verifiedAlumni,
        pendingVerifications,
        pendingDocuments,
      });
    } catch (err: any) {
      next(err);
    }
  }

  // Verifications
  static async getVerifications(req: Request, res: Response, next: NextFunction) {
    try {
      const verifications = await prisma.verificationRequest.findMany({
        include: {
          alumni: {
            select: {
              fullName: true,
              studentId: true,
              email: true,
              department: { select: { name: true } },
              graduationYear: true
            }
          }
        },
        orderBy: { requestDate: 'desc' }
      });
      return sendSuccess(res, 'Fetched verifications.', verifications);
    } catch (err: any) {
      next(err);
    }
  }

  static async updateVerificationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const verification = await prisma.verificationRequest.update({
        where: { id },
        data: { status },
        include: { alumni: { include: { user: true } } }
      });

      // If approved, set alumni profile to verified and active
      if (status === 'APPROVED') {
        await prisma.alumniProfile.update({
          where: { id: verification.alumniId },
          data: { isVerified: true, status: 'ACTIVE' }
        });
      }

      // Notify the alumni by Email
      if (verification.alumni.email) {
        const { EmailService } = require('../../../core/services/EmailService');
        const emailService = new EmailService();
        const subject = status === 'APPROVED' ? 'Your ASTU Alumni Verification is Approved' : 'Your ASTU Alumni Verification is Rejected';
        const message = status === 'APPROVED' 
          ? `Congratulations ${verification.alumni.fullName}! Your manual verification request has been approved by the Registrar. You can now log in to your account.`
          : `Dear ${verification.alumni.fullName}, unfortunately your manual verification request has been rejected by the Registrar. Please contact the registrar office for more information.`;
          
        // Use generic sendMail or a specific template if available.
        // Assuming EmailService has a sendGeneralEmail or similar. If not, we can use raw nodemailer or the sendMail method.
        try {
          await emailService.sendMail({
            to: verification.alumni.email,
            subject,
            html: `<h3>ASTU Alumni Portal</h3><p>${message}</p>`,
          });
        } catch (emailErr) {
          console.error('Failed to send verification email notification:', emailErr);
        }
      }

      return sendSuccess(res, `Verification status updated to ${status}.`, verification);
    } catch (err: any) {
      next(err);
    }
  }

  static async updateDocumentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const docRequest = await prisma.documentRequest.update({
        where: { id },
        data: { status },
        include: { alumni: true }
      });

      if (status === 'REJECTED') {
        const targetEmail = docRequest.contactEmail || docRequest.alumni.email;
        if (targetEmail) {
          const { EmailService } = require('../../../core/services/EmailService');
          const emailService = new EmailService();
          const message = `Dear ${docRequest.alumni.fullName}, unfortunately your document request for ${docRequest.documentType} has been rejected. Please contact the registrar office for more details.`;
          try {
            await emailService.sendMail({
              to: targetEmail,
              subject: 'Update on your Document Request',
              html: `<p>${message}</p>`,
            });
          } catch (e) {
            console.error('Failed to send rejection email:', e);
          }
        }
      }

      return sendSuccess(res, `Document status updated to ${status}.`, docRequest);
    } catch (err: any) {
      next(err);
    }
  }

  static async approveDocumentRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return sendError(res, 'Issued document file is required.', null, 400);
      }

      const filePath = `/uploads/${file.filename}`;

      const docRequest = await prisma.documentRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          issuedDocumentUrl: filePath,
        },
        include: { alumni: true }
      });

      const targetEmail = docRequest.contactEmail || docRequest.alumni.email;
      if (targetEmail) {
        const { EmailService } = require('../../../core/services/EmailService');
        const emailService = new EmailService();
        const portalUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const message = `Dear ${docRequest.alumni.fullName}, your document request for ${docRequest.documentType} has been approved. The document has been uploaded and is now available in your Alumni Portal.`;
        try {
          await emailService.sendMail({
            to: targetEmail,
            subject: 'Your Document Request is Approved',
            html: `<p>${message}</p><p><a href="${portalUrl}">Log in to your portal</a> to view and download it.</p>`,
          });
        } catch (e) {
          console.error('Failed to send approval email:', e);
        }
      }

      return sendSuccess(res, 'Document approved and uploaded successfully.', docRequest);
    } catch (err: any) {
      next(err);
    }
  }
}

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
      const logs = await prisma.registrarSyncLog.findMany({
        orderBy: { syncedAt: 'desc' },
        take: 50
      });

      const formattedLogs = logs.map(log => {
        let details: any = {};
        if (log.errors) {
          try { details = JSON.parse(log.errors); } catch (_) { }
        }

        return {
          id: log.id,
          syncedAt: log.syncedAt,
          recordsCount: log.recordsCount,
          status: log.status,
          fileName: details.fileName || 'sis_batch_import.csv',
          total: details.total || log.recordsCount,
          imported: details.imported || log.recordsCount,
          duplicates: details.duplicates || 0
        };
      });

      return sendSuccess(res, 'Fetched registrar sync history logs.', formattedLogs);
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
            include: {
              department: true,
              experiences: true,
              certifications: true,
              projects: true,
              achievements: true,
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
      const { status, fullName, studentId, graduationYear, email, phone } = req.body; // "RESOLVED" or "REJECTED"
      const issue = await prisma.registrationIssue.update({
        where: { id },
        data: {
          status: status || 'RESOLVED',
          fullName: fullName || undefined,
          studentId: studentId || undefined,
          graduationYear: graduationYear || undefined,
          contactEmail: email || undefined,
          phoneNumber: phone || undefined,
        },
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

      // Allow Registrar field overrides from req.body or fallback to issue fields
      const fullName = req.body?.fullName || issue.fullName;
      const cleanStudentId = String(req.body?.studentId || issue.studentId).trim().toUpperCase();
      const gradYear = parseInt(String(req.body?.graduationYear || issue.graduationYear), 10) || new Date().getFullYear();
      const contactEmail = req.body?.email || issue.contactEmail;
      const phone = req.body?.phone || issue.phoneNumber;
      
      let departmentStr = req.body?.department || 'Computer Science & Engineering'; 
      if (!req.body?.department && issue.issueDescription) {
        const match = issue.issueDescription.match(/Department:\s*([^\n\r;]+)/i);
        if (match && match[1]) {
          departmentStr = match[1].trim();
        }
      }

      const cgpa = parseFloat(req.body?.cgpa) || 3.5;
      const nationality = req.body?.nationality || 'Ethiopian';
      let dateOfBirth: Date | null = null;
      if (req.body?.dateOfBirth) {
        const d = new Date(req.body.dateOfBirth);
        if (!isNaN(d.getTime())) dateOfBirth = d;
      }
      
      // Auto-generate password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

      // 1. Create User & AlumniProfile via ManageUsers
      const manageUsers = new ManageUsers();
      await manageUsers.createUser({
        name: fullName,
        email: contactEmail,
        role: 'Alumni',
        department: departmentStr,
        studentId: cleanStudentId,
        phone: phone || undefined,
        password: tempPassword
      });

      // 2. Ensure official RegistrarStudent record is stored in SIS DB with all 9 fields
      const deptCode = departmentStr.substring(0, 4).toUpperCase();
      await prisma.registrarStudent.upsert({
        where: { studentId: cleanStudentId },
        update: {
          fullName,
          department: departmentStr,
          departmentCode: deptCode,
          cgpa,
          graduationYear: gradYear,
          email: contactEmail,
          phone: phone || null,
          nationality,
          dateOfBirth
        },
        create: {
          studentId: cleanStudentId,
          fullName,
          department: departmentStr,
          departmentCode: deptCode,
          cgpa,
          graduationYear: gradYear,
          email: contactEmail,
          phone: phone || null,
          nationality,
          dateOfBirth,
          source: 'REGISTRAR_APPEAL_APPROVAL'
        }
      });

      // 3. Update AlumniProfile to ACTIVE & Verified with all profile data
      await prisma.alumniProfile.updateMany({
        where: { studentId: cleanStudentId },
        data: {
          fullName,
          graduationYear: gradYear,
          cgpa,
          nationality,
          dateOfBirth,
          isVerified: true,
          status: 'ACTIVE'
        }
      });

      // 4. Mark the issue as RESOLVED automatically
      const updatedIssue = await prisma.registrationIssue.update({
        where: { id },
        data: { status: 'RESOLVED' },
      });

      return sendSuccess(res, 'Account created with Registrar verified data, SIS master record stored, and credentials sent.', updatedIssue);
    } catch (err: any) {
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
      const { records, fileName } = req.body;
      if (!records || !Array.isArray(records)) {
        return sendError(res, 'Invalid payload – records array required', null, 400);
      }

      let importedCount = 0;
      let duplicateCount = 0;

      for (const record of records) {
        if (!record.studentId || !record.fullName) continue;

        const cleanStudentId = String(record.studentId).trim();
        const existing = await prisma.registrarStudent.findUnique({
          where: { studentId: cleanStudentId }
        });
        if (existing) { duplicateCount++; continue; }

        const deptStr = String(record.department || 'Computer Science and Engineering').trim();
        const deptCode = record.departmentCode || deptStr.substring(0, 3).toUpperCase();

        let parsedDob: Date | null = null;
        if (record.dateOfBirth) {
          const d = new Date(record.dateOfBirth);
          if (!isNaN(d.getTime())) parsedDob = d;
        }

        await prisma.registrarStudent.create({
          data: {
            studentId: cleanStudentId,
            fullName: String(record.fullName).trim(),
            department: deptStr,
            departmentCode: deptCode,
            cgpa: parseFloat(record.cgpa) || 3.0,
            graduationYear: parseInt(String(record.graduationYear), 10) || new Date().getFullYear(),
            email: record.email ? String(record.email).trim() : null,
            phone: record.phone ? String(record.phone).trim() : null,
            nationality: record.nationality ? String(record.nationality).trim() : null,
            dateOfBirth: parsedDob,
            source: fileName ? `IMPORT: ${fileName}` : 'CSV_IMPORT'
          }
        });

        // Seed initial INACTIVE & unverified AlumniProfile so the student can register and claim their account
        const existingProfile = await prisma.alumniProfile.findUnique({
          where: { studentId: cleanStudentId }
        });

        if (!existingProfile) {
          let dept = await prisma.department.findFirst({
            where: { OR: [{ name: { contains: deptStr, mode: 'insensitive' } }, { code: deptCode }] }
          });
          if (!dept) {
            dept = await prisma.department.findFirst();
          }

          if (dept) {
            await prisma.alumniProfile.create({
              data: {
                studentId: cleanStudentId,
                fullName: String(record.fullName).trim(),
                email: record.email ? String(record.email).trim() : null,
                phone: record.phone ? String(record.phone).trim() : null,
                gender: 'Unknown',
                cgpa: parseFloat(record.cgpa) || 3.0,
                graduationYear: parseInt(String(record.graduationYear), 10) || new Date().getFullYear(),
                departmentId: dept.id,
                status: 'INACTIVE',
                isVerified: false
              }
            });
          }
        }

        importedCount++;
      }

      const syncStatus = (importedCount === 0 && records.length > 0) ? 'FAILED' : duplicateCount > 0 ? 'PARTIAL' : 'SUCCESS';
      const logDetails = JSON.stringify({
        fileName: fileName || 'sis_import_template.csv',
        total: records.length,
        imported: importedCount,
        duplicates: duplicateCount
      });

      const log = await prisma.registrarSyncLog.create({
        data: {
          recordsCount: importedCount,
          status: syncStatus as any,
          errors: logDetails
        }
      });

      return sendSuccess(res, 'Batch import completed.', {
        imported: importedCount,
        duplicates: duplicateCount,
        total: records.length,
        log
      });
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

      // Also fetch unverified alumni profiles to ensure complete queue coverage
      const unverifiedAlumni = await prisma.alumniProfile.findMany({
        where: { isVerified: false },
        include: {
          department: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const existingAlumniIds = new Set(verifications.map(v => v.alumniId));

      const unverifiedAsVerifications = unverifiedAlumni
        .filter(a => !existingAlumniIds.has(a.id))
        .map(a => ({
          id: a.id,
          alumniId: a.id,
          type: 'REGISTRATION_CLAIM',
          status: 'PENDING',
          requestDate: a.createdAt,
          notes: `Graduate profile claim awaiting Registrar identity verification.`,
          documentUrl: null,
          alumni: {
            fullName: a.fullName,
            studentId: a.studentId,
            email: a.email || 'N/A',
            department: a.department,
            graduationYear: a.graduationYear
          }
        }));

      const combined = [...verifications, ...unverifiedAsVerifications];

      return sendSuccess(res, 'Fetched verifications.', combined);
    } catch (err: any) {
      next(err);
    }
  }

  static async updateVerificationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const verification = await prisma.verificationRequest.findUnique({
        where: { id },
        include: { alumni: { include: { user: true } } }
      });

      if (verification) {
        await prisma.verificationRequest.update({
          where: { id },
          data: { status },
        });

        if (status === 'APPROVED') {
          const profile = await prisma.alumniProfile.update({
            where: { id: verification.alumniId },
            data: { isVerified: true, status: 'ACTIVE' },
            include: { department: true }
          });

          if (profile && profile.studentId) {
            await prisma.registrarStudent.upsert({
              where: { studentId: profile.studentId },
              update: {
                fullName: profile.fullName,
                department: profile.department?.name || 'Software Engineering',
                departmentCode: profile.department?.code || 'SWE',
                graduationYear: profile.graduationYear || new Date().getFullYear(),
                email: profile.email,
                phone: profile.phone,
                cgpa: profile.cgpa || 3.0,
                nationality: profile.nationality || 'Ethiopian',
                dateOfBirth: profile.dateOfBirth,
                source: 'REGISTRAR_VERIFICATION_APPROVAL'
              },
              create: {
                studentId: profile.studentId,
                fullName: profile.fullName,
                department: profile.department?.name || 'Software Engineering',
                departmentCode: profile.department?.code || 'SWE',
                graduationYear: profile.graduationYear || new Date().getFullYear(),
                email: profile.email,
                phone: profile.phone,
                cgpa: profile.cgpa || 3.0,
                nationality: profile.nationality || 'Ethiopian',
                dateOfBirth: profile.dateOfBirth,
                source: 'REGISTRAR_VERIFICATION_APPROVAL'
              }
            });
          }
        }

        // Notify alumni by email if available
        if (verification.alumni?.email) {
          try {
            const { EmailService } = require('../../../core/services/EmailService');
            const emailService = new EmailService();
            const subject = status === 'APPROVED' ? 'Your ASTU Alumni Verification is Approved' : 'Your ASTU Alumni Verification Status Updated';
            const message = status === 'APPROVED' 
              ? `Congratulations ${verification.alumni.fullName}! Your registration verification has been approved by the Registrar Office.`
              : `Dear ${verification.alumni.fullName}, your registration verification status has been set to ${status}.`;
            await emailService.sendMail({
              to: verification.alumni.email,
              subject,
              html: `<h3>ASTU Registrar Verification Hub</h3><p>${message}</p>`,
            });
          } catch (emailErr) {
            console.error('Failed to send verification email notification:', emailErr);
          }
        }
      } else {
        // Direct AlumniProfile approval/rejection fallback
        const profile = await prisma.alumniProfile.update({
          where: { id },
          data: {
            isVerified: status === 'APPROVED',
            status: status === 'APPROVED' ? 'ACTIVE' : 'INACTIVE'
          },
          include: { department: true }
        });

        if (status === 'APPROVED' && profile && profile.studentId) {
          await prisma.registrarStudent.upsert({
            where: { studentId: profile.studentId },
            update: {
              fullName: profile.fullName,
              department: profile.department?.name || 'Software Engineering',
              departmentCode: profile.department?.code || 'SWE',
              graduationYear: profile.graduationYear || new Date().getFullYear(),
              email: profile.email,
              phone: profile.phone,
              cgpa: profile.cgpa || 3.0,
              nationality: profile.nationality || 'Ethiopian',
              dateOfBirth: profile.dateOfBirth,
              source: 'REGISTRAR_VERIFICATION_APPROVAL'
            },
            create: {
              studentId: profile.studentId,
              fullName: profile.fullName,
              department: profile.department?.name || 'Software Engineering',
              departmentCode: profile.department?.code || 'SWE',
              graduationYear: profile.graduationYear || new Date().getFullYear(),
              email: profile.email,
              phone: profile.phone,
              cgpa: profile.cgpa || 3.0,
              nationality: profile.nationality || 'Ethiopian',
              dateOfBirth: profile.dateOfBirth,
              source: 'REGISTRAR_VERIFICATION_APPROVAL'
            }
          });
        }
      }

      return sendSuccess(res, `Verification status updated to ${status}.`);
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
        include: { alumni: { include: { user: true } } }
      });

      // 1. Send In-App Notification & WebSocket Push
      if (docRequest.alumni?.userId) {
        const title = status === 'REJECTED' 
          ? `❌ Document Request Rejected: ${docRequest.documentType}` 
          : `ℹ️ Document Request Updated: ${docRequest.documentType}`;
        const content = status === 'REJECTED'
          ? `Your document request for ${docRequest.documentType} was rejected. Please contact the registrar office for details.`
          : `Your document request for ${docRequest.documentType} status has been updated to ${status}.`;

        const notif = await prisma.notification.create({
          data: {
            userId: docRequest.alumni.userId,
            title,
            content,
          }
        }).catch(e => console.error('Failed to create in-app notification:', e));

        if (notif) {
          try {
            const { SocketServer } = require('../../../infrastructure/websocket/SocketServer');
            SocketServer.emitToUser(docRequest.alumni.userId, 'notification', notif);
          } catch (e) {}
        }
      }

      // 2. Send SMS Notification
      const targetPhone = docRequest.alumni?.phone;
      if (targetPhone) {
        try {
          const { SmsService } = require('../../../core/services/SmsService');
          const smsService = new SmsService();
          await smsService.sendSms(
            targetPhone,
            `ASTU Registrar: Your request for ${docRequest.documentType} status is now ${status}.`
          );
        } catch (e) {
          console.error('Failed to send SMS:', e);
        }
      }

      // 3. Send Email Notification
      if (status === 'REJECTED') {
        const targetEmail = docRequest.contactEmail || docRequest.alumni?.email || docRequest.alumni?.user?.email;
        if (targetEmail) {
          const { EmailService } = require('../../../core/services/EmailService');
          const emailService = new EmailService();
          const message = `Dear ${docRequest.alumni?.fullName || 'Alumnus'}, unfortunately your document request for ${docRequest.documentType} has been rejected. Please contact the registrar office for more details.`;
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
        include: { alumni: { include: { user: true } } }
      });

      // 1. Send In-App Notification & WebSocket Push
      if (docRequest.alumni?.userId) {
        const notif = await prisma.notification.create({
          data: {
            userId: docRequest.alumni.userId,
            title: `📜 Document Request Approved: ${docRequest.documentType}`,
            content: `Your request for ${docRequest.documentType} has been approved by ASTU Registrar. Log in to your Alumni Portal to view and download your official document.`,
          }
        }).catch(e => console.error('Failed to create in-app notification:', e));

        if (notif) {
          try {
            const { SocketServer } = require('../../../infrastructure/websocket/SocketServer');
            SocketServer.emitToUser(docRequest.alumni.userId, 'notification', notif);
          } catch (e) {}
        }
      }

      // 2. Send SMS Notification
      const targetPhone = docRequest.alumni?.phone;
      if (targetPhone) {
        try {
          const { SmsService } = require('../../../core/services/SmsService');
          const smsService = new SmsService();
          await smsService.sendSms(
            targetPhone,
            `ASTU Registrar: Your request for ${docRequest.documentType} has been APPROVED. Log in to your Alumni Portal to download your document.`
          );
        } catch (e) {
          console.error('Failed to send approval SMS:', e);
        }
      }

      // 3. Send Email Notification
      const targetEmail = docRequest.contactEmail || docRequest.alumni?.email || docRequest.alumni?.user?.email;
      if (targetEmail) {
        const { EmailService } = require('../../../core/services/EmailService');
        const emailService = new EmailService();
        const portalUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const message = `Dear ${docRequest.alumni?.fullName || 'Alumnus'}, your document request for ${docRequest.documentType} has been approved. The document has been uploaded and is now available in your Alumni Portal.`;
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

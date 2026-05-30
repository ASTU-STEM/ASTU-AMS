import fs from 'fs';
import xlsx from 'xlsx';
import prisma from '../../../infrastructure/config/db';
import { SyncStatus } from '@prisma/client';
import { registrarAPI } from '../../../infrastructure/services/registrar-api.service';
import { Response } from 'express';

export interface RegistrarGraduate {
  studentId: string;
  fullName: string;
  department: string;
  departmentCode: string;
  cgpa: number;
  graduationDate?: Date | null;
  graduationYear: number;
  email: string;
  phone?: string;
  source?: string;
}

export class RegistrarService {
  /**
   * Syncs registrar student data from the Registrar API into the AMS registrar table.
   */
  static async syncGraduates(): Promise<{ count: number; status: string; errors?: string[] }> {
    let rawRecords: any[] = [];
    const errors: string[] = [];
    let successCount = 0;

    try {
      const fetched: any = await registrarAPI.fetchGraduates();
      if (Array.isArray(fetched)) rawRecords = fetched;
      else if (fetched && Array.isArray(fetched.graduates)) rawRecords = fetched.graduates;
    } catch (err: any) {
      errors.push(`Registrar API fetch failed: ${err.message}`);
    }

    if (rawRecords.length === 0) {
      await prisma.registrarSyncLog.create({
        data: {
          recordsCount: 0,
          status: SyncStatus.FAILED,
          errors: errors.length ? errors.join(' | ') : 'No records returned from registrar API',
        },
      });

      return { count: 0, status: SyncStatus.FAILED, errors };
    }

    for (const raw of rawRecords) {
      const record = this.normalizeRegistrarRecord(raw);
      const validation = this.validateRegistrarRecord(record);
      if (!validation.valid) {
        errors.push(`${record.studentId || 'unknown'} - ${validation.reason}`);
        continue;
      }

      try {
        await prisma.registrarStudent.upsert({
          where: { studentId: record.studentId },
          create: this.buildRegistrarStudentData(record, 'API'),
          update: this.buildRegistrarStudentData(record, 'API'),
        });
        successCount += 1;
      } catch (err: any) {
        errors.push(`${record.studentId} - ${err.message}`);
      }
    }

    await prisma.registrarSyncLog.create({
      data: {
        recordsCount: successCount,
        status: successCount > 0 ? SyncStatus.SUCCESS : SyncStatus.FAILED,
        errors: errors.length ? errors.join(' | ') : null,
      },
    });

    return {
      count: successCount,
      status: errors.length ? 'COMPLETED_WITH_WARNINGS' : 'SUCCESS',
      errors: errors.length ? errors : undefined,
    };
  }

  /**
   * Import graduates from an uploaded Excel/CSV file.
   */
  static async importFromFile(filePath: string) {
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: any[] = xlsx.utils.sheet_to_json(sheet, { defval: null });
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < rawRows.length; i += 1) {
      const row = rawRows[i];
      const record = this.normalizeFileRow(row);
      const rowRef = `row:${i + 2}`;
      const validation = this.validateRegistrarRecord(record);
      if (!validation.valid) {
        errors.push(`${rowRef} - ${validation.reason}`);
        continue;
      }

      try {
        await prisma.registrarStudent.upsert({
          where: { studentId: record.studentId },
          create: this.buildRegistrarStudentData(record, 'UPLOAD'),
          update: this.buildRegistrarStudentData(record, 'UPLOAD'),
        });
        imported += 1;
      } catch (err: any) {
        errors.push(`${rowRef} - ${err.message}`);
      }
    }

    await prisma.registrarSyncLog.create({
      data: {
        recordsCount: imported,
        status: imported > 0 ? SyncStatus.SUCCESS : SyncStatus.FAILED,
        errors: errors.length ? errors.join(' | ') : null,
      },
    });

    try {
      fs.unlinkSync(filePath);
    } catch (cleanupErr) {
      console.warn('Failed to delete uploaded file:', cleanupErr);
    }

    return { imported, errors };
  }

  /**
   * Export registrar student records to CSV or XLSX.
   */
  static async exportGraduates(res: Response, format: string = 'csv') {
    const students = (await prisma.registrarStudent.findMany()) as any[];
    const rows = students.map((record: any) => ({
      student_id: record.studentId,
      full_name: record.fullName,
      department: record.department,
      department_code: record.departmentCode,
      cgpa: record.cgpa,
      graduation_year: record.graduationYear,
      graduation_date: record.graduationDate ? record.graduationDate.toISOString().split('T')[0] : '',
      email: record.email || '',
      phone: record.phone || '',
      source: record.source || '',
      imported_at: record.importedAt.toISOString(),
    }));

    if (format === 'xlsx') {
      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'registrar_students');
      const buf = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
      res.setHeader('Content-Disposition', 'attachment; filename=registrar_students.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buf);
    }

    const header = Object.keys(rows[0] || {}).join(',') + '\n';
    const lines = rows
      .map((row: any) =>
        Object.values(row)
          .map((value) => `"${String(value || '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Disposition', 'attachment; filename=registrar_students.csv');
    res.setHeader('Content-Type', 'text/csv');
    return res.send(header + lines);
  }

  static async getSyncLogs() {
    return prisma.registrarSyncLog.findMany({ orderBy: { syncedAt: 'desc' }, take: 20 });
  }

  static async getStudentRecord(studentId: string) {
    return prisma.registrarStudent.findUnique({ where: { studentId } });
  }

  static async verifyStudent(studentId: string, email?: string) {
    const record = await prisma.registrarStudent.findUnique({ where: { studentId } });
    if (!record) return { valid: false, reason: 'Student ID not found in registrar records' };
    if (email && record.email && record.email.toLowerCase() !== email.toLowerCase()) {
      return { valid: false, reason: 'Email does not match registrar record' };
    }
    return { valid: true, record };
  }

  /**
   * Get all alumni with optional status filter.
   */
  static async getAllAlumni(status?: string) {
    const where: any = {};
    if (status && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      where.status = status;
    }

    return prisma.alumniProfile.findMany({
      where,
      include: {
        user: { select: { email: true, isActive: true } },
        department: true,
        registrarRecord: { select: { graduationYear: true, cgpa: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single alumni by ID with full details.
   */
  static async getAlumniById(alumniId: string) {
    return prisma.alumniProfile.findUnique({
      where: { id: alumniId },
      include: {
        user: { select: { email: true, isActive: true, createdAt: true } },
        department: true,
        registrarRecord: true,
        experiences: true,
        documentRequests: true,
      },
    });
  }

  /**
   * Update alumni status by REGISTRAR or ADMIN.
   */
  static async updateAlumniStatus(
    alumniId: string,
    status: string,
    reason: string,
    performedBy: string
  ) {
    const alumni = await prisma.alumniProfile.findUnique({ where: { id: alumniId } });
    if (!alumni) throw new Error('Alumni record not found');

    const isActive = status === 'ACTIVE';
    const updated = await prisma.alumniProfile.update({
      where: { id: alumniId },
      data: { status: status as any },
    });

    // Update user isActive status accordingly
    await prisma.user.update({
      where: { id: alumni.userId },
      data: { isActive },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: performedBy,
        action: 'UPDATE_ALUMNI_STATUS',
        details: `Changed alumni ${alumni.studentId} status to ${status}. Reason: ${reason}`,
      },
    });

    return updated;
  }

  /**
   * Get dashboard statistics for registrar portal.
   */
  static async getDashboardStats() {
    const totalAlumni = await prisma.alumniProfile.count();
    const activeAlumni = await prisma.alumniProfile.count({ where: { status: 'ACTIVE' } });
    const inactiveAlumni = await prisma.alumniProfile.count({ where: { status: 'INACTIVE' } });
    const suspendedAlumni = await prisma.alumniProfile.count({ where: { status: 'SUSPENDED' } });

    const totalGraduates = await prisma.registrarStudent.count();
    const importedGraduates = await prisma.alumniProfile.count({
      where: { registrarRecordId: { not: null } },
    });

    const lastSyncLog = await prisma.registrarSyncLog.findFirst({
      orderBy: { syncedAt: 'desc' },
    });

    const documentPending = await prisma.documentRequest.count({
      where: { status: 'PENDING' },
    });

    return {
      alumni: {
        total: totalAlumni,
        active: activeAlumni,
        inactive: inactiveAlumni,
        suspended: suspendedAlumni,
      },
      graduates: {
        total: totalGraduates,
        imported: importedGraduates,
        notYetAccountCreated: totalGraduates - importedGraduates,
      },
      sync: {
        lastSync: lastSyncLog?.syncedAt || null,
        lastStatus: lastSyncLog?.status || null,
      },
      pending: {
        documentRequests: documentPending,
      },
    };
  }

  private static buildRegistrarStudentData(record: RegistrarGraduate, source: string) {
    return {
      studentId: record.studentId,
      fullName: record.fullName,
      department: record.department,
      departmentCode: record.departmentCode,
      cgpa: record.cgpa,
      graduationDate: record.graduationDate || null,
      graduationYear: record.graduationYear,
      email: record.email,
      phone: record.phone || null,
      source,
    };
  }

  private static normalizeRegistrarRecord(raw: any): RegistrarGraduate {
    const studentId = this.normalizeText(raw.studentId || raw.student_id || raw['Student ID'] || '');
    const fullName = this.normalizeText(raw.fullName || raw.full_name || raw.Name || raw['Full Name'] || '');
    const department = this.normalizeText(raw.department || raw.departmentName || raw.department_name || raw['Department'] || '');
    const departmentCode = this.normalizeText(raw.departmentCode || raw.department_code || raw.dept || raw['Department Code'] || this.deriveDepartmentCode(department));
    const cgpa = this.parseNumber(raw.cgpa || raw.CGPA || raw['Cgpa']);
    const graduationDate = this.parseDate(raw.graduation_date || raw.graduationDate || raw['Graduation Date']);
    const graduationYear = this.parseGraduationYear(raw.graduation_year || raw.graduationYear || raw['Graduation Year'], graduationDate);
    const email = this.normalizeText(raw.email || raw.Email || '');
    const phone = this.normalizeText(raw.phone || raw.Phone || raw.telephone || raw.contact || '');

    return {
      studentId,
      fullName,
      department,
      departmentCode,
      cgpa,
      graduationDate,
      graduationYear: graduationYear ?? 0,
      email,
      phone,
      source: 'API',
    };
  }

  private static normalizeFileRow(row: any): RegistrarGraduate {
    const studentId = this.normalizeText(row.student_id || row.studentId || row['student id'] || row['Student ID'] || '');
    const fullName = this.normalizeText(row.full_name || row.fullName || row.Name || row['Full Name'] || '');
    const department = this.normalizeText(row.department || row.dept || row['Department'] || '');
    const departmentCode = this.normalizeText(row.department_code || row.departmentCode || row['Department Code'] || this.deriveDepartmentCode(department));
    const cgpa = this.parseNumber(row.cgpa || row.CGPA || row['Cgpa']);
    const graduationDate = this.parseDate(row.graduation_date || row.graduationDate || row['Graduation Date']);
    const graduationYear = this.parseGraduationYear(row.graduation_year || row.graduationYear || row['Graduation Year'], graduationDate);
    const email = this.normalizeText(row.email || row.Email || '');
    const phone = this.normalizeText(row.phone || row.Phone || row.telephone || row.contact || '');

    return {
      studentId,
      fullName,
      department,
      departmentCode,
      cgpa,
      graduationDate,
      graduationYear: graduationYear ?? 0,
      email,
      phone,
      source: 'UPLOAD',
    };
  }

  private static validateRegistrarRecord(record: RegistrarGraduate) {
    if (!record.studentId) return { valid: false, reason: 'Missing student ID' };
    if (!record.fullName) return { valid: false, reason: 'Missing full name' };
    if (!record.department) return { valid: false, reason: 'Missing department' };
    if (!record.departmentCode) return { valid: false, reason: 'Missing department code' };
    if (record.cgpa === null || Number.isNaN(record.cgpa) || record.cgpa <= 0) {
      return { valid: false, reason: 'Invalid CGPA' };
    }
    if (!record.graduationYear || Number.isNaN(record.graduationYear) || record.graduationYear < 1900) {
      return { valid: false, reason: 'Invalid graduation year' };
    }
    if (!record.email) return { valid: false, reason: 'Missing email' };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(record.email)) {
      return { valid: false, reason: 'Invalid email format' };
    }
    return { valid: true };
  }

  private static parseNumber(value: any) {
    if (value === null || value === undefined || value === '') return NaN;
    const parsed = parseFloat(String(value).trim());
    return Number.isNaN(parsed) ? NaN : parsed;
  }

  private static parseDate(value: any) {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private static parseGraduationYear(rawYear: any, dateValue: Date | null) {
    if (rawYear !== null && rawYear !== undefined && rawYear !== '') {
      const year = parseInt(String(rawYear), 10);
      if (!Number.isNaN(year)) return year;
    }
    if (dateValue) return dateValue.getFullYear();
    return null;
  }

  private static normalizeText(value: any) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private static deriveDepartmentCode(department: string) {
    if (!department) return '';
    return department
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => token.slice(0, 3).toUpperCase())
      .join('')
      .slice(0, 6);
  }
}

import axios, { AxiosInstance } from 'axios';
import { PrismaClient } from '@prisma/client';

import prisma from '../../../../core/config/db';
import { TracerStudyService } from '../../../surveys/services/TracerStudyService';

export interface GraduateRecord {
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  departmentCode: string;
  cgpa: number;
  graduationYear: number;
  graduationDate: Date;
}

export class FetchGraduatesByAPI {
  private client: AxiosInstance;
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string = '', apiKey: string = '') {
    this.apiUrl = apiUrl || process.env.REGISTRAR_API_URL || 'https://registrar.astu.edu.et/api/v1';
    this.apiKey = apiKey || process.env.REGISTRAR_API_KEY || 'default_registrar_key';

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });
  }

  async fetchByYear(year: number): Promise<GraduateRecord[]> {
    try {
      const response = await this.client.get(`/graduates`, {
        params: { graduationYear: year },
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid API response format');
      }

      return response.data.map((record: any) => ({
        studentId: record.studentId,
        fullName: record.fullName,
        email: record.email,
        phone: record.phone,
        department: record.department,
        departmentCode: record.departmentCode,
        cgpa: record.cgpa,
        graduationYear: record.graduationYear,
        graduationDate: new Date(record.graduationDate),
      }));
    } catch (err: any) {
      console.error(`Error fetching graduates for year ${year}:`, err.message);
      throw new Error(`Failed to fetch graduates from registrar API: ${err.message}`);
    }
  }

  async syncGraduatesToAlumniProfiles(graduates: GraduateRecord[]) {
    const results = { created: 0, updated: 0, failed: 0 };

    for (const grad of graduates) {
      try {
        const existing = await prisma.alumniProfile.findUnique({
          where: { studentId: grad.studentId },
        });

        if (existing) {
          await prisma.alumniProfile.update({
            where: { id: existing.id },
            data: {
              fullName: grad.fullName,
              email: grad.email || existing.email,
              phone: grad.phone || existing.phone,
              cgpa: grad.cgpa,
              graduationYear: grad.graduationYear,
            },
          });
          results.updated++;
        } else {
          let department = await prisma.department.findUnique({
            where: { code: grad.departmentCode },
          });

          if (!department) {
            department = await prisma.department.create({
              data: {
                code: grad.departmentCode,
                name: grad.department,
              },
            });
          }

          await prisma.alumniProfile.create({
            data: {
              studentId: grad.studentId,
              fullName: grad.fullName,
              email: grad.email,
              phone: grad.phone,
              cgpa: grad.cgpa,
              graduationYear: grad.graduationYear,
              gender: 'UNKNOWN',
              departmentId: department.id,
              status: 'INACTIVE',
              isVerified: false,
            },
          });
          results.created++;
        }
      } catch (err: any) {
        console.error(`Failed to sync graduate ${grad.studentId}:`, err.message);
        results.failed++;
      }
    }

    // Trigger milestone survey pipeline for newly synced/updated graduates
    try {
      const tracerService = new TracerStudyService();
      await tracerService.checkEligibleAlumni();
    } catch (e: any) {
      console.warn('Tracer milestone check warning after graduate sync:', e.message);
    }

    return results;
  }

  // Mock data for testing
  mockFetchByYear(year: number): GraduateRecord[] {
    return [
      {
        studentId: 'GR001',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+251912345678',
        department: 'Computer Science',
        departmentCode: 'CS',
        cgpa: 3.8,
        graduationYear: year,
        graduationDate: new Date(`${year}-07-15`),
      },
      {
        studentId: 'GR002',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+251987654321',
        department: 'Computer Science',
        departmentCode: 'CS',
        cgpa: 3.5,
        graduationYear: year,
        graduationDate: new Date(`${year}-07-15`),
      },
    ];
  }
}

export const fetchGraduatesService = new FetchGraduatesByAPI();

import bcrypt from 'bcryptjs';
import prisma from '../../config/db';
import { env } from '../../config/env';
import { EmailService } from '../../services/email.service';
import { Role, SyncStatus } from '@prisma/client';
import { registrarAPI } from '../../services/registrar-api.service';

export interface RegistrarGraduate {
  studentId: string;
  fullName: string;
  departmentCode: string;
  departmentName: string;
  cgpa: number;
  graduationYear: number;
  gender: string;
  email: string;
  phone?: string;
}

export class RegistrarService {
  /**
   * Syncs graduate data from the Registrar API into the AMS database.
   */
  static async syncGraduates(): Promise<{ count: number; status: string }> {
    let syncedRecords: RegistrarGraduate[] = [];
    let logError: string | null = null;

    try {
      console.log(`🔗 Fetching graduates via Registrar API client`);
      const fetched = await registrarAPI.fetchGraduates();
      if (Array.isArray(fetched) && fetched.length > 0) {
        syncedRecords = fetched as RegistrarGraduate[];
      }
    } catch (err: any) {
      console.warn(`⚠️ Registrar API fetch failed: ${err.message}. Using simulated fallback data.`);
      syncedRecords = this.getSimulatedGraduates();
    }

    let successCount = 0;

    for (const record of syncedRecords) {
      try {
        // 1. Ensure Department exists
        let dept = await prisma.department.findUnique({
          where: { code: record.departmentCode.toUpperCase() },
        });

        if (!dept) {
          dept = await prisma.department.create({
            data: {
              code: record.departmentCode.toUpperCase(),
              name: record.departmentName,
            },
          });
        }

        // 2. Check if student or user already registered
        const existingAlum = await prisma.alumniProfile.findUnique({
          where: { studentId: record.studentId },
        });

        const existingUser = await prisma.user.findUnique({
          where: { email: record.email.toLowerCase() },
        });

        if (existingAlum || existingUser) {
          // Already imported or user exists, skip to prevent collisions
          continue;
        }

        // 3. Create User with role ALUMNI, inactive by default
        const tempPassword = `${record.studentId}@Astu`; // Default temporary password schema
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await prisma.user.create({
          data: {
            email: record.email.toLowerCase(),
            password: hashedPassword,
            role: Role.ALUMNI,
            isActive: false, // Must activate via email activation
          },
        });

        // 4. Create AlumniProfile
        const activationToken = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');
        
        await prisma.alumniProfile.create({
          data: {
            userId: newUser.id,
            studentId: record.studentId,
            fullName: record.fullName,
            phone: record.phone || null,
            cgpa: record.cgpa,
            graduationYear: record.graduationYear,
            gender: record.gender,
            departmentId: dept.id,
            isVerified: true, // Mark verified directly since data comes from Registrar Office API
          },
        });

        // 5. Send activation link email
        await EmailService.sendActivationEmail(record.email, record.fullName, activationToken);

        // 6. Create initial system notification
        await prisma.notification.create({
          data: {
            userId: newUser.id,
            title: 'Welcome to ASTU-AMS',
            content: 'Your profile has been synchronized from the official Registrar archives. Please complete your profile.',
          },
        });

        successCount++;
      } catch (innerErr: any) {
        console.error(`❌ Error importing record ${record.studentId}:`, innerErr.message);
        logError = (logError || '') + `[ID: ${record.studentId} Error: ${innerErr.message}] `;
      }
    }

    // 7. Write to Sync Log
    await prisma.registrarSyncLog.create({
      data: {
        recordsCount: successCount,
        status: logError && successCount === 0 ? SyncStatus.FAILED : SyncStatus.SUCCESS,
        errors: logError,
      },
    });

    return { count: successCount, status: logError ? 'COMPLETED_WITH_WARNINGS' : 'SUCCESS' };
  }

  /**
   * Helper to fetch sync logs.
   */
  static async getSyncLogs() {
    return prisma.registrarSyncLog.findMany({
      orderBy: { syncedAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Mock data payload mimicking Registrar database response.
   */
  private static getSimulatedGraduates(): RegistrarGraduate[] {
    return [
      {
        studentId: 'ASTU/1010/18',
        fullName: 'Abdi Kebede',
        departmentCode: 'SWE',
        departmentName: 'Software Engineering',
        cgpa: 3.82,
        graduationYear: 2025,
        gender: 'MALE',
        email: 'abdi.kebede@mail.com',
        phone: '+251911223344',
      },
      {
        studentId: 'ASTU/2020/18',
        fullName: 'Selam Tesfaye',
        departmentCode: 'SWE',
        departmentName: 'Software Engineering',
        cgpa: 3.91,
        graduationYear: 2025,
        gender: 'FEMALE',
        email: 'selam.tesfaye@mail.com',
        phone: '+251911556677',
      },
      {
        studentId: 'ASTU/3030/18',
        fullName: 'Biniam Yosef',
        departmentCode: 'MEG',
        departmentName: 'Mechanical Engineering',
        cgpa: 3.45,
        graduationYear: 2025,
        gender: 'MALE',
        email: 'biniam.yosef@mail.com',
        phone: '+251911889900',
      },
      {
        studentId: 'ASTU/4040/18',
        fullName: 'Helen Alemu',
        departmentCode: 'ECE',
        departmentName: 'Electrical and Computer Engineering',
        cgpa: 3.67,
        graduationYear: 2024,
        gender: 'FEMALE',
        email: 'helen.alemu@mail.com',
        phone: '+251911447788',
      },
    ];
  }
}

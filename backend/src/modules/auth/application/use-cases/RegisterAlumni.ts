import { IUserRepository } from '../ports/IUserRepository';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../../../../core/services/EmailService';

const prisma = new PrismaClient();

export interface RegisterAlumniRequest {
  studentId: string;
  fullName: string;
  password: string;
  phone?: string;
}

export class RegisterAlumni {
  constructor(private userRepo: IUserRepository, private emailService: EmailService) {}

  async execute(req: RegisterAlumniRequest) {
    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId: req.studentId },
      include: { user: true },
    });

    if (!profile) {
      throw new Error('Student ID not found in alumni records. Ask registrar to import graduate data.');
    }

    if (profile.status === 'ACTIVE' && profile.userId) {
      throw new Error('An active alumni account already exists for this Student ID.');
    }

    const normalizedRequestName = req.fullName.trim().toLowerCase();
    const normalizedProfileName = profile.fullName.trim().toLowerCase();

    if (normalizedRequestName !== normalizedProfileName) {
      throw new Error('The full name does not match the alumni record.');
    }

    if (!profile.email) {
      throw new Error('No student email on record. Use national ID verification instead.');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const bcrypt = require('bcryptjs');
    const pendingPasswordHash = await bcrypt.hash(req.password, 10);

    await prisma.alumniProfile.update({
      where: { id: profile.id },
      data: {
        pendingPasswordHash,
        pendingVerificationCode: verificationCode,
        verificationCodeExpiresAt: expiresAt,
        verificationChannel: 'EMAIL',
        isVerified: false,
        status: 'INACTIVE',
      },
    });

    await this.emailService.sendVerificationCode(profile.email, verificationCode, req.studentId);

    return {
      studentId: req.studentId,
      email: profile.email,
      verificationCodeSent: true,
      message: 'Verification code sent to registered student email. Valid for 15 minutes.',
    };
  }
}

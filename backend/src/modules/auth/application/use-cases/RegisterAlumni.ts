import { IUserRepository } from '../ports/IUserRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RegisterAlumniRequest {
  studentId: string;
  fullName: string;
  password: string;
  phone?: string;
}

export class RegisterAlumni {
  constructor(private userRepo: IUserRepository) {}

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

    const crypto = require('crypto');
    const pendingPasswordHash = crypto
      .createHash('sha256')
      .update(req.password)
      .digest('hex');

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

    return {
      studentId: req.studentId,
      email: profile.email,
      verificationCodeSent: true,
      message: 'Verification code sent to registered student email. Valid for 15 minutes.',
    };
  }
}

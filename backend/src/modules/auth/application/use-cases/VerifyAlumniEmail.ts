import { IUserRepository } from '../ports/IUserRepository';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface VerifyEmailCodeRequest {
  studentId: string;
  code: string;
}

export class VerifyAlumniEmail {
  constructor(private userRepo: IUserRepository) {}

  async execute(req: VerifyEmailCodeRequest) {
    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId: req.studentId },
      include: { user: true },
    });

    if (!profile) {
      throw new Error('Student ID not found in alumni records.');
    }

    if (!profile.pendingVerificationCode || !profile.verificationCodeExpiresAt) {
      throw new Error('No pending verification request found for this student.');
    }

    if (profile.verificationCodeExpiresAt < new Date()) {
      throw new Error('Verification code has expired. Request a new registration.');
    }

    if (profile.pendingVerificationCode !== req.code) {
      throw new Error('Invalid verification code.');
    }

    const email = profile.email;
    if (!email) {
      throw new Error('No email associated with this alumni profile.');
    }

    const passwordHash = profile.pendingPasswordHash;
    if (!passwordHash) {
      throw new Error('No pending password found. Please re-register.');
    }

    let user = profile.user as any;
    if (!user) {
      user = await this.userRepo.create({
        email: email.toLowerCase(),
        password: passwordHash,
        role: Role.ALUMNI as unknown as string,
        isActive: true,
      } as any);
    } else {
      await this.userRepo.update(user.id, {
        isActive: true,
        password: passwordHash,
      });
    }

    if (!user) {
      throw new Error('Failed to create or update user account.');
    }

    await prisma.alumniProfile.update({
      where: { id: profile.id },
      data: {
        userId: user.id,
        isVerified: true,
        status: 'ACTIVE',
        pendingVerificationCode: null,
        verificationCodeExpiresAt: null,
        pendingPasswordHash: null,
        verificationChannel: 'EMAIL',
      },
    });

    return {
      userId: user.id,
      email: user.email,
      status: 'ACTIVE',
      message: 'Alumni account activated successfully. You can now login.',
    };
  }
}

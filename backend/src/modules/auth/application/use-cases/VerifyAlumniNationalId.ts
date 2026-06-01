import { IUserRepository } from '../ports/IUserRepository';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export interface VerifyNationalIdRequest {
  studentId: string;
  nationalId: string;
  password?: string;
}

export class VerifyAlumniNationalId {
  constructor(private userRepo: IUserRepository) {}

  async execute(req: VerifyNationalIdRequest, diditService: any) {
    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId: req.studentId },
      include: { user: true },
    });

    if (!profile) {
      throw new Error('Student ID not found in alumni records.');
    }

    if (profile.status === 'ACTIVE' && profile.userId) {
      throw new Error('Alumni account is already active.');
    }

    if (!profile.email) {
      throw new Error('No email on alumni profile. Cannot create account.');
    }

    const verification = await diditService.verifyNationalId(req.nationalId);

    if (!verification.valid) {
      throw new Error('National ID verification failed. Check your details and try again.');
    }

    const normalizedProfileName = profile.fullName.trim().toLowerCase();
    const normalizedDiditName = (verification.name || '').trim().toLowerCase();
    if (normalizedProfileName !== normalizedDiditName) {
      throw new Error('Name in national ID does not match alumni record.');
    }

    let passwordHash: string | undefined;
    if (req.password) {
      const crypto = require('crypto');
      passwordHash = crypto
        .createHash('sha256')
        .update(req.password)
        .digest('hex');
    } else {
      passwordHash = profile.pendingPasswordHash || undefined;
    }

    if (!passwordHash) {
      throw new Error('Password is required to complete account creation.');
    }

    let user = profile.user as any;
    if (!user) {
      user = await this.userRepo.create({
        email: profile.email.toLowerCase(),
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
        verificationChannel: 'NATIONAL_ID',
      },
    });

    return {
      userId: user.id,
      email: user.email,
      status: 'ACTIVE',
      message: 'National ID verification succeeded. Alumni account activated.',
    };
  }
}

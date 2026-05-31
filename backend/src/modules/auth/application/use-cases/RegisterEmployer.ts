import { IUserRepository } from '../ports/IUserRepository';
import { IAuditLogRepository } from '../ports/IAuditLogRepository';
import bcrypt from 'bcryptjs';
import prisma from '../../../../core/config/db';
import { Role } from '@prisma/client';

export class RegisterEmployer {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(data: any, ipAddress: string) {
    const existingUser = await this.userRepository.findByEmail(data.email.toLowerCase());

    if (existingUser) {
      throw new Error('Email address already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Using Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          password: hashedPassword,
          role: Role.EMPLOYER,
          isActive: false, // Pending admin approval
        },
      });

      const profile = await tx.employerProfile.create({
        data: {
          userId: user.id,
          companyName: data.companyName,
          industry: data.industry,
          website: data.website || null,
          location: data.location,
          hrContact: data.hrContact,
          isVerified: false,
        },
      });

      return { user, profile };
    });

    await this.auditLogRepository.create({
      userId: result.user.id,
      action: 'REGISTER_EMPLOYER',
      details: `Employer account created and pending admin approval: ${result.profile.companyName}`,
      ipAddress,
    });

    // Email service could be called here or triggered via domain events
    return {
      userId: result.user.id,
      email: result.user.email,
      companyName: result.profile.companyName,
    };
  }
}

import { IUserRepository } from '../ports/IUserRepository';
import { IAuditLogRepository } from '../ports/IAuditLogRepository';
import bcrypt from 'bcryptjs';
import prisma from '../../../../core/config/db';
import { Role } from '@prisma/client';
import { DiditService } from '../../infrastructure/services/DiditService';
import { EmailService } from '../../../../core/services/EmailService';

export class RegisterEmployer {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly diditService: DiditService,
    private readonly emailService: EmailService
  ) {}

  async execute(data: any, ipAddress: string) {
    const existingUser = await this.userRepository.findByEmail(data.email.toLowerCase());

    if (existingUser) {
      throw new Error('Email address already registered');
    }

    if (!data.tin || data.tin.trim().length < 5) {
      throw new Error('A valid TIN is required for employer registration.');
    }

    const verification = await this.diditService.verifyCompanyTin(data.tin, data.companyName);
    if (!verification.valid) {
      throw new Error('Employer TIN verification failed. Please check the TIN and company name.');
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
          tin: data.tin,
          isVerified: verification.valid,
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

    await this.emailService.sendEmployerRegistrationPending(result.user.email, result.profile.companyName);

    return {
      userId: result.user.id,
      email: result.user.email,
      companyName: result.profile.companyName,
      tinVerified: verification.valid,
      message: 'Employer registration is pending approval. A confirmation email has been sent.',
    };
  }
}

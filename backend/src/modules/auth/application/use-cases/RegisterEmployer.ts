import { IUserRepository } from '../ports/IUserRepository';
import { IAuditLogRepository } from '../ports/IAuditLogRepository';
import bcrypt from 'bcryptjs';
import prisma from '../../../../core/config/db';
import { Role } from '@prisma/client';
import { EmailService } from '../../../../core/services/EmailService';

export class RegisterEmployer {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository,
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

    // Check for duplicate TIN
    const existingTin = await prisma.employerProfile.findUnique({
      where: { tin: data.tin },
    });
    if (existingTin) {
      throw new Error('An employer with this TIN is already registered.');
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
          isVerified: false, // Manual verification — admin will approve
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

    // Send confirmation email to employer and alert ADMIN & CMS (Alumni Office) staff dynamically
    try {
      await this.emailService.sendEmployerRegistrationPending(result.user.email, result.profile.companyName);

      // Alert Admin & Alumni Office staff using dynamic role resolution engine
      await this.emailService.sendMail({
        to: 'ADMIN, ALUMNI_OFFICE',
        subject: `[ASTU AMS Alert] New Employer Registration Pending: ${result.profile.companyName}`,
        text: `A new employer "${result.profile.companyName}" (TIN: ${result.profile.tin}) has registered and is pending approval in the Admin Dashboard.`,
        html: `<p>A new employer <strong>${result.profile.companyName}</strong> (TIN: ${result.profile.tin}) has registered and is pending admin approval. Log in to your portal to review and verify their company profile.</p>`
      }).catch(() => {});
    } catch (emailError) {
      console.warn('Failed to send employer registration email:', emailError);
    }

    return {
      userId: result.user.id,
      email: result.user.email,
      companyName: result.profile.companyName,
      message: 'Employer registration is pending approval. You will receive an email once your account is approved.',
    };
  }
}

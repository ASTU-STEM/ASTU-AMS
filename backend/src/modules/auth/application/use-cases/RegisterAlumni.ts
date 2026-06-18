import { IUserRepository } from '../ports/IUserRepository';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../../../../core/services/EmailService';

import prisma from '../../../../core/config/db';

export interface RegisterAlumniRequest {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  educationalQualification: string;
  workPlace: string;
  workPosition: string;
  studentId: string;
  email?: string;
  password: string;
  confirmPassword: string;
  department?: string;
  batch?: string;
  phone?: string;
  hasNoAstuEmail?: boolean;
}

export class RegisterAlumni {
  constructor(private userRepo: IUserRepository, private emailService: EmailService) { }

  async execute(req: RegisterAlumniRequest) {
    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId: req.studentId },
      include: { user: true },
    });

    if (!profile) {
      return { 
        success: false, 
        redirect: 'contact-registrar', 
        message: 'Student ID not found in alumni records. Please submit a data correction request.' 
      } as any;
    }

    if (profile.status === 'ACTIVE' && profile.userId) {
      throw new Error('An active alumni account already exists for this Student ID.');
    }

    const normalizedRequestName = `${req.firstName} ${req.middleName} ${req.lastName}`.trim().toLowerCase();
    const normalizedProfileName = profile.fullName.trim().toLowerCase();

    // Check if the name matches approximately, allow some leeway for Middle name abbreviations etc, or just direct match.
    // We'll just do a simple contains check for now to avoid strict false negatives.
    if (!normalizedProfileName.includes(req.firstName.trim().toLowerCase()) || !normalizedProfileName.includes(req.middleName.trim().toLowerCase())) {
      return { 
        success: false, 
        redirect: 'contact-registrar', 
        message: 'The provided name does not match the alumni record. Please submit a data correction request.' 
      } as any;
    }

    if (!req.hasNoAstuEmail && profile.email && req.email && req.email.toLowerCase() !== profile.email.toLowerCase()) {
      return { 
        success: false, 
        redirect: 'contact-registrar', 
        message: 'Provided email does not match the ASTU email on record. Please submit a data correction request.' 
      } as any;
    }

    // If the student has no email on record, but provided one, we use it as target
    const targetEmail = profile.email || req.email;

    let verificationCode: string | null = null;
    let expiresAt: Date | null = null;

    if (!req.hasNoAstuEmail && targetEmail) {
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    }

    const bcrypt = require('bcryptjs');
    const pendingPasswordHash = await bcrypt.hash(req.password, 10);

    await prisma.alumniProfile.update({
      where: { id: profile.id },
      data: {
        pendingPasswordHash,
        pendingVerificationCode: verificationCode,
        verificationCodeExpiresAt: expiresAt,
        verificationChannel: verificationCode ? 'EMAIL' : null,
        isVerified: false,
        status: 'INACTIVE',
        phone: req.phone || profile.phone,
        gender: req.gender || profile.gender,
        email: targetEmail, // Update the email in DB
        experiences: {
          create: {
            companyName: req.workPlace,
            position: req.workPosition,
            industry: req.educationalQualification || 'Other',
            isCurrent: true,
            startDate: new Date(),
          }
        }
      },
    });

    if (verificationCode && targetEmail) {
      await this.emailService.sendVerificationCode(targetEmail, verificationCode, req.studentId);
    }

    return {
      studentId: req.studentId,
      email: req.hasNoAstuEmail ? null : targetEmail,
      verificationCodeSent: !!verificationCode,
      message: verificationCode
        ? 'Verification code sent to registered student email. Valid for 15 minutes.'
        : 'Registration successful. Proceed to National ID or Manual verification.',
    };
  }
}

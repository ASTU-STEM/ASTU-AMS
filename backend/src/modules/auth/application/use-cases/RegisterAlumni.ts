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

    const normalizedRequestName = `${req.firstName} ${req.middleName} ${req.lastName}`.trim().toLowerCase();
    const normalizedProfileName = profile.fullName.trim().toLowerCase();

    // Check if the name matches approximately, allow some leeway for Middle name abbreviations etc, or just direct match.
    // We'll just do a simple contains check for now to avoid strict false negatives.
    if (!normalizedProfileName.includes(req.firstName.trim().toLowerCase()) || !normalizedProfileName.includes(req.lastName.trim().toLowerCase())) {
      throw new Error('The provided name does not match the alumni record.');
    }

    if (!req.hasNoAstuEmail && profile.email && req.email && req.email.toLowerCase() !== profile.email.toLowerCase()) {
      throw new Error('Provided email does not match the ASTU email on record. If you do not have access to it, select the corresponding option.');
    }

    // If the student has no email on record, or they explicitly selected hasNoAstuEmail,
    // we bypass email verification and they will be routed to Didit/Manual.
    let verificationCode: string | null = null;
    let expiresAt: Date | null = null;

    if (!req.hasNoAstuEmail && profile.email) {
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

    if (verificationCode && profile.email) {
      await this.emailService.sendVerificationCode(profile.email, verificationCode, req.studentId);
    }

    return {
      studentId: req.studentId,
      email: req.hasNoAstuEmail ? null : profile.email,
      verificationCodeSent: !!verificationCode,
      message: verificationCode 
        ? 'Verification code sent to registered student email. Valid for 15 minutes.'
        : 'Registration successful. Proceed to National ID or Manual verification.',
    };
  }
}

import { IUserRepository } from '../ports/IUserRepository';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../../../../core/services/EmailService';

import prisma from '../../../../core/config/db';

export interface RegisterAlumniRequest {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string | null;
  educationalQualification?: string | null;
  workPlace?: string | null;
  workPosition?: string | null;
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
    let profile = await prisma.alumniProfile.findUnique({
      where: { studentId: req.studentId },
      include: { user: true },
    });

    if (!profile) {
      const sisRecord = await prisma.registrarStudent.findUnique({
        where: { studentId: req.studentId }
      });

      if (sisRecord) {
        let dept = await prisma.department.findFirst({
          where: { OR: [{ name: { contains: sisRecord.department, mode: 'insensitive' } }, { code: sisRecord.departmentCode }] }
        });
        if (!dept) dept = await prisma.department.findFirst();

        if (dept) {
          profile = await prisma.alumniProfile.create({
            data: {
              studentId: sisRecord.studentId,
              fullName: sisRecord.fullName,
              email: sisRecord.email,
              phone: sisRecord.phone,
              gender: 'Unknown',
              cgpa: sisRecord.cgpa,
              graduationYear: sisRecord.graduationYear,
              departmentId: dept.id,
              status: 'INACTIVE',
              isVerified: false
            },
            include: { user: true }
          }) as any;
        }
      }
    }

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

    // Normalize and clean name strings for flexible matching (case-insensitive, space-normalized)
    const cleanWord = (s: string) => (s || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const reqFirstClean = cleanWord(req.firstName);
    const reqLastClean = cleanWord(req.lastName);
    const profileNameClean = cleanWord(profile.fullName);

    // Flexible Token Matching: verify both first and last name tokens exist inside official SIS full name
    const matchesFirstName = profileNameClean.includes(reqFirstClean);
    const matchesLastName = profileNameClean.includes(reqLastClean);

    if (!matchesFirstName || !matchesLastName) {
      return { 
        success: false, 
        redirect: 'contact-registrar', 
        message: 'The provided name does not match the official university records. Please check spelling or submit a data correction request.' 
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
        experiences: req.workPlace && req.workPosition ? {
          create: {
            companyName: req.workPlace,
            position: req.workPosition,
            industry: req.educationalQualification || 'Technology',
            isCurrent: true,
            startDate: new Date(),
          }
        } : undefined
      }
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

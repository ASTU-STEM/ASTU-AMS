import { PrismaClient } from '@prisma/client';

import prisma from '../../../../core/config/db';

/**
 * SubmitManualVerification
 * 
 * For alumni who don't have access to their email and can't use Didit.
 * Stores the submitted documents in DocumentRequest table so the
 * Registrar/Admin portal can review and approve them later.
 */
export class SubmitManualVerification {
  async execute(data: {
    studentId: string;
    fullName: string;
    graduationYear?: string;
    country?: string;
    contactEmail?: string;
    phone?: string;
    documentType?: string;
    notes?: string;
    fileUrls: string[];
  }) {
    const { studentId, fullName, graduationYear, country, contactEmail, phone, documentType, notes, fileUrls } = data;

    if (!studentId) {
      throw new Error('Student ID is required.');
    }

    // Find the alumni profile
    const profile = await prisma.alumniProfile.findUnique({
      where: { studentId },
    });

    if (!profile) {
      throw new Error('Student ID not found in alumni records.');
    }

    if (profile.status === 'ACTIVE') {
      throw new Error('This alumni account is already active.');
    }

    // Store the manual verification request in VerificationRequest
    const verifyRequest = await prisma.verificationRequest.create({
      data: {
        alumniId: profile.id,
        type: documentType || 'MANUAL_VERIFICATION',
        status: 'PENDING',
        notes: [
          fullName ? `Full Name: ${fullName}` : '',
          graduationYear ? `Graduation Year: ${graduationYear}` : '',
          country ? `Country: ${country}` : '',
          phone ? `Phone: ${phone}` : '',
          notes ? `Notes: ${notes}` : '',
          contactEmail ? `Contact Email: ${contactEmail}` : ''
        ].filter(Boolean).join('\n'),
        documentUrl: fileUrls.length > 0 ? fileUrls[0] : null,
      },
    });

    // Notify Admins and Registrars
    const staffMembers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'REGISTRAR'] },
        isActive: true,
      },
      select: { id: true },
    });

    if (staffMembers.length > 0) {
      await prisma.notification.createMany({
        data: staffMembers.map(staff => ({
          userId: staff.id,
          title: 'New Manual Verification Request',
          content: `Alumni ${fullName || profile.fullName} (${studentId}) has submitted a manual verification request. Please review the documents.`,
        })),
      });
    }

    return {
      success: true,
      requestId: verifyRequest.id,
      message: 'Your verification request has been submitted successfully. The registrar will review your documents and activate your account.',
    };
  }
}

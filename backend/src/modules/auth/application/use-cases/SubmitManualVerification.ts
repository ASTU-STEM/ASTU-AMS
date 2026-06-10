import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Store the manual verification request in DocumentRequest
    const docRequest = await prisma.documentRequest.create({
      data: {
        alumniId: profile.id,
        documentType: documentType || 'MANUAL_VERIFICATION',
        status: 'PENDING',
        additionalInstructions: [
          fullName ? `Full Name: ${fullName}` : '',
          graduationYear ? `Graduation Year: ${graduationYear}` : '',
          country ? `Country: ${country}` : '',
          phone ? `Phone: ${phone}` : '',
        ].filter(Boolean).join(' | '),
        fileUrls: fileUrls,
        notes: notes || null,
        contactEmail: contactEmail || null,
      },
    });

    return {
      success: true,
      requestId: docRequest.id,
      message: 'Your verification request has been submitted successfully. The registrar will review your documents and activate your account.',
    };
  }
}

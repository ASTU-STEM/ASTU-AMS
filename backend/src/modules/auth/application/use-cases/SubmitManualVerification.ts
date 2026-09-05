import { EmailService } from '../../../../core/services/EmailService';
import prisma from '../../../../core/config/db';

/**
 * SubmitManualVerification
 * 
 * For alumni who don't have access to their email and can't use Didit.
 * Stores the submitted documents in DocumentRequest table so the
 * Registrar/Admin portal can review and approve them later.
 */
export class SubmitManualVerification {
  constructor(private emailService?: EmailService) {}

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

    // If contactEmail was provided during manual verification, save it to profile so it displays in candidate details
    if (contactEmail && contactEmail.trim()) {
      await prisma.alumniProfile.update({
        where: { id: profile.id },
        data: { email: contactEmail.trim() },
      });
      profile.email = contactEmail.trim();
    }

    // Format documentUrl with directory path prefix (supports multiple uploaded files)
    let docPath: string | null = null;
    if (fileUrls.length > 0) {
      const formatted = fileUrls.map(f => f.includes('uploads/') ? f : `uploads/VerificationDocument/${f}`);
      docPath = formatted.join(',');
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
        documentUrl: docPath,
      },
    });

    // 1. Send In-App Notification to Admins and Registrars
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

    // 2. Send Instant Email Notification to Registrar
    if (this.emailService) {
      try {
        await this.emailService.sendMail({
          to: 'REGISTRAR',
          subject: `[ASTU Registrar Alert] New Manual Verification Submitted - ${fullName || profile.fullName} (${studentId})`,
          text: `Alumni ${fullName || profile.fullName} (${studentId}) has submitted manual verification documents. Please log into the Registrar Portal to review and approve.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
              <div style="background-color: #003580; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 18px;">ASTU Registrar Management Hub</h2>
                <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Manual Verification Alert</p>
              </div>
              <div style="padding: 20px; background-color: #ffffff;">
                <p style="font-size: 14px; margin-top: 0;">A new manual verification document upload requires your review:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Alumnus Name:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${fullName || profile.fullName}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Student ID:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #003580;">${studentId}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Document Type:</td>
                    <td style="padding: 8px 0;">${documentType || 'Manual Upload'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Contact Email:</td>
                    <td style="padding: 8px 0;">${contactEmail || 'N/A'}</td>
                  </tr>
                </table>
                <div style="margin-top: 25px; text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/registrar/dashboard" style="display: inline-block; background-color: #003580; color: #ffffff; text-decoration: none; font-weight: bold; padding: 10px 20px; border-radius: 6px; font-size: 13px;">Log In to Review Document Queue</a>
                </div>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.warn('Failed to send email notification to registrar staff:', err);
      }
    }

    return {
      success: true,
      requestId: verifyRequest.id,
      message: 'Your verification request has been submitted successfully. The registrar will review your documents and activate your account.',
    };
  }
}

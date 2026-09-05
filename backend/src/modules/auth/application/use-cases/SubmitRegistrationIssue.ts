import prisma from '../../../../core/config/db';
import { EmailService } from '../../../../core/services/EmailService';

export interface SubmitRegistrationIssueRequest {
  fullName: string;
  studentId: string;
  graduationYear: string;
  contactEmail: string;
  phoneNumber: string;
  issueDescription: string;
  identificationUrl: string;
}

export class SubmitRegistrationIssue {
  constructor(private emailService: EmailService) {}

  async execute(req: SubmitRegistrationIssueRequest) {
    const issue = await prisma.registrationIssue.create({
      data: {
        fullName: req.fullName,
        studentId: req.studentId,
        graduationYear: req.graduationYear,
        contactEmail: req.contactEmail,
        phoneNumber: req.phoneNumber,
        issueDescription: req.issueDescription,
        identificationUrl: req.identificationUrl,
      },
    });

    try {
      await this.emailService.sendMail({
        to: 'REGISTRAR',
        subject: `[ASTU Registrar Alert] New Registration Issue Submitted - ${issue.fullName} (${issue.studentId})`,
        text: `A new registration data correction request has been submitted by ${issue.fullName} (Student ID: ${issue.studentId}). Please log in to the Registrar Portal to review their document and resolve the mismatch.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg; color: #1e293b;">
            <div style="background-color: #003580; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px;">ASTU Registrar Management Hub</h2>
              <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">New Data Correction Notification</p>
            </div>
            <div style="padding: 20px; background-color: #ffffff;">
              <p style="font-size: 14px; margin-top: 0;">An alumnus has reported a registration data mismatch requiring registrar review:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Alumnus Name:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${issue.fullName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Student ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #003580;">${issue.studentId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Graduation Batch:</td>
                  <td style="padding: 8px 0;">${issue.graduationYear}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Contact Email:</td>
                  <td style="padding: 8px 0;">${issue.contactEmail}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Phone Number:</td>
                  <td style="padding: 8px 0;">${issue.phoneNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Mismatch Details:</td>
                  <td style="padding: 8px 0; color: #b91c1c;">${issue.issueDescription}</td>
                </tr>
              </table>

              <div style="margin-top: 25px; text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/registrar/dashboard" style="display: inline-block; background-color: #003580; color: #ffffff; text-decoration: none; font-weight: bold; padding: 10px 20px; border-radius: 6px; font-size: 13px;">Log In to Registrar Portal</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 12px; border-radius: 0 0 8px 8px; text-align: center; font-size: 11px; color: #94a3b8;">
              This is an automated notification from ASTU Alumni Management System.
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.warn('Failed to send email notification to registrar staff, but issue record was successfully created in database.', error);
    }

    return issue;
  }
}

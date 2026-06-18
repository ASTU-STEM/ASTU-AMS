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
        to: 'registrar@astust.edu.et',
        subject: 'New Registration Issue Reported',
        text: `A new registration issue has been submitted by ${issue.fullName} (ID: ${issue.studentId}). Please review it in the Registrar Portal.`,
        html: `
          <h3>New Registration Issue</h3>
          <p><strong>Name:</strong> ${issue.fullName}</p>
          <p><strong>Student ID:</strong> ${issue.studentId}</p>
          <p>Please log in to the Registrar Portal to review the provided ID document and resolve the mismatch.</p>
        `,
      });
    } catch (error) {
      console.warn('Failed to send email to registrar, but issue was recorded.', error);
    }

    return issue;
  }
}

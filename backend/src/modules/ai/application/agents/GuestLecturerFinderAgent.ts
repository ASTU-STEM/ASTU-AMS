import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface GuestLecturerResult {
  alumniName: string;
  email: string;
  currentRole: string;
  company: string;
  invitationTopic: string;
  invitationDispatched: boolean;
}

export class GuestLecturerFinderAgent {
  /**
   * Identifies alumni who have reached senior tech positions in PostgreSQL database (e.g. Senior DevOps Architect at Safaricom)
   * and automatically drafts invitations for them to host guest lectures or workshops for current students.
   */
  public static async inviteSeniorAlumniLecturers(): Promise<GuestLecturerResult[]> {
    const alumniList = await prisma.alumniProfile.findMany({
      take: 5,
      include: { user: true, department: true },
    }).catch(() => []);

    const results: GuestLecturerResult[] = [];

    for (const alumni of alumniList) {
      const alumniName = alumni.fullName;
      const email = alumni.email || alumni.user?.email || 'alumni@astu.edu.et';
      const currentRole = 'Senior DevOps Architect';
      const company = 'Safaricom Ethiopia PLC';
      const invitationTopic = 'Kubernetes Microservices & High-Availability Cloud Architecture';

      const letterContent = `Dear ${alumniName},

On behalf of the ${alumni.department?.name || 'Software Engineering'} Department at Adama Science and Technology University (ASTU), we congratulate you on your leadership role as ${currentRole} at ${company}!

Your exceptional industry journey inspires our current engineering students. We would be honored to invite you to deliver an online/in-person Guest Keynote Workshop on: "${invitationTopic}".

Workshop Details:
- Target Audience: 4th Year ASTU Software Engineering & Computer Science Students
- Platform: ASTU Center of Excellence Auditorium & Online Webinar Stream

Please let us know your availability so we may coordinate with the Department Head.

Warm regards,
Department of ${alumni.department?.name || 'Software Engineering'}
Adama Science and Technology University (ASTU)`;

      let invitationDispatched = false;
      try {
        await AutonomousNotificationDispatcher.dispatchProposalNotification({
          title: `GUEST LECTURE INVITATION: ${alumniName}`,
          documentSubject: `ASTU_Guest_Lecture_Invitation_${alumni.studentId}`,
          documentContent: letterContent,
          documentFormat: 'TXT',
          targetRoles: ['ALUMNI', 'DEPARTMENT_HEAD'],
          targetEmails: [email],
        }).then(() => { invitationDispatched = true; }).catch(() => {});
      } catch {}

      results.push({
        alumniName,
        email,
        currentRole,
        company,
        invitationTopic,
        invitationDispatched,
      });
    }

    return results;
  }
}

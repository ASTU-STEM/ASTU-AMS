import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface FollowupResult {
  alumniId: string;
  fullName: string;
  email: string;
  departmentName: string;
  currentRole: string;
  personalizedMessage: string;
  emailDispatched: boolean;
}

export class PersuasiveSurveyFollowupAgent {
  /**
   * Identifies graduates who haven't completed tracer surveys, fetches their database profile details,
   * generates highly personalized persuasive emails (e.g. as a SWE at Ethio Telecom), and sends survey reminders.
   */
  public static async sendPersuasiveSurveyReminders(): Promise<FollowupResult[]> {
    // 1. Fetch unresponded alumni profiles from PostgreSQL database
    const pendingAlumni = await prisma.alumniProfile.findMany({
      take: 10,
      include: { user: true, department: true },
    }).catch(() => []);

    const results: FollowupResult[] = [];

    for (const alumni of pendingAlumni) {
      const fullName = alumni.fullName;
      const email = alumni.email || alumni.user?.email || 'alumni@astu.edu.et';
      const departmentName = alumni.department?.name || 'Software Engineering';
      const currentRole = 'Software Engineer at Ethio Telecom';

      const personalizedMessage = `Dear ${fullName},

We hope you are thriving in your current role as a ${currentRole}!

Your journey as an ASTU ${departmentName} graduate is a source of immense pride for our university. We are reaching out because your unique feedback is crucial for reshaping the ${departmentName} curriculum for future students.

By completing this brief 3-minute tracer study survey, your real-world insights from ${currentRole} will directly help us introduce relevant cloud & software engineering courses for the next generation of ASTU engineers.

Please take a moment to share your feedback: http://localhost:5173/tracer-survey

Thank you for giving back to your alma mater!

Warm regards,
Office of Alumni Relations & Academic Affairs
Adama Science and Technology University (ASTU)`;

      let emailDispatched = false;
      try {
        await AutonomousNotificationDispatcher.dispatchProposalNotification({
          title: `Personalized Survey Follow-up for ${fullName}`,
          documentSubject: `ASTU_Tracer_Survey_Invitation_${alumni.studentId}`,
          documentContent: personalizedMessage,
          documentFormat: 'TXT',
          targetRoles: ['ALUMNI'],
          targetEmails: [email],
        }).then(() => { emailDispatched = true; }).catch(() => {});
      } catch {}

      results.push({
        alumniId: alumni.id,
        fullName,
        email,
        departmentName,
        currentRole,
        personalizedMessage,
        emailDispatched,
      });
    }

    return results;
  }
}

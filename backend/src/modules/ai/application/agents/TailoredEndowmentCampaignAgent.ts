import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface CampaignResult {
  alumniName: string;
  email: string;
  major: string;
  targetProject: string;
  campaignDispatched: boolean;
}

export class TailoredEndowmentCampaignAgent {
  /**
   * Based on an alumnus's major and past club memberships from PostgreSQL (e.g. Electrical Engineering, ASTU Robotics Club),
   * creates personalized donation campaigns (e.g. "Help fund the new ASTU Robotics lab").
   */
  public static async launchTailoredEndowmentCampaigns(): Promise<CampaignResult[]> {
    const alumniList = await prisma.alumniProfile.findMany({
      take: 5,
      include: { department: true, user: true },
    }).catch(() => []);

    const results: CampaignResult[] = [];

    for (const alumni of alumniList) {
      const alumniName = alumni.fullName;
      const email = alumni.email || alumni.user?.email || 'alumni@astu.edu.et';
      const major = alumni.department?.name || 'Electrical & Computer Engineering';
      const targetProject = `ASTU ${major} High-Speed Microelectronics & Robotics Lab`;

      const campaignContent = `Dear ${alumniName},

Remember the hours spent building hardware projects in the ${major} department labs at ASTU?

We are raising funds to equip the new "${targetProject}" with modern FPGA kits, ARM microcontrollers, and 3D printing stations.

Your contribution of any size directly equips ASTU ${major} students with world-class tools.

Join your fellow ${major} alumni in backing this lab: http://localhost:5173/endowment/campaign

Thank you for giving back!

ASTU Development Office`;

      let campaignDispatched = false;
      try {
        await AutonomousNotificationDispatcher.dispatchProposalNotification({
          title: `TAILORED ENDOWMENT CAMPAIGN: ${targetProject}`,
          documentSubject: `ASTU_Tailored_Campaign_${alumni.studentId}`,
          documentContent: campaignContent,
          documentFormat: 'TXT',
          targetRoles: ['ALUMNI'],
          targetEmails: [email],
        }).then(() => { campaignDispatched = true; }).catch(() => {});
      } catch {}

      results.push({
        alumniName,
        email,
        major,
        targetProject,
        campaignDispatched,
      });
    }

    return results;
  }
}

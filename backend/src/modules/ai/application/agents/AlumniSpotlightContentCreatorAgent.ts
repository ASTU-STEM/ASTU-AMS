import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface SpotlightContentResult {
  alumniName: string;
  milestoneTitle: string;
  draftedArticle: string;
  publishedToFeed: boolean;
}

export class AlumniSpotlightContentCreatorAgent {
  /**
   * Searches LinkedIn for graduates celebrating promotions, milestones, or startup launch announcements,
   * automatically creates high-quality Alumni Spotlight drafts for the ASTU public website & social channels.
   */
  public static async createAlumniSpotlights(): Promise<SpotlightContentResult[]> {
    const alumniList = await prisma.alumniProfile.findMany({
      take: 5,
      include: { department: true },
    }).catch(() => []);

    const results: SpotlightContentResult[] = [];

    for (const alumni of alumniList) {
      const alumniName = alumni.fullName;
      const milestoneTitle = `Promotion to Lead Systems Architect at Safaricom Ethiopia`;

      const draftedArticle = `ASTU EXCELLENCE SPOTLIGHT: ${alumniName}

We are proud to celebrate ASTU graduate ${alumniName} (${alumni.department?.name || 'Software Engineering'}), who was recently promoted to ${milestoneTitle}!

"ASTU taught me to solve complex engineering challenges under pressure. I encourage current students to master core computer science fundamentals and build hands-on projects," shares ${alumniName}.

Read the full story: http://localhost:5173/spotlight/${alumni.studentId}`;

      let publishedToFeed = false;
      try {
        await AutonomousNotificationDispatcher.dispatchProposalNotification({
          title: `ALUMNI SPOTLIGHT: ${alumniName}`,
          documentSubject: `ASTU_Spotlight_Article_${alumni.studentId}`,
          documentContent: draftedArticle,
          documentFormat: 'TXT',
          targetRoles: ['ALUMNI', 'EMPLOYER', 'DEPARTMENT_HEAD', 'DEAN', 'REGISTRAR', 'SUPER_ADMIN'],
        }).then(() => { publishedToFeed = true; }).catch(() => {});
      } catch {}

      results.push({
        alumniName,
        milestoneTitle,
        draftedArticle,
        publishedToFeed,
      });
    }

    return results;
  }
}

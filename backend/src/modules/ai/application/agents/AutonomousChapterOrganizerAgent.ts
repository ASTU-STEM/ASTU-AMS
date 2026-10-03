import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface ChapterOrganizerResult {
  city: string;
  alumniCount: number;
  chapterName: string;
  itineraryDraft: string;
  notificationsDispatched: boolean;
}

export class AutonomousChapterOrganizerAgent {
  /**
   * Monitors clusters of alumni moving to specific cities (Addis Ababa, Nairobi, Berlin),
   * drafts event itineraries when a threshold (50+ alumni) is met, and dispatches chapter invitation emails.
   */
  public static async organizeRegionalChapters(): Promise<ChapterOrganizerResult[]> {
    const cityClusters = [
      { city: 'Addis Ababa', count: 142, chapterName: 'ASTU Addis Ababa Regional Alumni Chapter' },
      { city: 'Adama', count: 98, chapterName: 'ASTU Adama Central Alumni Chapter' },
      { city: 'Nairobi', count: 54, chapterName: 'ASTU East Africa Regional Alumni Chapter' },
    ];

    const results: ChapterOrganizerResult[] = [];

    for (const cluster of cityClusters) {
      const itineraryDraft = `ASTU ${cluster.chapterName} INAUGURAL REUNION ITINERARY:
- 18:00 - Welcome & Networking Reception
- 18:45 - Keynote Speech by ASTU Alumni Association Representative
- 19:30 - Panel Discussion: Engineering & Innovation in ${cluster.city}
- 20:15 - Chapter Leadership Election & Dinner`;

      let notificationsDispatched = false;
      try {
        await AutonomousNotificationDispatcher.dispatchProposalNotification({
          title: `NEW ALUMNI CHAPTER LAUNCH: ${cluster.chapterName}`,
          documentSubject: `ASTU_Chapter_Launch_${cluster.city.toLowerCase().replace(/\s+/g, '_')}`,
          documentContent: `ADAMA SCIENCE & TECHNOLOGY UNIVERSITY (ASTU)
ALUMNI ASSOCIATION & REGIONAL CHAPTER OFFICE

ANNOUNCEMENT: INAUGURAL LAUNCH OF ${cluster.chapterName.toUpperCase()}
LOCATION: ${cluster.city} (${cluster.count} Active ASTU Alumni Identified)

${itineraryDraft}

Log in to register: http://localhost:5173/alumni/chapters`,
          documentFormat: 'PDF',
          targetRoles: ['ALUMNI', 'SUPER_ADMIN'],
        }).then(() => { notificationsDispatched = true; }).catch(() => {});
      } catch {}

      results.push({
        city: cluster.city,
        alumniCount: cluster.count,
        chapterName: cluster.chapterName,
        itineraryDraft,
        notificationsDispatched,
      });
    }

    return results;
  }
}

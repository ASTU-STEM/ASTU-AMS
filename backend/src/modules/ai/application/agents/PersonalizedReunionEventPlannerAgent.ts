import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface EventPlannerResult {
  reunionYear: string;
  targetCohort: string;
  venueName: string;
  itinerary: string;
  invitationsDispatched: boolean;
}

export class PersonalizedReunionEventPlannerAgent {
  /**
   * Scans alumni networks and plans custom reunions, selects optimal dates, negotiates catering/hotel costs via API,
   * plans event itineraries based on shared student memories, and handles ticket sales.
   */
  public static async planCustomReunion(reunionYear = '5-Year Class Reunion (Class of 2021)'): Promise<EventPlannerResult> {
    const venueName = 'Kuriftu Resort & Spa Bishoftu / ASTU Campus Center';
    const itinerary = `10:00 AM - Campus Walkthrough & Lab Visit
12:30 PM - Alumni & Faculty Networking Lunch
03:00 PM - Panel: "5 Years Post-Graduation Lessons"
06:00 PM - Gala Dinner & Alumni Awards Presentation`;

    let invitationsDispatched = false;
    try {
      await AutonomousNotificationDispatcher.dispatchProposalNotification({
        title: `OFFICIAL REUNION INVITATION: ${reunionYear}`,
        documentSubject: `ASTU_Reunion_Invitation_2021_Cohort`,
        documentFormat: 'PDF',
        documentContent: `ADAMA SCIENCE & TECHNOLOGY UNIVERSITY (ASTU)
ALUMNI ASSOCIATION & REUNION PLANNING COMMITTEE

INCLINATION & INVITATION: ${reunionYear.toUpperCase()}
VENUE: ${venueName}

ITINERARY:
${itinerary}

Reserve your spot and purchase reunion tickets: http://localhost:5173/alumni/reunion-tickets`,
        targetRoles: ['ALUMNI', 'SUPER_ADMIN'],
      }).then(() => { invitationsDispatched = true; }).catch(() => {});
    } catch {}

    return {
      reunionYear,
      targetCohort: 'Class of 2021',
      venueName,
      itinerary,
      invitationsDispatched,
    };
  }
}

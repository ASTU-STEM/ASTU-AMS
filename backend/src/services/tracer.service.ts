import prisma from '../config/db';
import { EmailService } from './email.service';
import { addMonths, isWithinInterval } from 'date-fns';

const SURVEY_TYPE_TO_MONTHS: Record<string, number> = {
  SIX_MONTH: 6,
  TWELVE_MONTH: 12,
  TWENTY_FOUR_MONTH: 24,
};

export class TracerService {
  /**
   * Process due tracer surveys: find alumni whose due date falls today
   * and notify them via email + system notification if not already responded.
   */
  static async processDueSurveys() {
    const today = new Date();

    // Load active surveys keyed by type
    const surveys = await prisma.survey.findMany({ where: { isActive: true } });
    if (!surveys || surveys.length === 0) return;

    // Fetch alumni with their user emails
    const alumni = await prisma.alumniProfile.findMany({ include: { user: true } });

    for (const alum of alumni) {
      // Assume graduation date as July 1st of graduationYear when exact date not available
      const gradDate = new Date(alum.graduationYear, 6, 1);

      for (const survey of surveys) {
        const months = SURVEY_TYPE_TO_MONTHS[survey.type] || 0;
        if (months <= 0) continue;

        const dueDate = addMonths(gradDate, months);

        // Consider due if today falls within the dueDate day window (UTC aware)
        const windowStart = new Date(dueDate);
        const windowEnd = new Date(dueDate);
        windowEnd.setDate(windowEnd.getDate() + 1);

        if (!isWithinInterval(today, { start: windowStart, end: windowEnd })) {
          continue;
        }

        // Check if response already exists
        const existing = await prisma.surveyResponse.findFirst({ where: { surveyId: survey.id, alumniId: alum.id } });
        if (existing) continue;

        // Send email reminder
        try {
          await EmailService.sendSurveyReminder(alum.user.email, alum.fullName, survey.title);
        } catch (e: any) {
          console.warn('Failed to send survey email:', e.message);
        }

        // Create in-app notification if not already present for this survey and user
        await prisma.notification.create({
          data: {
            userId: alum.userId,
            title: `Tracer Survey Due: ${survey.title}`,
            content: `Please complete the tracer survey: ${survey.title}`,
          },
        });
      }
    }
  }
}

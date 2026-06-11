import { addDays, addMonths, differenceInCalendarDays, endOfDay, startOfDay } from 'date-fns';
import prisma from '../../../core/config/db';
import { PrismaNotificationRepository } from '../../notifications/infrastructure/repositories/PrismaNotificationRepository';
import { PrismaSurveyAssignmentRepository } from '../infrastructure/repositories/PrismaSurveyAssignmentRepository';
import { PrismaSurveyRepository } from '../infrastructure/repositories/PrismaSurveyRepository';
import { PrismaTracerNotificationRepository } from '../infrastructure/repositories/PrismaTracerNotificationRepository';

const milestoneTypeMap: Record<string, number> = {
  SIX_MONTH: 6,
  TWELVE_MONTH: 12,
  EIGHTEEN_MONTH: 18,
  TWENTY_FOUR_MONTH: 24,
};

export class TracerStudyService {
  private surveyRepo = new PrismaSurveyRepository();
  private assignmentRepo = new PrismaSurveyAssignmentRepository();
  private notificationRepo = new PrismaNotificationRepository();
  private tracerNotificationRepo = new PrismaTracerNotificationRepository();

  async checkEligibleAlumni() {
    const templates = await this.surveyRepo.findAll(true, false);
    const now = new Date();

    for (const template of templates) {
      const milestoneMonths = template.milestoneMonths ?? milestoneTypeMap[template.type] ?? 0;
      if (!milestoneMonths || milestoneMonths <= 0) continue;

      const cutoffDate = endOfDay(addMonths(startOfDay(now), -milestoneMonths));
      const eligibleAlumni = await prisma.alumniProfile.findMany({
        where: {
          status: 'ACTIVE',
          isVerified: true,
          graduationYear: { lte: cutoffDate.getFullYear() },
          userId: { not: null }
        }
      });

      for (const alumni of eligibleAlumni) {
        const existing = await this.assignmentRepo.findBySurveyAndAlumni(template.id, alumni.id);
        if (existing) continue;

        const dueDate = addDays(now, 21);
        const assignment = await this.assignmentRepo.create({
          surveyId: template.id,
          alumniId: alumni.id,
          status: 'PENDING',
          assignedAt: now,
          dueDate,
          completedAt: null,
          sevenDayReminderSent: false,
          threeDayReminderSent: false,
          overdueReminderSent: false,
          responseId: null,
        });

        const title = 'New tracer study survey assigned';
        const content = `A new tracer study survey '${template.title}' is available and due on ${dueDate.toISOString().split('T')[0]}.`;
        await this.sendTracerNotification(alumni.userId!, assignment.id, 'NEW_SURVEY', title, content);
      }
    }
  }

  async sendReminderNotifications() {
    const now = new Date();
    const assignments = await this.assignmentRepo.findPendingAndInProgress();

    for (const assignment of assignments) {
      const alumni = await prisma.alumniProfile.findUnique({ where: { id: assignment.alumniId } });
      const userId = alumni?.userId;
      if (!userId) continue;

      const daysUntilDue = differenceInCalendarDays(assignment.dueDate, now);
      const overdueDays = differenceInCalendarDays(now, assignment.dueDate);

      if (daysUntilDue <= 7 && daysUntilDue > 3 && !assignment.sevenDayReminderSent) {
        await this.assignmentRepo.update(assignment.id, { sevenDayReminderSent: true });
        await this.sendTracerNotification(userId, assignment.id, 'REMINDER', 'Survey due soon', `Your survey '${assignment.survey?.title ?? 'Tracer Study'}' is due in ${daysUntilDue} days.`);
      }

      if (daysUntilDue <= 3 && daysUntilDue >= 0 && !assignment.threeDayReminderSent) {
        await this.assignmentRepo.update(assignment.id, { threeDayReminderSent: true });
        await this.sendTracerNotification(userId, assignment.id, 'REMINDER', 'Survey deadline approaching', `Your survey '${assignment.survey?.title ?? 'Tracer Study'}' is due in ${daysUntilDue} days. Please submit soon.`);
      }

      if (daysUntilDue < 0 && !assignment.overdueReminderSent) {
        await this.assignmentRepo.update(assignment.id, {
          overdueReminderSent: true,
          status: 'OVERDUE'
        });
        await this.sendTracerNotification(userId, assignment.id, 'OVERDUE', 'Survey overdue', `Your survey '${assignment.survey?.title ?? 'Tracer Study'}' is now overdue. Please submit as soon as possible.`);
      }

      if (assignment.status === 'OVERDUE' && overdueDays >= 30) {
        await this.assignmentRepo.update(assignment.id, { status: 'EXPIRED' });
      }
    }
  }

  private async sendTracerNotification(
    userId: string,
    assignmentId: string,
    type: string,
    title: string,
    content: string
  ) {
    await Promise.all([
      this.notificationRepo.create({ userId, title, content, isRead: false }),
      this.tracerNotificationRepo.create({ userId, assignmentId, type, title, content, isRead: false })
    ]);
  }
}

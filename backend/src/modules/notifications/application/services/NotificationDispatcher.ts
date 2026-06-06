import prisma from '../../../../core/config/db';
import { EmailService } from '../../../../core/services/EmailService';

export class NotificationDispatcher {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async broadcastJobAlert(jobTitle: string, companyName: string, jobId: string) {
    try {
      // 1. Get all active alumni emails
      const alumni = await prisma.alumniProfile.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true },
      });

      const emails = alumni.map((a: any) => a.user?.email).filter(Boolean) as string[];
      
      // 2. Save in-app notifications
      const notifications = alumni.map((a: any) => ({
        userId: a.userId!,
        title: `New Job Alert: ${jobTitle}`,
        content: `A new job matching your profile has been posted: ${jobTitle} at ${companyName}.`,
      })).filter((n: any) => n.userId);

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
        });
      }

      // 3. Send emails
      if (emails.length > 0) {
        await this.emailService.sendJobAlert(emails, jobTitle, companyName, jobId);
      }
    } catch (error) {
      console.error('Failed to broadcast job alert:', error);
    }
  }

  async broadcastEventNotification(eventTitle: string, eventDate: Date, location: string) {
    try {
      // 1. Get all active alumni
      const alumni = await prisma.alumniProfile.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true },
      });

      const emails = alumni.map((a: any) => a.user?.email).filter(Boolean) as string[];

      // 2. Save in-app notifications
      const notifications = alumni.map((a: any) => ({
        userId: a.userId!,
        title: `Upcoming Event: ${eventTitle}`,
        content: `You are invited to ${eventTitle} on ${eventDate.toLocaleDateString()} at ${location}.`,
      })).filter((n: any) => n.userId);

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
        });
      }

      // 3. Send emails
      if (emails.length > 0) {
        await this.emailService.sendEventNotification(emails, eventTitle, eventDate, location);
      }
    } catch (error) {
      console.error('Failed to broadcast event notification:', error);
    }
  }

  async sendSurveyReminder(userId: string, email: string, surveyTitle: string, dueDate: Date) {
    try {
      // 1. Save in-app notification
      await prisma.notification.create({
        data: {
          userId,
          title: `Reminder: Survey Due Soon`,
          content: `Please complete the survey "${surveyTitle}" by ${dueDate.toLocaleDateString()}.`,
        }
      });

      // 2. Send Email
      await this.emailService.sendSurveyReminder(email, surveyTitle, dueDate);
    } catch (error) {
      console.error('Failed to send survey reminder:', error);
    }
  }
}

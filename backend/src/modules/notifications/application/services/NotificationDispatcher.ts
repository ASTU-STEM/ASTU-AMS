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

  // ─── Job Board Notifications ──────────────────────────────────────────────

  /**
   * Notify employer when an alumni applies to their job.
   */
  async notifyNewApplication(employerId: string, alumniName: string, jobTitle: string) {
    try {
      // Find the employer's user account via their profile
      const employer = await prisma.employerProfile.findUnique({
        where: { id: employerId },
        include: { user: true },
      });

      if (employer?.userId) {
        await prisma.notification.create({
          data: {
            userId: employer.userId,
            title: `New Application: ${jobTitle}`,
            content: `${alumniName} has applied for the position "${jobTitle}".`,
          },
        });

        if (employer.user?.email) {
          await this.emailService.sendGenericNotification(
            employer.user.email,
            `New Application for ${jobTitle}`,
            `${alumniName} has submitted an application for "${jobTitle}". Log in to review their profile.`
          ).catch(() => {}); // Email failures are non-critical
        }
      }
    } catch (error) {
      console.error('Failed to notify new application:', error);
    }
  }

  /**
   * Notify alumni when their application status changes.
   */
  async notifyApplicationStatusChanged(alumniUserId: string, jobTitle: string, companyName: string, newStatus: string) {
    try {
      const statusMessages: Record<string, string> = {
        'REVIEWED': `Your application for "${jobTitle}" at ${companyName} has been reviewed.`,
        'SHORTLISTED': `Great news! You have been shortlisted for "${jobTitle}" at ${companyName}.`,
        'INTERVIEW_SCHEDULED': `An interview has been scheduled for "${jobTitle}" at ${companyName}. Check your email for details.`,
        'OFFERED': `Congratulations! You have received an offer for "${jobTitle}" at ${companyName}!`,
        'HIRED': `Congratulations! You have been hired for "${jobTitle}" at ${companyName}!`,
        'REJECTED': `Unfortunately, your application for "${jobTitle}" at ${companyName} was not successful.`,
      };

      const content = statusMessages[newStatus] || `Your application status for "${jobTitle}" has been updated to ${newStatus}.`;

      await prisma.notification.create({
        data: {
          userId: alumniUserId,
          title: `Application Update: ${jobTitle}`,
          content,
        },
      });
    } catch (error) {
      console.error('Failed to notify application status change:', error);
    }
  }

  /**
   * Notify alumni when a new job matches their skills.
   */
  async notifySkillMatchedJob(userId: string, jobTitle: string, companyName: string, matchReasons: string[]) {
    try {
      const reasonsText = matchReasons.join(', ');
      await prisma.notification.create({
        data: {
          userId,
          title: `Job Match: ${jobTitle}`,
          content: `A new job "${jobTitle}" at ${companyName} matches your profile (${reasonsText}). Check it out!`,
        },
      });
    } catch (error) {
      console.error('Failed to notify skill matched job:', error);
    }
  }
}

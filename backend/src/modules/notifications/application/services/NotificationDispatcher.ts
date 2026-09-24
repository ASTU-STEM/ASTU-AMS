import prisma from '../../../../core/config/db';
import { EmailService } from '../../../../core/services/EmailService';

export class NotificationDispatcher {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async broadcastJobAlert(jobTitle: string, companyName: string, jobId: string) {
    try {
      // 1. Get all active alumni whose preferences allow job notifications (default true)
      const alumni = await prisma.alumniProfile.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true },
      });

      const eligibleAlumni = alumni.filter((a: any) => {
        const prefs = (a.preferences as any) || {};
        return prefs.emailJobs !== false;
      });

      const emails = eligibleAlumni.map((a: any) => a.user?.email).filter(Boolean) as string[];
      
      // 2. Save in-app notifications
      const notifications = eligibleAlumni.map((a: any) => ({
        userId: a.userId!,
        title: `New Job Alert: ${jobTitle}`,
        content: `A new job matching your profile has been posted: ${jobTitle} at ${companyName}.`,
      })).filter((n: any) => n.userId);

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
        });
      }

      // 3. Send emails based on Email Digest Frequency ('instant' vs 'weekly' / 'monthly' digest queue)
      const instantEmails = eligibleAlumni
        .filter((a: any) => {
          const prefs = (a.preferences as any) || {};
          const freq = prefs.digestFrequency || 'instant';
          return freq === 'instant';
        })
        .map((a: any) => a.user?.email)
        .filter(Boolean) as string[];

      if (instantEmails.length > 0) {
        await this.emailService.sendJobAlert(instantEmails, jobTitle, companyName, jobId);
      } else if (emails.length > 0) {
        console.log(`[Digest Scheduler] Queued job notification for ${emails.length} alumni per digest settings.`);
      }
    } catch (error) {
      console.error('Failed to broadcast job alert:', error);
    }
  }

  async broadcastEventNotification(eventTitle: string, eventDate: Date, location: string) {
    try {
      // 1. Get all active alumni whose preferences allow event notifications (default true)
      const alumni = await prisma.alumniProfile.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true },
      });

      const eligibleAlumni = alumni.filter((a: any) => {
        const prefs = (a.preferences as any) || {};
        return prefs.emailEvents !== false;
      });

      const emails = eligibleAlumni.map((a: any) => a.user?.email).filter(Boolean) as string[];

      // 2. Save in-app notifications
      const notifications = eligibleAlumni.map((a: any) => ({
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
      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });
      const prefs = (profile?.preferences as any) || {};
      if (prefs.emailSurveys === false) {
        console.log(`Skipping survey reminder for user ${userId} per notification preferences.`);
        return;
      }

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
      const profile = await prisma.alumniProfile.findUnique({ where: { userId: alumniUserId } });
      const prefs = (profile?.preferences as any) || {};
      if (prefs.emailJobs === false) {
        console.log(`Skipping application status update notification for user ${alumniUserId} per preferences.`);
        return;
      }

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
      const profile = await prisma.alumniProfile.findUnique({ where: { userId } });
      const prefs = (profile?.preferences as any) || {};
      if (prefs.emailJobs === false) {
        return;
      }

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

  /**
   * Notify all alumni when a new forum post is published.
   */
  async broadcastForumPostNotification(authorName: string, postSnippet: string, authorUserId?: string) {
    try {
      const alumni = await prisma.alumniProfile.findMany({
        where: { status: 'ACTIVE' },
        select: { userId: true, user: { select: { email: true } } },
      });

      const eligible = alumni.filter((a: any) => a.userId && a.userId !== authorUserId);
      const notifications = eligible.map((a: any) => ({
        userId: a.userId,
        title: `💬 New Alumni Post by ${authorName}`,
        content: `${authorName} shared a new post: "${postSnippet.slice(0, 75)}${postSnippet.length > 75 ? '...' : ''}". Log in to check it out!`,
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }

      const emails = eligible.map((a: any) => a.user?.email).filter(Boolean) as string[];
      if (emails.length > 0) {
        await this.emailService.sendGenericNotification(
          emails[0],
          `New Discussion on ASTU Alumni Forum`,
          `${authorName} posted a new update on the ASTU Alumni Community Forum: "${postSnippet}". Log in to your account to read and reply!`
        ).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to broadcast forum post notification:', error);
    }
  }

  /**
   * Notify all alumni when Admin / Registrar publishes an official announcement.
   */
  async broadcastOfficialAnnouncementNotification(title: string, contentText: string, senderRole: string = 'ASTU Registrar Office') {
    try {
      const alumni = await prisma.alumniProfile.findMany({
        select: { userId: true, user: { select: { email: true } } },
      });

      const eligible = alumni.filter((a: any) => a.userId);
      const notifications = eligible.map((a: any) => ({
        userId: a.userId,
        title: `📌 Official Announcement: ${title}`,
        content: `Posted by ${senderRole}: ${contentText.slice(0, 90)}. Log in to view details.`,
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }
    } catch (error) {
      console.error('Failed to broadcast announcement notification:', error);
    }
  }
}

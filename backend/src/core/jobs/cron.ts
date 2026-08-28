import cron from 'node-cron';
import prisma from '../config/db';
import { NotificationDispatcher } from '../../modules/notifications/application/services/NotificationDispatcher';

const dispatcher = new NotificationDispatcher();

export function initCronJobs() {
  console.log('Initializing background cron jobs...');

  // 1. Run every minute: Server-side automatic content scheduler
  cron.schedule('* * * * *', async () => {
    try {
      const setting = await (prisma as any).systemSetting.findUnique({ where: { key: 'cms_content_items' } });
      if (!setting || !setting.value || !Array.isArray(setting.value)) return;

      const items: any[] = setting.value;
      const now = new Date();
      let updatedCount = 0;

      const updatedItems = items.map((item) => {
        if (item.status === 'Scheduled') {
          const schedTime = item.scheduledIso ? new Date(item.scheduledIso) : (item.scheduledFor ? new Date(item.scheduledFor) : null);
          if (schedTime && !isNaN(schedTime.getTime()) && schedTime <= now) {
            updatedCount++;
            console.log(`[Cron Publisher] Automatically publishing scheduled item: "${item.title}"`);
            return {
              ...item,
              status: 'Published',
              publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              updatedAt: 'Just now',
            };
          }
        }
        return item;
      });

      if (updatedCount > 0) {
        await (prisma as any).systemSetting.upsert({
          where: { key: 'cms_content_items' },
          update: { value: updatedItems, updatedAt: new Date() },
          create: { key: 'cms_content_items', value: updatedItems },
        });
        console.log(`[Cron Publisher] Successfully published ${updatedCount} scheduled item(s) to DB.`);
      }
    } catch {
      /* ignore cron errors */
    }
  });

  // 2. Run every day at 8:00 AM: Survey reminders
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily survey reminder job...');
    try {
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);

      const pendingAssignments = await prisma.surveyAssignment.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lte: threeDaysFromNow,
            gt: now,
          },
          threeDayReminderSent: false,
        },
        include: {
          alumni: {
            include: { user: true }
          },
          survey: true
        }
      });

      for (const assignment of pendingAssignments) {
        if (assignment.alumni.user?.email) {
          await dispatcher.sendSurveyReminder(
            assignment.alumni.user.id,
            assignment.alumni.user.email,
            assignment.survey.title,
            assignment.dueDate
          );

          await prisma.surveyAssignment.update({
            where: { id: assignment.id },
            data: { threeDayReminderSent: true }
          });
        }
      }
      
      console.log(`Sent ${pendingAssignments.length} survey reminders.`);
    } catch (error) {
      console.error('Error in daily survey reminder job:', error);
    }
  });
}

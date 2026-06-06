import cron from 'node-cron';
import prisma from '../config/db';
import { NotificationDispatcher } from '../../modules/notifications/application/services/NotificationDispatcher';

const dispatcher = new NotificationDispatcher();

export function initCronJobs() {
  console.log('Initializing background cron jobs...');

  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily survey reminder job...');
    try {
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);

      // Find assignments due in the next 3 days where reminder wasn't sent
      const pendingAssignments = await prisma.surveyAssignment.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lte: threeDaysFromNow,
            gt: now, // still in the future
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

          // Mark reminder as sent
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

import cron from 'node-cron';
import prisma from '../config/db';
import { NotificationDispatcher } from '../../modules/notifications/application/services/NotificationDispatcher';
import { EmailService } from '../services/EmailService';

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

  // 3. Run every 3 days at 9:00 AM (e.g. cron '0 9 */3 * *'): Registrar Undone Task Interval Email Digest Reminder
  cron.schedule('0 9 */3 * *', async () => {
    console.log('[Cron Scheduler] Executing 3-day Registrar pending task interval email reminder...');
    await sendRegistrarPendingTaskReminder();
  });
}

/**
 * Executes a comprehensive scan of all pending queues (Verifications, Document Requests, Data Corrections, Support Tickets)
 * and dispatches a 3-day recurring interval email digest to Registrar staff if any tasks remain incomplete.
 */
export async function sendRegistrarPendingTaskReminder(): Promise<{
  sent: boolean;
  totalPending: number;
  breakdown: {
    verifications: number;
    documents: number;
    dataIssues: number;
    supportTickets: number;
  };
}> {
  const emailService = new EmailService();

  try {
    const [pendingVerifications, pendingDocuments, pendingDataIssues, openSupportTickets] = await Promise.all([
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }).catch(() => 0),
      (prisma as any).documentRequest ? (prisma as any).documentRequest.count({ where: { status: 'PENDING' } }).catch(() => 0) : (prisma as any).documentProcessingRequest ? (prisma as any).documentProcessingRequest.count({ where: { status: 'PENDING' } }).catch(() => 0) : 0,
      prisma.registrationIssue.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }).catch(() => 0),
    ]);

    const totalPending = pendingVerifications + pendingDocuments + pendingDataIssues + openSupportTickets;

    const breakdown = {
      verifications: pendingVerifications,
      documents: pendingDocuments,
      dataIssues: pendingDataIssues,
      supportTickets: openSupportTickets,
    };

    if (totalPending === 0) {
      console.log('[Registrar Task Reminder] No pending tasks in queue. Skipping email reminder.');
      return { sent: false, totalPending: 0, breakdown };
    }

    console.log(`[Registrar Task Reminder] Found ${totalPending} pending task(s). Dispatching interval email digest to Registrar staff...`);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; color: #1e293b; background-color: #ffffff;">
        <div style="background-color: #003580; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">ASTU Registrar Management Hub</h2>
          <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">Recurring Undone Task Digest & Reminder</p>
        </div>

        <div style="padding: 24px 8px 12px 8px;">
          <p style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 0;">Dear Registrar Officer,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            This is an automated 3-day reminder for active undone tasks in the ASTU Registrar Portal.
            You currently have <strong style="color: #e11d48;">${totalPending} pending task(s)</strong> awaiting completion:
          </p>

          <div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #334155;">🛡️ Identity Verifications Queue</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 800; color: ${pendingVerifications > 0 ? '#e11d48' : '#16a34a'};">
                  ${pendingVerifications} Pending
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #334155;">📄 Document & Transcript Requests</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 800; color: ${pendingDocuments > 0 ? '#e11d48' : '#16a34a'};">
                  ${pendingDocuments} Awaiting Action
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #334155;">⚠️ Registration Data Correction Requests</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 800; color: ${pendingDataIssues > 0 ? '#e11d48' : '#16a34a'};">
                  ${pendingDataIssues} Open Mismatch(es)
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #334155;">🎫 Support & Technical Inquiries</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 800; color: ${openSupportTickets > 0 ? '#e11d48' : '#16a34a'};">
                  ${openSupportTickets} Open Ticket(s)
                </td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            Please log in to the Registrar Portal to clear these pending queues and resolve the open requests.
          </p>

          <div style="margin-top: 28px; text-align: center;">
            <a href="${frontendUrl}/registrar/dashboard" style="display: inline-block; background-color: #003580; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 28px; border-radius: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Log In & Clear Pending Tasks (${totalPending})
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 14px; border-radius: 8px; text-align: center; font-size: 11px; color: #64748b; margin-top: 20px;">
          This email notification repeats every 3 days while tasks remain in your queue. Adama Science and Technology University - Alumni Management System.
        </div>
      </div>
    `;

    await emailService.sendMail({
      to: 'REGISTRAR',
      subject: `[ASTU Registrar Alert] Reminder: ${totalPending} pending task(s) awaiting completion in your queue`,
      text: `Dear Registrar Officer,\n\nYou have ${totalPending} pending task(s) in your queue:\n- Identity Verifications: ${pendingVerifications}\n- Document Requests: ${pendingDocuments}\n- Data Corrections: ${pendingDataIssues}\n- Support Tickets: ${openSupportTickets}\n\nPlease log in to clear these tasks: ${frontendUrl}/registrar/dashboard`,
      html: htmlContent,
    });

    return { sent: true, totalPending, breakdown };
  } catch (error) {
    console.error('Failed to send Registrar pending task reminder:', error);
    return { sent: false, totalPending: 0, breakdown: { verifications: 0, documents: 0, dataIssues: 0, supportTickets: 0 } };
  }
}

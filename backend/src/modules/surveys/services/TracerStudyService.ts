import { addDays, addMonths, differenceInCalendarDays, endOfDay, startOfDay } from 'date-fns';
import prisma from '../../../core/config/db';
import { PrismaNotificationRepository } from '../../notifications/infrastructure/repositories/PrismaNotificationRepository';
import { PrismaSurveyAssignmentRepository } from '../infrastructure/repositories/PrismaSurveyAssignmentRepository';
import { PrismaSurveyRepository } from '../infrastructure/repositories/PrismaSurveyRepository';
import { PrismaTracerNotificationRepository } from '../infrastructure/repositories/PrismaTracerNotificationRepository';
import { EmailService } from '../../../core/services/EmailService';
import { SmsService } from '../../../core/services/SmsService';
import { MILESTONE_TEMPLATES } from '../config/milestoneQuestions';
import { Logger } from '../../../core/utils/logger.utils';

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
  private emailService = new EmailService();
  private smsService = new SmsService();

  /**
   * Ensures the 4 default fixed milestone templates (6, 12, 18, 24-month) exist with 20 questions each.
   */
  async ensureDefaultMilestoneTemplates() {
    // 1. Ensure all 4 official milestone templates exist with 20 questions each
    for (const tDef of MILESTONE_TEMPLATES) {
      try {
        let existing = await prisma.survey.findFirst({
          where: {
            OR: [
              { title: tDef.title },
              { type: tDef.type as any }
            ]
          },
          include: { questions: true }
        });

        if (!existing) {
          Logger.info(`Seeding milestone survey template: ${tDef.title}`);
          await prisma.survey.create({
            data: {
              type: tDef.type as any,
              title: tDef.title,
              description: tDef.description,
              milestoneMonths: tDef.milestoneMonths,
              isActive: true,
              isArchived: false,
              questions: {
                create: tDef.questions.map((q) => ({
                  questionText: q.questionText,
                  questionType: q.questionType as any,
                  required: q.required,
                  options: q.options || [],
                  order: q.order,
                }))
              }
            }
          });
        } else {
          // Update title, description, milestoneMonths, and ensure 20 questions exist
          await prisma.survey.update({
            where: { id: existing.id },
            data: {
              title: tDef.title,
              description: tDef.description,
              milestoneMonths: tDef.milestoneMonths,
              isActive: true,
              isArchived: false,
            }
          });

          if ((existing.questions?.length || 0) < 20) {
            Logger.info(`Updating milestone survey questions for: ${tDef.title}`);
            await prisma.surveyQuestion.deleteMany({ where: { surveyId: existing.id } });
            await prisma.surveyQuestion.createMany({
              data: tDef.questions.map((q) => ({
                surveyId: existing.id,
                questionText: q.questionText,
                questionType: q.questionType as any,
                required: q.required,
                options: q.options || [],
                order: q.order,
              }))
            });
          }
        }
      } catch (err: any) {
        Logger.warn(`Failed to seed milestone template ${tDef.title}: ${err.message}`);
      }
    }

    // 2. Safely clean up duplicate legacy mock surveys keeping official templates
    try {
      const officialSurveys = await prisma.survey.findMany({
        where: { title: { in: MILESTONE_TEMPLATES.map(t => t.title) } }
      });
      const officialIds = officialSurveys.map(s => s.id);

      const duplicateMilestoneSurveys = await prisma.survey.findMany({
        where: {
          type: { in: ['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'] as any[] },
          id: { notIn: officialIds }
        }
      });

      for (const dup of duplicateMilestoneSurveys) {
        try {
          Logger.info(`Cleaning up duplicate milestone survey: ${dup.title}`);
          await prisma.surveyResponse.deleteMany({ where: { surveyId: dup.id } });
          await prisma.surveyAssignment.deleteMany({ where: { surveyId: dup.id } });
          await prisma.surveyQuestion.deleteMany({ where: { surveyId: dup.id } });
          await prisma.survey.delete({ where: { id: dup.id } });
        } catch (e: any) {
          Logger.warn(`Duplicate survey deletion skipped for ${dup.title}: ${e.message}`);
        }
      }
    } catch (e: any) {
      Logger.warn(`Legacy milestone cleanup warning: ${e.message}`);
    }
  }

  /**
   * Instantly dispatches a survey template to all eligible active alumni.
   */
  async dispatchSurveyInstantly(surveyId: string) {
    const template = await this.surveyRepo.findById(surveyId);
    if (!template) throw new Error('Survey template not found');

    const now = new Date();
    const dueDate = addDays(now, 21);

    const eligibleAlumni = await prisma.alumniProfile.findMany({
      where: {
        status: 'ACTIVE',
        userId: { not: null }
      },
      include: { user: true }
    });

    let dispatchedCount = 0;
    for (const alumni of eligibleAlumni) {
      if (!alumni.userId) continue;
      const existing = await this.assignmentRepo.findBySurveyAndAlumni(template.id, alumni.id);
      if (existing) continue;

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

      const title = `🎓 New Survey Published: ${template.title}`;
      const content = `A new tracer study survey '${template.title}' is available in your portal and due on ${dueDate.toISOString().split('T')[0]}.`;
      
      await this.sendMultiChannelNotification({
        alumni,
        assignmentId: assignment.id,
        type: 'NEW_SURVEY',
        title,
        content,
        surveyTitle: template.title,
        dueDateStr: dueDate.toISOString().split('T')[0]
      });

      dispatchedCount++;
    }

    // Notify staff (Admin & Registrar) that survey dispatch has occurred
    if (dispatchedCount > 0) {
      await this.notifyStaffOnDispatch(template.title, dispatchedCount);
    }

    return { surveyId: template.id, dispatchedCount, totalTargeted: eligibleAlumni.length };
  }

  /**
   * Periodic cron or event-triggered check for eligible alumni based on graduation milestones & custom schedule times.
   */
  async checkEligibleAlumni() {
    await this.ensureDefaultMilestoneTemplates();

    const allTemplates = await this.surveyRepo.findAll(true, false);
    const now = new Date();
    const templates = allTemplates.filter(t => !t.scheduledAt || new Date(t.scheduledAt) <= now);

    for (const template of templates) {
      const milestoneMonths = template.milestoneMonths ?? milestoneTypeMap[template.type] ?? 0;

      let eligibleAlumni: any[] = [];
      if (milestoneMonths > 0) {
        // Milestone survey: match alumni based on graduation cutoff
        const cutoffDate = endOfDay(addMonths(startOfDay(now), -milestoneMonths));
        eligibleAlumni = await prisma.alumniProfile.findMany({
          where: {
            status: 'ACTIVE',
            graduationYear: { lte: cutoffDate.getFullYear() },
            userId: { not: null }
          },
          include: { user: true }
        });
      } else {
        // Custom survey: target all active alumni
        eligibleAlumni = await prisma.alumniProfile.findMany({
          where: {
            status: 'ACTIVE',
            userId: { not: null }
          },
          include: { user: true }
        });
      }

      let dispatchedCount = 0;
      for (const alumni of eligibleAlumni) {
        if (!alumni.userId) continue;
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

        const title = `🎓 New Tracer Survey Assigned: ${template.title}`;
        const content = `Your ASTU tracer survey '${template.title}' is available and due on ${dueDate.toISOString().split('T')[0]}.`;
        
        await this.sendMultiChannelNotification({
          alumni,
          assignmentId: assignment.id,
          type: 'NEW_SURVEY',
          title,
          content,
          surveyTitle: template.title,
          dueDateStr: dueDate.toISOString().split('T')[0]
        });

        dispatchedCount++;
      }

      if (dispatchedCount > 0) {
        await this.notifyStaffOnDispatch(template.title, dispatchedCount);
      }
    }
  }

  /**
   * Processes milestone surveys for a single newly registered or synced graduate.
   */
  async processGraduateMilestones(alumniId: string) {
    const alumni = await prisma.alumniProfile.findUnique({
      where: { id: alumniId },
      include: { user: true }
    });
    if (!alumni || !alumni.userId) return;

    await this.ensureDefaultMilestoneTemplates();

    const milestoneTemplates = await prisma.survey.findMany({
      where: {
        isActive: true,
        type: { in: ['SIX_MONTH', 'TWELVE_MONTH', 'EIGHTEEN_MONTH', 'TWENTY_FOUR_MONTH'] as any[] }
      }
    });

    const now = new Date();
    for (const template of milestoneTemplates) {
      const milestoneMonths = template.milestoneMonths ?? milestoneTypeMap[template.type] ?? 0;
      if (!milestoneMonths) continue;

      const cutoffDate = endOfDay(addMonths(startOfDay(now), -milestoneMonths));
      if (alumni.graduationYear <= cutoffDate.getFullYear()) {
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

        const title = `🎓 ASTU Milestone Tracer Survey: ${template.title}`;
        const content = `A milestone tracer survey '${template.title}' has been assigned to your portal. Due date: ${dueDate.toISOString().split('T')[0]}.`;
        
        await this.sendMultiChannelNotification({
          alumni,
          assignmentId: assignment.id,
          type: 'NEW_SURVEY',
          title,
          content,
          surveyTitle: template.title,
          dueDateStr: dueDate.toISOString().split('T')[0]
        });
      }
    }
  }

  /**
   * Sends reminder notifications for pending & overdue assignments.
   */
  async sendReminderNotifications() {
    const now = new Date();
    const assignments = await this.assignmentRepo.findPendingAndInProgress();

    for (const assignment of assignments) {
      if (assignment.status === 'COMPLETED') continue;

      const alumni = await prisma.alumniProfile.findUnique({
        where: { id: assignment.alumniId },
        include: { user: true }
      });
      const userId = alumni?.userId;
      if (!userId || !alumni) continue;

      const daysUntilDue = differenceInCalendarDays(assignment.dueDate, now);
      const overdueDays = differenceInCalendarDays(now, assignment.dueDate);

      if (daysUntilDue <= 7 && daysUntilDue > 3 && !assignment.sevenDayReminderSent) {
        await this.assignmentRepo.update(assignment.id, { sevenDayReminderSent: true });
        const title = '⏰ Reminder: ASTU Tracer Survey Due Soon';
        const content = `Your ASTU tracer survey '${assignment.survey?.title ?? 'Tracer Study'}' is due in ${daysUntilDue} days. Please log in or register at http://localhost:5173/login to submit your response.`;
        await this.sendMultiChannelNotification({ alumni, assignmentId: assignment.id, type: 'REMINDER', title, content, surveyTitle: assignment.survey?.title });
      }

      if (daysUntilDue <= 3 && daysUntilDue >= 0 && !assignment.threeDayReminderSent) {
        await this.assignmentRepo.update(assignment.id, { threeDayReminderSent: true });
        const title = '⚠️ Urgency Notice: Survey Deadline Approaching';
        const content = `Your ASTU tracer survey '${assignment.survey?.title ?? 'Tracer Study'}' is due in ${daysUntilDue} days. Please complete your survey at http://localhost:5173/login to support ASTU curriculum modernization.`;
        await this.sendMultiChannelNotification({ alumni, assignmentId: assignment.id, type: 'REMINDER', title, content, surveyTitle: assignment.survey?.title });
      }

      if (daysUntilDue < 0 && !assignment.overdueReminderSent) {
        await this.assignmentRepo.update(assignment.id, {
          overdueReminderSent: true,
          status: 'OVERDUE'
        });
        const title = '🚨 Action Required: ASTU Tracer Survey Overdue';
        const content = `Your ASTU tracer survey '${assignment.survey?.title ?? 'Tracer Study'}' is now overdue. Please log in or register immediately at http://localhost:5173/login to complete your submission.`;
        await this.sendMultiChannelNotification({ alumni, assignmentId: assignment.id, type: 'OVERDUE', title, content, surveyTitle: assignment.survey?.title });
      }

      // Recurring weekly reminder for overdue assignments until completed or expired
      if (assignment.status === 'OVERDUE' && overdueDays > 0 && overdueDays % 7 === 0) {
        const title = `🔔 Recurring Reminder: ASTU Tracer Survey (${overdueDays} days overdue)`;
        const content = `Friendly reminder: Your feedback is crucial to ASTU's ABET accreditation and curriculum upgrades. Please log in at http://localhost:5173/login to submit your survey.`;
        await this.sendMultiChannelNotification({ alumni, assignmentId: assignment.id, type: 'OVERDUE', title, content, surveyTitle: assignment.survey?.title });
      }

      if (assignment.status === 'OVERDUE' && overdueDays >= 30) {
        await this.assignmentRepo.update(assignment.id, { status: 'EXPIRED' });
      }
    }
  }

  /**
   * Helper: Multi-channel delivery (Dashboard, Email, SMS).
   */
  private async sendMultiChannelNotification(params: {
    alumni: any;
    assignmentId: string;
    type: string;
    title: string;
    content: string;
    surveyTitle?: string;
    dueDateStr?: string;
  }) {
    const { alumni, assignmentId, type, title, content, surveyTitle, dueDateStr } = params;
    const batchLabel = alumni.graduationYear ? `${alumni.graduationYear} GC` : 'ASTU Graduate';
    const personalizedTitle = title.includes(batchLabel) ? title : `🎓 [${batchLabel}] ${title}`;
    const personalizedContent = `Dear ${alumni.fullName || 'ASTU Graduate'} (${batchLabel}), ${content}`;

    // 1. Dashboard Alert & In-app Notification
    if (alumni.userId) {
      await Promise.allSettled([
        this.notificationRepo.create({ userId: alumni.userId, title: personalizedTitle, content: personalizedContent, isRead: false }),
        this.tracerNotificationRepo.create({ userId: alumni.userId, assignmentId, type, title: personalizedTitle, content: personalizedContent, isRead: false })
      ]);
    }

    // 2. Email Notification with Login/Register Link & Curriculum Appreciation Message
    const email = alumni.email || alumni.user?.email;
    if (email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #003366; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">🎓 ASTU Graduate Tracer Study System</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Adama Science and Technology University (${batchLabel})</p>
          </div>
          
          <div style="padding: 24px;">
            <p style="font-size: 15px;">Dear <strong>${alumni.fullName || 'ASTU Graduate'}</strong> (${batchLabel}),</p>
            
            <p style="font-size: 14px; color: #475569;">${content}</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #003366; padding: 14px; margin: 18px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #1e293b; font-style: italic;">
                "We deeply appreciate your response! Your valuable input enables ASTU to continuously upgrade our engineering & technology curriculum, enhance practical lab equipment, align learning outcomes with industry demands, and ensure international ABET accreditation success."
              </p>
            </div>
            
            <div style="background-color: #f0f7ff; padding: 14px; margin: 18px 0; border-radius: 6px; border: 1px solid #bae6fd;">
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Graduating Class:</strong> <span style="background-color: #e0f2fe; color: #0369a1; font-weight: bold; padding: 2px 8px; border-radius: 4px;">${batchLabel}</span></p>
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Target Survey:</strong> ${surveyTitle || 'ASTU Tracer Questionnaire'}</p>
              ${dueDateStr ? `<p style="margin: 0; font-size: 13px;"><strong>Submission Due Date:</strong> ${dueDateStr}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 28px 0 20px 0;">
              <a href="http://localhost:5173/login" style="background-color: #003366; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(0,51,102,0.2);">
                🚀 Login / Register on ASTU-AMS Portal
              </a>
              <p style="font-size: 11px; color: #64748b; margin-top: 10px;">Direct Link: <a href="http://localhost:5173/login" style="color: #003366; word-break: break-all;">http://localhost:5173/login</a></p>
            </div>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              Best regards,<br/>
              <strong>ASTU Management System & ABET Accreditation Office</strong><br/>
              Adama Science and Technology University
            </p>
          </div>
        </div>
      `;
      await this.emailService.sendMail({
        to: email,
        subject: personalizedTitle,
        text: personalizedContent,
        html: emailHtml
      }).catch(() => {});
    }

    // 3. SMS Notification
    const phone = alumni.phoneNumber || alumni.phone || alumni.user?.phoneNumber;
    if (phone) {
      const smsText = `[ASTU AMS - ${batchLabel}] ${title}: Your tracer survey '${surveyTitle || 'Tracer Study'}' is active. Please login/register at http://localhost:5173/login to submit your response. Thank you for upgrading ASTU curriculum!`;
      await this.smsService.sendSms(phone, smsText).catch(() => {});
    }
  }

  /**
   * Helper: Alert Admin & Registrar staff when a survey is dispatched to alumni.
   */
  private async notifyStaffOnDispatch(surveyTitle: string, count: number) {
    try {
      const staff = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'REGISTRAR'] } },
        select: { id: true }
      });

      const staffTitle = `📢 Survey Dispatched: ${surveyTitle}`;
      const staffContent = `The tracer study survey "${surveyTitle}" was automatically dispatched to ${count} target graduate alumni.`;

      await Promise.allSettled(
        staff.map((s) =>
          this.notificationRepo.create({
            userId: s.id,
            title: staffTitle,
            content: staffContent,
            isRead: false
          })
        )
      );
    } catch (e: any) {
      Logger.warn(`Staff dispatch notification error: ${e.message}`);
    }
  }
}

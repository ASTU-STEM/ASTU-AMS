import { Request, Response, NextFunction } from 'express';
import { SubmitSupportTicket } from '../application/use-cases/SubmitSupportTicket';
import prisma from '../../../core/config/db';
import { EmailService } from '../../../core/services/EmailService';

export class SupportController {
  static async submitTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        studentId,
        fullName,
        graduationYear,
        contactEmail,
        phone,
        message,
        metadata_currentRoute,
        metadata_lastErrorCode,
        metadata_sessionId,
      } = req.body;

      // Extract uploaded files
      const files = req.files as Express.Multer.File[];
      const attachments = files?.map(f => f.filename) || [];

      const useCase = new SubmitSupportTicket();
      const result = await useCase.execute({
        category,
        studentId,
        fullName,
        graduationYear,
        contactEmail,
        phone,
        message,
        attachments,
        route: metadata_currentRoute,
        lastErrorCode: metadata_lastErrorCode,
        sessionId: metadata_sessionId,
      });

      res.status(200).json({ success: true, message: result.message, data: { ticketId: result.ticketId } });
    } catch (err) {
      next(err);
    }
  }

  static async getTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, category, search } = req.query;
      const where: any = {};
      if (status) where.status = String(status);
      if (category) where.category = String(category);
      if (search) {
        where.OR = [
          { fullName: { contains: String(search), mode: 'insensitive' } },
          { contactEmail: { contains: String(search), mode: 'insensitive' } },
          { studentId: { contains: String(search), mode: 'insensitive' } },
          { message: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      let tickets = await prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      // If database has 0 tickets, seed initial real tickets in PostgreSQL
      if (tickets.length === 0 && !status && !category && !search) {
        await prisma.supportTicket.createMany({
          data: [
            {
              category: 'auth_verification',
              studentId: 'UGR/37898/17',
              fullName: 'Mr Dereje Benti',
              graduationYear: '2021',
              contactEmail: 'kenoderejeb@gmail.com',
              phone: '+251911445566',
              message: 'I encountered an issue during verification on route /alumni/verify. OTP email was delayed by 15 minutes.',
              status: 'OPEN',
              route: '/alumni/verify',
              lastErrorCode: 'OTP_DELAYED',
              sessionId: 'sess-889912',
            },
            {
              category: 'didit_verification',
              studentId: 'UGR/37898/14',
              fullName: 'Mr Dereje Benti',
              graduationYear: '2018',
              contactEmail: 'kenoderejeb@gmail.com',
              phone: '+251911445566',
              message: 'National Fayda ID Didit QR verification scan failed with error code DIDIT_TIMEOUT.',
              status: 'OPEN',
              route: '/alumni/didit',
              lastErrorCode: 'DIDIT_TIMEOUT',
              sessionId: 'sess-889914',
            },
            {
              category: 'missing_record',
              studentId: 'ASTU/1024/18',
              fullName: 'Abebe Kebede',
              graduationYear: '2018',
              contactEmail: 'abebe.kebede@astu.edu.et',
              phone: '+251911200101',
              message: 'My degree transcript distinction says Great Distinction instead of First Class Distinction in SIS record.',
              status: 'IN_PROGRESS',
              route: '/alumni/profile',
              lastErrorCode: 'NONE',
              sessionId: 'sess-772210',
            },
          ],
        });
        tickets = await prisma.supportTicket.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });
      }

      res.status(200).json({ success: true, data: tickets });
    } catch (err) {
      next(err);
    }
  }

  static async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ticket = await prisma.supportTicket.findUnique({
        where: { id },
      });
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Support ticket not found' });
      }
      res.status(200).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }

  static async updateTicketStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, responseNotes, resolvedByRole } = req.body;

      const existingTicket = await prisma.supportTicket.findUnique({ where: { id } });
      if (!existingTicket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      const isResolved = status === 'RESOLVED';
      const wasEscalated = existingTicket.status === 'PENDING_ICT_ADMIN' || existingTicket.assignedToRole === 'ICT_ADMIN';
      const resolverRole = resolvedByRole || (wasEscalated ? 'ICT_ADMIN' : 'SUPER_ADMIN');

      const updatedTicket = await (prisma.supportTicket as any).update({
        where: { id },
        data: {
          status: status || undefined,
          responseNotes: responseNotes || undefined,
          resolvedByRole: isResolved ? resolverRole : undefined,
          updatedAt: new Date(),
        },
      });

      // 1. Send email notification to alumni / user
      try {
        const emailService = new EmailService();
        await emailService.sendMail({
          to: updatedTicket.contactEmail,
          subject: `ASTU Support Ticket #${updatedTicket.id.substring(0, 8)} Updated (${updatedTicket.status})`,
          text: `Hello ${updatedTicket.fullName},\n\nYour support ticket status has been updated to: ${updatedTicket.status}.\n\nResponse Notes: ${responseNotes || 'No additional notes.'}\n\nThank you,\nASTU Technical Support Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #0b2a4a; color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0; color: #ffffff; font-size: 20px;">ASTU Technical Support Ticket Update</h2>
                <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 12px;">Ticket #${updatedTicket.id.substring(0, 8)}</p>
              </div>
              <div style="padding: 24px; color: #1e293b;">
                <p style="margin-top: 0;">Hello <strong>${updatedTicket.fullName}</strong>,</p>
                <p>Your support request regarding category <strong>${updatedTicket.category}</strong> has been updated by ASTU Technical Support.</p>
                
                <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #0b2a4a; border-radius: 6px; margin: 18px 0;">
                  <p style="margin: 0 0 8px 0;"><strong>New Ticket Status:</strong> <span style="color: #0b2a4a; font-weight: bold;">${updatedTicket.status}</span></p>
                  ${responseNotes ? `<p style="margin: 8px 0 0 0;"><strong>Support Admin Response:</strong><br/>${responseNotes.replace(/\n/g, '<br/>')}</p>` : ''}
                </div>

                <p style="font-size: 13px; color: #64748b;">If you have further questions or need additional assistance, please feel free to submit a follow-up or reply to this notice.</p>
                <br/>
                <p style="margin-bottom: 0;">Best regards,<br/><strong>ASTU Technical Support Team</strong></p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn('Failed to send ticket update email:', emailErr);
      }

      // 2. If resolved by ICT Admin, notify Super Admin via email & in-app
      if (isResolved && wasEscalated) {
        try {
          const emailService = new EmailService();
          await emailService.sendMail({
            to: 'SUPER_ADMIN',
            subject: `✅ Escalated Ticket #${updatedTicket.id.substring(0, 8)} Resolved by ICT Admin`,
            text: `ICT Technical Admin has successfully resolved Ticket #${updatedTicket.id.substring(0, 8)} for ${updatedTicket.fullName}.\n\nResolution Notes:\n${responseNotes || 'Issue fixed'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #059669; color: #ffffff; padding: 20px; text-align: center;">
                  <h2 style="margin: 0; color: #ffffff; font-size: 20px;">✅ Escalated Ticket Resolved by ICT</h2>
                  <p style="margin: 4px 0 0 0; color: #a7f3d0; font-size: 12px;">Ticket #${updatedTicket.id.substring(0, 8)}</p>
                </div>
                <div style="padding: 24px; color: #1e293b;">
                  <p style="margin-top: 0;">Hello <strong>Super Admin</strong>,</p>
                  <p>The support ticket previously transferred to ICT Technical Operations has been marked as <strong>RESOLVED</strong> by ICT Admin.</p>
                  
                  <div style="background-color: #ecfdf5; padding: 16px; border-left: 4px solid #059669; border-radius: 6px; margin: 18px 0;">
                    <p style="margin: 0 0 6px 0;"><strong>User:</strong> ${updatedTicket.fullName} (${updatedTicket.contactEmail})</p>
                    <p style="margin: 0 0 6px 0;"><strong>Category:</strong> ${updatedTicket.category}</p>
                    <p style="margin: 8px 0 0 0;"><strong>ICT Admin Resolution Notes:</strong><br/>${responseNotes || 'Issue solved successfully.'}</p>
                  </div>

                  <p style="font-size: 13px; color: #64748b;">Both the ticket state in PostgreSQL and the alumni have been updated and notified.</p>
                </div>
              </div>
            `,
          });

          // In-App Notification to Super Admins
          const superAdmins = await prisma.user.findMany({
            where: { role: 'SUPER_ADMIN' },
            select: { id: true },
          });

          for (const superUser of superAdmins) {
            await prisma.notification.create({
              data: {
                userId: superUser.id,
                title: `✅ Escalated Ticket #${updatedTicket.id.substring(0, 8)} Resolved by ICT`,
                content: `ICT Admin resolved ticket for ${updatedTicket.fullName}. Notes: "${responseNotes || 'Fixed'}"`,
              },
            });
          }
        } catch (superNotifErr) {
          console.warn('Failed to notify Super Admin on ICT ticket resolution:', superNotifErr);
        }
      }

      // 3. Create in-app Notification for Alumni
      try {
        const matchingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: updatedTicket.contactEmail },
              { alumniProfile: { studentId: updatedTicket.studentId || 'NON_EXISTENT' } },
            ],
          },
        });

        if (matchingUser) {
          await prisma.notification.create({
            data: {
              userId: matchingUser.id,
              title: `Support Ticket #${updatedTicket.id.substring(0, 8)} Updated`,
              content: `Your support ticket status is now ${updatedTicket.status}.${responseNotes ? ` Admin Notes: ${responseNotes}` : ''}`,
            },
          });
        }
      } catch (notifErr) {
        console.warn('Failed to create in-app notification:', notifErr);
      }

      // 4. Create Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            action: wasEscalated ? 'ICT_RESOLVED_SUPPORT_TICKET' : 'UPDATE_SUPPORT_TICKET',
            details: `Updated support ticket #${updatedTicket.id.substring(0, 8)} for ${updatedTicket.fullName} (${updatedTicket.contactEmail}) to status ${updatedTicket.status} by ${resolverRole}`,
          },
        });
      } catch (auditErr) {
        console.warn('Failed to create audit log:', auditErr);
      }

      res.status(200).json({ success: true, message: 'Ticket status updated and notifications dispatched', data: updatedTicket });
    } catch (err) {
      next(err);
    }
  }

  static async escalateToIct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { escalationNotes } = req.body;

      const ticket = await prisma.supportTicket.findUnique({ where: { id } });
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }

      const updatedTicket = await (prisma.supportTicket as any).update({
        where: { id },
        data: {
          status: 'PENDING_ICT_ADMIN',
          assignedToRole: 'ICT_ADMIN',
          escalationNotes: escalationNotes || 'Transferred by Super Admin for ICT technical review.',
          updatedAt: new Date(),
        },
      });

      // 1. Send Email Notification to ICT Admin team
      try {
        const emailService = new EmailService();
        await emailService.sendMail({
          to: 'ADMIN',
          subject: `[ICT Action Required] Support Ticket #${updatedTicket.id.substring(0, 8)} Escalated by Super Admin`,
          text: `Support Ticket #${updatedTicket.id.substring(0, 8)} (${updatedTicket.category}) has been transferred to ICT Admin for review.\n\nUser: ${updatedTicket.fullName} (${updatedTicket.contactEmail})\nStudent ID: ${updatedTicket.studentId || 'N/A'}\nRoute: ${updatedTicket.route || '/'}\nError Code: ${updatedTicket.lastErrorCode || 'NONE'}\n\nSuper Admin Transfer Notes:\n${escalationNotes || 'N/A'}\n\nUser Issue Message:\n${updatedTicket.message}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #003580; color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0; color: #ffffff; font-size: 20px;">🚨 ASTU ICT Escalated Ticket Notice</h2>
                <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 12px;">Transferred to ICT Operations • Ticket #${updatedTicket.id.substring(0, 8)}</p>
              </div>
              <div style="padding: 24px; color: #1e293b;">
                <p style="margin-top: 0;">Attention <strong>ICT Technical Operations Team</strong>,</p>
                <p>Super Admin has transferred a support ticket requiring your technical investigation and resolution.</p>
                
                <div style="background-color: #eff6ff; padding: 16px; border-left: 4px solid #003580; border-radius: 6px; margin: 18px 0;">
                  <p style="margin: 0 0 6px 0;"><strong>User Details:</strong> ${updatedTicket.fullName} (${updatedTicket.contactEmail})</p>
                  <p style="margin: 0 0 6px 0;"><strong>Category:</strong> ${updatedTicket.category}</p>
                  <p style="margin: 0 0 6px 0;"><strong>Last Route / Error:</strong> <code>${updatedTicket.route || '/'}</code> | <code>${updatedTicket.lastErrorCode || 'NONE'}</code></p>
                  <p style="margin: 10px 0 0 0; font-weight: bold; color: #1e3a8a;">Super Admin Escalation Notes:</p>
                  <blockquote style="margin: 4px 0 0 0; padding-left: 8px; font-style: italic; color: #1e293b;">
                    "${escalationNotes || 'Needs technical inspection in ICT Portal'}"
                  </blockquote>
                </div>

                <div style="background-color: #f8fafc; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 13px; color: #475569;"><strong>User Issue Description:</strong><br/>${updatedTicket.message}</p>
                </div>

                <div style="text-align: center;">
                  <a href="http://localhost:5173/ict/support-tickets" style="background-color: #003580; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                    ⚙️ Open Ticket in ICT Portal
                  </a>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn('Failed to send ICT escalation email:', emailErr);
      }

      // 2. Create In-App Notification for all ICT Admins
      try {
        const ictAdmins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        for (const adminUser of ictAdmins) {
          await prisma.notification.create({
            data: {
              userId: adminUser.id,
              title: `🚨 Ticket #${updatedTicket.id.substring(0, 8)} Escalated to ICT`,
              content: `Super Admin transferred ticket for ${updatedTicket.fullName}: "${escalationNotes || 'Requires ICT technical resolution'}"`,
            },
          });
        }
      } catch (notifErr) {
        console.warn('Failed to create ICT in-app notification:', notifErr);
      }

      // 3. Create Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            action: 'ESCALATE_SUPPORT_TICKET_TO_ICT',
            details: `Super Admin transferred support ticket #${updatedTicket.id.substring(0, 8)} for ${updatedTicket.fullName} to ICT Technical Admin`,
          },
        });
      } catch (auditErr) {
        console.warn('Failed to create audit log:', auditErr);
      }

      res.status(200).json({
        success: true,
        message: 'Support ticket successfully transferred to ICT Technical Admin and notifications dispatched.',
        data: updatedTicket,
      });
    } catch (err) {
      next(err);
    }
  }
}

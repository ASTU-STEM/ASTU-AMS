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

      const tickets = await prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

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
      const { status, responseNotes } = req.body;

      const updatedTicket = await prisma.supportTicket.update({
        where: { id },
        data: {
          status: status || undefined,
          updatedAt: new Date(),
        },
      });

      // Send email notification to user about status update
      try {
        const emailService = new EmailService();
        await emailService.sendMail({
          to: updatedTicket.contactEmail,
          subject: `ASTU Support Ticket #${updatedTicket.id.substring(0, 8)} Updated (${updatedTicket.status})`,
          text: `Hello ${updatedTicket.fullName},\n\nYour support ticket status has been updated to: ${updatedTicket.status}.\n\nResponse Notes: ${responseNotes || 'No additional notes.'}\n\nThank you,\nASTU Technical Support Team`,
          html: `
            <h3>ASTU Technical Support Ticket Update</h3>
            <p>Hello <strong>${updatedTicket.fullName}</strong>,</p>
            <p>Your support ticket (<strong>#${updatedTicket.id.substring(0, 8)}</strong>) has been updated to: <span style="color: #0b2a4a; font-weight: bold;">${updatedTicket.status}</span>.</p>
            ${responseNotes ? `<blockquote style="background: #f8fafc; border-left: 4px solid #0b2a4a; padding: 10px; margin: 10px 0;">${responseNotes}</blockquote>` : ''}
            <p>Thank you,<br/>ASTU Support Team</p>
          `,
        });
      } catch (emailErr) {
        console.warn('Failed to send ticket update email:', emailErr);
      }

      res.status(200).json({ success: true, message: 'Ticket status updated', data: updatedTicket });
    } catch (err) {
      next(err);
    }
  }
}

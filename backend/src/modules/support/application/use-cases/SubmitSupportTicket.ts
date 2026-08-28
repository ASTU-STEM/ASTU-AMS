import { PrismaClient, SupportTicketStatus, Role } from '@prisma/client';
import { PrismaNotificationRepository } from '../../../notifications/infrastructure/repositories/PrismaNotificationRepository';

import prisma from '../../../../core/config/db';
const notificationRepo = new PrismaNotificationRepository();

interface SubmitSupportTicketDTO {
  category: string;
  studentId?: string;
  fullName: string;
  graduationYear?: string;
  contactEmail: string;
  phone?: string;
  message: string;
  attachments?: string[];
  route?: string;
  lastErrorCode?: string;
  sessionId?: string;
}

export class SubmitSupportTicket {
  async execute(data: SubmitSupportTicketDTO) {
    if (!data.category || !data.fullName || !data.contactEmail || !data.message) {
      throw new Error('Category, Full Name, Contact Email, and Message are required.');
    }

    // Create the ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        category: data.category,
        studentId: data.studentId || null,
        fullName: data.fullName,
        graduationYear: data.graduationYear || null,
        contactEmail: data.contactEmail,
        phone: data.phone || null,
        message: data.message,
        attachments: data.attachments || [],
        status: SupportTicketStatus.OPEN,
        route: data.route || null,
        lastErrorCode: data.lastErrorCode || null,
        sessionId: data.sessionId || null,
      },
    });

    // Notify the Admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: Role.ADMIN, isActive: true },
      });

      const notifyPromises = admins.map(admin =>
        notificationRepo.create({
          userId: admin.id,
          title: 'Support Ticket Created',
          content: `A new support ticket (#${ticket.id.substring(0, 8)}) was created by ${ticket.fullName} for category: ${ticket.category}.`,
          isRead: false,
        })
      );

      await Promise.all(notifyPromises);
    } catch (err) {
      console.error('Failed to notify admins about new support ticket:', err);
      // We don't throw here to avoid failing the user's ticket submission just because notification failed
    }

    return {
      ticketId: ticket.id,
      message: 'Support ticket submitted successfully.',
    };
  }
}

import prisma from '../../../../core/config/db';

export class ManageNotifications {
  async getNotifications(params: {
    page?: number;
    limit?: number;
    query?: string;
    type?: string;
    status?: string;
    priority?: string;
    category?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: 'insensitive' } },
        { content: { contains: params.query, mode: 'insensitive' } },
      ];
    }
    if (params.type && params.type !== 'All') {
      where.type = params.type;
    }
    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }
    if (params.priority && params.priority !== 'All') {
      where.priority = params.priority;
    }
    if (params.category && params.category !== 'All') {
      where.category = params.category;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: { user: { select: { email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications: notifications.map((n: any) => ({
        id: n.id,
        dateSent: n.createdAt,
        type: (n.type || 'In-App') as any,
        subject: n.title,
        targetGroup: n.user?.role || 'User',
        recipients: 1,
        openRate: n.isRead ? '100%' : '0%',
        status: (n.status || 'Sent') as any,
        priority: n.priority || 'Normal',
        category: n.category || 'General',
        body: n.content,
        imageUrl: n.imageUrl,
        ctaLink: n.ctaLink,
        ctaText: n.ctaText,
        scheduledAt: n.scheduledAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getNotificationStats() {
    const [totalSent, readCount, scheduledSends] = await Promise.all([
      prisma.notification.count({ where: { status: { not: 'Scheduled' } } }),
      prisma.notification.count({ where: { isRead: true } }),
      prisma.notification.count({ where: { status: 'Scheduled' } }),
    ]);

    const openRate = totalSent > 0 ? Math.round((readCount / totalSent) * 100) : 0;

    return {
      totalSent,
      openRate,
      scheduledSends,
      templatesCount: 25,
    };
  }

  async sendNotification(data: {
    title: string;
    content: string;
    type?: string;
    targetRole?: string;
    targetUserIds?: string[];
    departmentName?: string;
    departmentId?: string;
    graduationYear?: number;
    employmentStatus?: string;
    scheduleDate?: string;
    scheduleTime?: string;
    priority?: string;
    category?: string;
    imageUrl?: string;
    ctaLink?: string;
    ctaText?: string;
    sendMode?: string;
  }) {
    let userIds: string[] = [];

    if (data.targetUserIds && data.targetUserIds.length > 0) {
      userIds = data.targetUserIds;
    } else if (data.departmentId || data.departmentName) {
      const deptWhere: any = data.departmentId
        ? { departmentId: data.departmentId }
        : { department: { name: { contains: data.departmentName, mode: 'insensitive' } } };

      const alumni = await prisma.alumniProfile.findMany({
        where: {
          ...deptWhere,
          userId: { not: null },
        },
        select: { userId: true },
      });
      userIds = alumni.map((a: any) => a.userId).filter(Boolean) as string[];
    } else if (data.graduationYear) {
      const alumni = await prisma.alumniProfile.findMany({
        where: {
          graduationYear: Number(data.graduationYear),
          userId: { not: null },
        },
        select: { userId: true },
      });
      userIds = alumni.map((a: any) => a.userId).filter(Boolean) as string[];
    } else if (data.employmentStatus) {
      const alumni = await prisma.alumniProfile.findMany({
        where: {
          employmentStatus: data.employmentStatus as any,
          userId: { not: null },
        },
        select: { userId: true },
      });
      userIds = alumni.map((a: any) => a.userId).filter(Boolean) as string[];
    } else if (data.targetRole && data.targetRole !== 'ALL' && data.targetRole !== 'All Users') {
      const users = await prisma.user.findMany({
        where: { role: data.targetRole as any },
        select: { id: true },
      });
      userIds = users.map((u: any) => u.id);
    } else {
      const users = await prisma.user.findMany({ select: { id: true } });
      userIds = users.map((u: any) => u.id);
    }

    if (userIds.length === 0) {
      return { sent: 0 };
    }

    const uniqueUserIds = Array.from(new Set(userIds));
    const notifType = data.type || 'In-App';
    const isScheduled = data.sendMode === 'Schedule for Date' && data.scheduleDate;
    const notifStatus = isScheduled ? 'Scheduled' : 'Sent';

    let scheduledAt: Date | null = null;
    if (isScheduled && data.scheduleDate) {
      const timeStr = data.scheduleTime || '09:00';
      scheduledAt = new Date(`${data.scheduleDate}T${timeStr}:00`);
    }

    const created = await prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        userId,
        title: data.title,
        content: data.content,
        type: notifType,
        status: notifStatus,
        priority: data.priority || 'Normal',
        category: data.category || 'General',
        imageUrl: data.imageUrl || null,
        ctaLink: data.ctaLink || null,
        ctaText: data.ctaText || null,
        scheduledAt,
      })),
    });

    // If notification is active/immediate and type is Email or Both, dispatch via EmailService
    if (!isScheduled && (notifType === 'Email' || notifType === 'Both')) {
      try {
        const { EmailService } = require('../../../../core/services/EmailService');
        const emailService = new EmailService();

        const recipientUsers = await prisma.user.findMany({
          where: { id: { in: uniqueUserIds } },
          select: { email: true },
        });

        for (const u of recipientUsers) {
          if (u.email && u.email.includes('@')) {
            await emailService.sendGenericNotification(u.email, data.title, data.content, {
              imageUrl: data.imageUrl,
              ctaLink: data.ctaLink,
              ctaText: data.ctaText,
              priority: data.priority,
              category: data.category,
            }).catch((err: any) => {
              console.warn(`[ManageNotifications] Email dispatch warning for ${u.email}:`, err?.message || err);
            });
          }
        }
      } catch (emailErr: any) {
        console.warn('[ManageNotifications] Email service dispatch error:', emailErr?.message || emailErr);
      }
    }

    return { sent: created.count, isScheduled, status: notifStatus };
  }
}

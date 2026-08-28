import prisma from '../../../../core/config/db';

export class ManageNotifications {
  async getNotifications(params: { page?: number; limit?: number; query?: string }) {
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
        type: 'In-App' as const,
        subject: n.title,
        targetGroup: n.user?.role || 'User',
        recipients: 1,
        openRate: n.isRead ? '100%' : '0%',
        status: 'Sent' as const,
        body: n.content,
      })),
      total,
      page,
      limit,
    };
  }

  async getNotificationStats() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalSent, readCount, totalCount] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: true } }),
      prisma.notification.count(),
    ]);

    const openRate = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

    return {
      totalSent,
      openRate,
    };
  }

  async sendNotification(data: {
    title: string;
    content: string;
    targetRole?: string;
    targetUserIds?: string[];
  }) {
    // If targetUserIds is provided, send to those specific users
    if (data.targetUserIds && data.targetUserIds.length > 0) {
      const created = await prisma.notification.createMany({
        data: data.targetUserIds.map(userId => ({
          userId,
          title: data.title,
          content: data.content,
        })),
      });
      return { sent: created.count };
    }

    // If targetRole is provided, send to all users with that role
    if (data.targetRole && data.targetRole !== 'All Users') {
      const users = await prisma.user.findMany({
        where: { role: data.targetRole as any },
        select: { id: true },
      });

      if (users.length === 0) {
        return { sent: 0 };
      }

      const created = await prisma.notification.createMany({
        data: users.map((u: any) => ({
          userId: u.id,
          title: data.title,
          content: data.content,
        })),
      });
      return { sent: created.count };
    }

    // Default: send to all users
    const users = await prisma.user.findMany({ select: { id: true } });
    const created = await prisma.notification.createMany({
      data: users.map((u: any) => ({
        userId: u.id,
        title: data.title,
        content: data.content,
      })),
    });
    return { sent: created.count };
  }
}

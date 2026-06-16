import prisma from '../../../../core/config/db';

export class GetAdminLogs {
  async execute() {
    return prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}

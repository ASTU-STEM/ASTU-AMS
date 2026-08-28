import prisma from '../../../../core/config/db';

export class ManageLogs {
  async getLogs(params: {
    page?: number;
    limit?: number;
    query?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.query) {
      where.OR = [
        { details: { contains: params.query, mode: 'insensitive' } },
        { action: { contains: params.query, mode: 'insensitive' } },
        { user: { email: { contains: params.query, mode: 'insensitive' } } },
      ];
    }

    if (params.action && params.action !== 'All') {
      where.action = { contains: params.action, mode: 'insensitive' };
    }

    if (params.dateFrom) {
      where.createdAt = { ...where.createdAt, gte: new Date(params.dateFrom) };
    }
    if (params.dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(`${params.dateTo}T23:59:59`) };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log: any) => ({
        id: log.id,
        timestamp: log.createdAt,
        userEmail: log.user?.email || 'system',
        role: log.user?.role || 'System',
        action: log.action,
        details: log.details,
        ipAddress: log.ipAddress || 'N/A',
        severity: deriveSeverity(log.action, log.details),
      })),
      total,
      page,
      limit,
    };
  }

  async getLogStats() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalToday, errorsToday, failedLogins] = await Promise.all([
      prisma.auditLog.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          OR: [
            { action: { contains: 'error', mode: 'insensitive' } },
            { details: { contains: 'error', mode: 'insensitive' } },
            { details: { contains: 'failed', mode: 'insensitive' } },
          ],
        },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          action: { contains: 'login', mode: 'insensitive' },
          details: { contains: 'failed', mode: 'insensitive' },
        },
      }),
    ]);

    return {
      totalToday,
      errorsToday,
      failedLogins,
    };
  }
}

function deriveSeverity(action: string, details: string): string {
  const lower = `${action} ${details}`.toLowerCase();
  if (lower.includes('error') || lower.includes('fail')) return 'Error';
  if (lower.includes('warn') || lower.includes('invalid') || lower.includes('denied')) return 'Warning';
  if (lower.includes('success') || lower.includes('created') || lower.includes('completed')) return 'Success';
  return 'Info';
}

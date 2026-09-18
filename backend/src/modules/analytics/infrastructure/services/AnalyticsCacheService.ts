import prisma from '../../../../core/config/db';

export class AnalyticsCacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await prisma.analyticsCache.findUnique({
        where: { key },
      });

      if (!cached) return null;

      if (new Date() > new Date(cached.expiresAt)) {
        // Cache expired, delete and return null
        await prisma.analyticsCache.deleteMany({ where: { key } }).catch(() => {});
        return null;
      }

      return cached.data as T;
    } catch (error) {
      console.error('AnalyticsCache get error:', error);
      return null;
    }
  }

  static async set(key: string, data: any, ttlSeconds: number = 600): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      await prisma.analyticsCache.upsert({
        where: { key },
        update: {
          data,
          expiresAt,
          updatedAt: new Date(),
        },
        create: {
          key,
          data,
          expiresAt,
        },
      });
    } catch (error) {
      console.error('AnalyticsCache set error:', error);
    }
  }

  static async clear(key: string): Promise<void> {
    try {
      await prisma.analyticsCache.deleteMany({ where: { key } }).catch(() => {});
    } catch (error) {
      console.error('AnalyticsCache clear error:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await prisma.analyticsCache.deleteMany({});
    } catch (error) {
      console.error('AnalyticsCache clearAll error:', error);
    }
  }
}

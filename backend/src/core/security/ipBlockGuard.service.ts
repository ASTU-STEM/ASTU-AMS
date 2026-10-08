import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { Logger, serverLogBuffer } from '../utils/logger.utils';

export interface BlockedIpItem {
  ip: string;
  reason: string;
  added?: string;
  count?: number;
}

class IpBlockGuardService {
  private blockedIpsMap: Map<string, string> = new Map();
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    await this.reloadFromDb();
    this.isInitialized = true;
  }

  async reloadFromDb() {
    try {
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'BLOCKED_IPS' } });
      this.blockedIpsMap.clear();

      if (setting && Array.isArray(setting.value)) {
        for (const item of setting.value as unknown as BlockedIpItem[]) {
          if (item && item.ip) {
            const clean = item.ip.replace(/^::ffff:/, '').trim();
            this.blockedIpsMap.set(clean, item.reason || 'Blocked by security administrator');
          }
        }
      }
      Logger.info(`[IpBlockGuard] Loaded ${this.blockedIpsMap.size} blocked IP addresses into active firewall guard.`);
    } catch (err: any) {
      Logger.error(`[IpBlockGuard] Failed to load blocked IPs from database: ${err.message}`);
    }
  }

  isBlocked(ip: string): { blocked: boolean; reason?: string } {
    const cleanIp = (ip || '').replace(/^::ffff:/, '').trim();
    if (!cleanIp) return { blocked: false };

    // Check direct match
    if (this.blockedIpsMap.has(cleanIp)) {
      return { blocked: true, reason: this.blockedIpsMap.get(cleanIp) };
    }

    // Check loopback mapping
    if ((cleanIp === '127.0.0.1' || cleanIp === '::1') && this.blockedIpsMap.has('127.0.0.1')) {
      return { blocked: true, reason: this.blockedIpsMap.get('127.0.0.1') };
    }

    return { blocked: false };
  }

  async addBlockedIp(ip: string, reason: string) {
    const cleanIp = (ip || '').replace(/^::ffff:/, '').trim();
    if (!cleanIp) return;

    const finalReason = (reason || 'Manual security admin block').trim();
    this.blockedIpsMap.set(cleanIp, finalReason);

    try {
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'BLOCKED_IPS' } }).catch(() => null);
      const list: BlockedIpItem[] = setting && Array.isArray(setting.value) ? (setting.value as unknown as BlockedIpItem[]) : [];

      const newObj: BlockedIpItem = {
        ip: cleanIp,
        reason: finalReason,
        added: new Date().toLocaleDateString(),
        count: 1,
      };

      const updated = [newObj, ...list.filter(item => item.ip !== cleanIp)];

      await prisma.systemSetting.upsert({
        where: { key: 'BLOCKED_IPS' },
        update: { value: updated as any, updatedAt: new Date() },
        create: { key: 'BLOCKED_IPS', value: updated as any },
      });
    } catch (err: any) {
      Logger.error(`[IpBlockGuard] Database sync failed for addBlockedIp: ${err.message}`);
    }
  }

  async removeBlockedIp(ip: string) {
    const cleanIp = (ip || '').replace(/^::ffff:/, '').trim();
    if (!cleanIp) return;

    this.blockedIpsMap.delete(cleanIp);

    try {
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'BLOCKED_IPS' } }).catch(() => null);
      const list: BlockedIpItem[] = setting && Array.isArray(setting.value) ? (setting.value as unknown as BlockedIpItem[]) : [];

      const updated = list.filter(item => item.ip !== cleanIp);

      await prisma.systemSetting.upsert({
        where: { key: 'BLOCKED_IPS' },
        update: { value: updated as any, updatedAt: new Date() },
        create: { key: 'BLOCKED_IPS', value: updated as any },
      });
    } catch (err: any) {
      Logger.error(`[IpBlockGuard] Database sync failed for removeBlockedIp: ${err.message}`);
    }
  }

  getBlockedIpsCount(): number {
    return this.blockedIpsMap.size;
  }
}

export const ipBlockGuard = new IpBlockGuardService();

export const ipBlockGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!ipBlockGuard['isInitialized']) {
      await ipBlockGuard.init();
    }

    const rawIp = (req.headers['x-forwarded-for'] as string) || (req.headers['x-real-ip'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = rawIp.split(',')[0].replace(/^::ffff:/, '').trim();

    const { blocked, reason } = ipBlockGuard.isBlocked(clientIp);

    if (blocked) {
      Logger.warn(`[IP Guard] Access Denied: Blocked IP ${clientIp} attempted to access ${req.originalUrl}`);

      serverLogBuffer.addLog({
        type: 'SERVER_WARN',
        level: 'WARN',
        message: `[IP GUARD] Blocked IP access attempt from ${clientIp} - Reason: ${reason}`,
        source: 'BACKEND',
        ipAddress: clientIp,
        path: req.originalUrl || req.url,
        statusCode: 403,
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'IP_ADDRESS_BLOCKED',
          message: `Access Denied: Your IP address (${clientIp}) has been blocked by ASTU Security Operations. Reason: ${reason || 'Security Policy Violation'}. Contact ICT Directorate if you believe this is an error.`
        }
      });
    }

    next();
  } catch (error) {
    next();
  }
};

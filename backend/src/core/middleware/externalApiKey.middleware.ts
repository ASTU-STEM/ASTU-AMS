import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { Logger, serverLogBuffer } from '../utils/logger.utils';

export interface ExternalApiKeyItem {
  id: string;
  clientName: string;
  service: string;
  keyPrefix: string;
  keySecret: string;
  scopes: string[];
  rateLimit: string;
  ipWhitelist: string;
  status: 'Active' | 'ACTIVE' | 'Revoked' | 'REVOKED' | 'EXPIRED';
  created: string;
  lastUsed: string;
  requestCount: number;
}

export const externalApiKeyMiddleware = (requiredScope?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const apiKeyHeader = (req.headers['x-api-key'] as string) || (req.query.apiKey as string);

      let providedKey = '';
      if (apiKeyHeader) {
        providedKey = apiKeyHeader.trim();
      } else if (authHeader && (authHeader.startsWith('Bearer astu_live_') || authHeader.startsWith('astu_live_'))) {
        providedKey = authHeader.replace(/^Bearer\s+/i, '').trim();
      }

      if (!providedKey) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'MISSING_API_KEY',
            message: 'External API Key required. Pass X-API-KEY header or Authorization: Bearer <API_KEY>.'
          }
        });
      }

      // Query active API Keys from SystemSetting
      const keysSetting = await prisma.systemSetting.findUnique({ where: { key: 'API_KEYS' } });
      const apiKeysList: ExternalApiKeyItem[] = keysSetting && Array.isArray(keysSetting.value)
        ? (keysSetting.value as unknown as ExternalApiKeyItem[])
        : [];

      const matchedKey = apiKeysList.find((k) => k && (k.keySecret === providedKey || k.keyPrefix === providedKey || providedKey.startsWith(k.keySecret)));

      if (!matchedKey) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'Invalid API key provided. Contact ASTU ICT Systems Directorate for external API provisioning.'
          }
        });
      }

      if (matchedKey.status && matchedKey.status.toUpperCase() === 'REVOKED') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'API_KEY_REVOKED',
            message: 'The provided API Key has been revoked by ASTU system security.'
          }
        });
      }

      // Check IP Whitelist if configured (not 0.0.0.0/0)
      const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const clientIp = rawIp.split(',')[0].replace(/^::ffff:/, '').trim();

      if (matchedKey.ipWhitelist && !matchedKey.ipWhitelist.includes('0.0.0.0') && !matchedKey.ipWhitelist.includes('*')) {
        if (!matchedKey.ipWhitelist.includes(clientIp)) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'IP_NOT_WHITELISTED',
              message: `Access denied for IP ${clientIp}. API key is restricted to whitelisted IP addresses: ${matchedKey.ipWhitelist}.`
            }
          });
        }
      }

      // Scope Authorization check
      if (requiredScope) {
        const keyScopes = matchedKey.scopes || [];
        const hasScope = keyScopes.includes('full:access') || keyScopes.includes(requiredScope) || keyScopes.includes('read:alumni');
        if (!hasScope) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_SCOPE',
              message: `API Key missing required scope: "${requiredScope}". Assigned key scopes: [${keyScopes.join(', ')}].`
            }
          });
        }
      }

      // Update telemetry asynchronously (requestCount & lastUsed)
      const updatedKeysList = apiKeysList.map((k) => {
        if (k.id === matchedKey.id || k.keySecret === matchedKey.keySecret) {
          return {
            ...k,
            requestCount: (k.requestCount || 0) + 1,
            lastUsed: new Date().toISOString(),
          };
        }
        return k;
      });

      prisma.systemSetting.upsert({
        where: { key: 'API_KEYS' },
        update: { value: updatedKeysList as any },
        create: { key: 'API_KEYS', value: updatedKeysList as any },
      }).catch(() => {});

      serverLogBuffer.addLog({
        type: 'HTTP_REQUEST',
        level: 'INFO',
        message: `[EXTERNAL API] Authenticated ${matchedKey.clientName} (${matchedKey.service}) on ${req.originalUrl}`,
        source: 'BACKEND',
        clientName: matchedKey.clientName,
        ipAddress: clientIp,
        path: req.originalUrl || req.url,
        statusCode: 200,
      });

      (req as any).externalClient = {
        clientName: matchedKey.clientName,
        service: matchedKey.service,
        scopes: matchedKey.scopes,
      };

      next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'GATEWAY_ERROR', message: error.message }
      });
    }
  };
};

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface CorrelatedRequest extends Request {
  requestId?: string;
  startTime?: number;
}

export const requestCorrelationMiddleware = (req: CorrelatedRequest, res: Response, next: NextFunction) => {
  const incomingRequestId = req.headers['x-request-id'] as string;
  const requestId = incomingRequestId || `req_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
  
  req.requestId = requestId;
  req.startTime = Date.now();

  // Propagate correlation ID in HTTP response headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Powered-By', 'ASTU-AMS Enterprise Engine');

  next();
};

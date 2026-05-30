import { Request, Response, NextFunction } from 'express';
import prisma from '../../../infrastructure/config/db';
import { sendSuccess } from '../../../shared/utils/response.utils';

export class DocumentsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await prisma.documentRequest.findMany({ orderBy: { createdAt: 'desc' } });
      return sendSuccess(res, 'Document requests', docs);
    } catch (err: any) {
      next(err);
    }
  }
}

export default DocumentsController;

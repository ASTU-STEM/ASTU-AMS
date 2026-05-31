import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../core/utils/response.utils';
import { requestDocumentSchema, updateDocumentStatusSchema } from './documents.validation';

import { PrismaDocumentRequestRepository } from '../infrastructure/repositories/PrismaDocumentRequestRepository';
import { RequestDocument, UpdateDocumentStatus, GetAlumniDocuments, GetAllDocumentRequests } from '../application/use-cases/ManageDocuments';

const repo = new PrismaDocumentRequestRepository();

export class DocumentsController {

  static async requestDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const alumniId = (req as any).user?.userId;
      const data = requestDocumentSchema.parse(req.body);
      const useCase = new RequestDocument(repo);
      const result = await useCase.execute(alumniId, data);
      return sendSuccess(res, 'Document request submitted successfully.', result, 201);
    } catch (err) { next(err); }
  }

  static async getMyDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const alumniId = (req as any).user?.userId;
      const useCase = new GetAlumniDocuments(repo);
      const result = await useCase.execute(alumniId);
      return sendSuccess(res, 'Your document requests retrieved.', result);
    } catch (err) { next(err); }
  }

  static async getAllRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const useCase = new GetAllDocumentRequests(repo);
      const result = await useCase.execute();
      return sendSuccess(res, 'All document requests retrieved.', result);
    } catch (err) { next(err); }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updateDocumentStatusSchema.parse(req.body);
      const useCase = new UpdateDocumentStatus(repo);
      const result = await useCase.execute(req.params.requestId, status);
      return sendSuccess(res, `Document request status updated to ${status}.`, result);
    } catch (err) { next(err); }
  }
}

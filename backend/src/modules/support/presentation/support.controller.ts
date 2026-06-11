import { Request, Response, NextFunction } from 'express';
import { SubmitSupportTicket } from '../application/use-cases/SubmitSupportTicket';

export class SupportController {
  static async submitTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        studentId,
        fullName,
        graduationYear,
        contactEmail,
        phone,
        message,
        metadata_currentRoute,
        metadata_lastErrorCode,
        metadata_sessionId,
      } = req.body;

      // Extract uploaded files
      const files = req.files as Express.Multer.File[];
      const attachments = files?.map(f => f.filename) || [];

      const useCase = new SubmitSupportTicket();
      const result = await useCase.execute({
        category,
        studentId,
        fullName,
        graduationYear,
        contactEmail,
        phone,
        message,
        attachments,
        route: metadata_currentRoute,
        lastErrorCode: metadata_lastErrorCode,
        sessionId: metadata_sessionId,
      });

      res.status(200).json({ success: true, message: result.message, data: { ticketId: result.ticketId } });
    } catch (err) {
      next(err);
    }
  }
}

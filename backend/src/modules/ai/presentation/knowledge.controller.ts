import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../../../core/utils/response.utils';
import { ManageKnowledgeUseCase } from '../application/use-cases/ManageKnowledgeUseCase';
import { RAGKnowledgeService } from '../infrastructure/services/RAGKnowledgeService';

export class KnowledgeController {
  /**
   * Upload an institutional policy or document file (PDF, TXT, MD)
   */
  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, category, description, accessLevel, status } = req.body;
      const file = req.file;

      if (!title || !title.trim()) {
        return sendError(res, 'Document title is required', null, 400);
      }

      const uploaderName = (req as any).user?.email || 'Alumni Office Admin';
      const uploaderId = (req as any).user?.userId || (req as any).user?.id;

      const result = await ManageKnowledgeUseCase.uploadDocument(
        {
          title: title.trim(),
          category: category || 'General',
          description,
          accessLevel: accessLevel === 'RESTRICTED' ? 'RESTRICTED' : 'PUBLIC',
          status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
          fileBuffer: file ? file.buffer : undefined,
          fileName: file ? file.originalname : undefined,
          mimeType: file ? file.mimetype : undefined,
          fileSize: file ? file.size : undefined,
          rawText: req.body.rawText,
        },
        uploaderName,
        uploaderId
      );

      return sendSuccess(res, 'Document uploaded and indexed successfully into RAG knowledge base.', result, 201);
    } catch (err: any) {
      console.error('KnowledgeController.uploadDocument error:', err);
      return sendError(res, err.message || 'Failed to upload document', null, 400);
    }
  }

  /**
   * Create a manual FAQ or policy entry without file
   */
  static async createFaqEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer, category, accessLevel } = req.body;
      if (!question || !answer) {
        return sendError(res, 'Question and answer are required', null, 400);
      }

      const uploaderName = (req as any).user?.email || 'Alumni Office Admin';
      const uploaderId = (req as any).user?.userId || (req as any).user?.id;

      const result = await ManageKnowledgeUseCase.createFaqEntry(
        { question, answer, category, accessLevel },
        uploaderName,
        uploaderId
      );

      return sendSuccess(res, 'FAQ knowledge entry created and indexed successfully.', result, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create FAQ entry', null, 400);
    }
  }

  /**
   * List all knowledge base documents
   */
  static async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, status, search } = req.query;
      const documents = await ManageKnowledgeUseCase.listDocuments({
        category: category as string,
        status: status as string,
        search: search as string,
      });

      return sendSuccess(res, 'Knowledge documents retrieved successfully.', { documents });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve documents', null, 500);
    }
  }

  /**
   * Get detailed document and chunk inspection
   */
  static async getDocumentDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ManageKnowledgeUseCase.getDocumentDetails(id);
      return sendSuccess(res, 'Document details retrieved successfully.', result);
    } catch (err: any) {
      return sendError(res, err.message || 'Document not found', null, 404);
    }
  }

  /**
   * Update publication status or access level
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, accessLevel } = req.body;

      if (!status || !['PUBLISHED', 'DRAFT', 'DEACTIVATED'].includes(status)) {
        return sendError(res, 'Valid status (PUBLISHED, DRAFT, DEACTIVATED) is required', null, 400);
      }

      const updated = await ManageKnowledgeUseCase.updateStatus(id, status, accessLevel);
      return sendSuccess(res, `Document status updated to ${status}.`, { document: updated });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update document status', null, 400);
    }
  }

  /**
   * Delete document and its indexed chunks
   */
  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ManageKnowledgeUseCase.deleteDocument(id);
      return sendSuccess(res, 'Document and its indexed chunks deleted successfully.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete document', null, 400);
    }
  }

  /**
   * Admin test playground: query the knowledge base including draft or specific documents
   */
  static async adminTestQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, targetDocumentId, allowDrafts } = req.body;
      if (!message || !message.trim()) {
        return sendError(res, 'Query message is required', null, 400);
      }

      const result = await RAGKnowledgeService.queryAndGenerate(message.trim(), {
        allowDrafts: allowDrafts ?? true,
        targetDocumentId,
      });

      return sendSuccess(res, 'Admin RAG test query executed.', result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to run test query', null, 500);
    }
  }
}

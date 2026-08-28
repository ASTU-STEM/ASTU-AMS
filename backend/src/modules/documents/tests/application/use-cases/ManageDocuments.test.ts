import { RequestDocument, UpdateDocumentStatus, GetAlumniDocuments, GetAllDocumentRequests } from '../../../application/use-cases/ManageDocuments';
import { IDocumentRequestRepository } from '../../../application/ports/IDocumentRequestRepository';
import { DocumentRequest } from '../../../domain/entities/Document';
import { DocumentNotFoundError, DuplicateDocumentRequestError } from '../../../domain/errors/DocumentErrors';
import { EmailService } from '../../../../../core/services/EmailService';

describe('ManageDocuments Use Cases', () => {
  let mockRepo: jest.Mocked<IDocumentRequestRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  const mockReq = new DocumentRequest('req1', 'alumni1', 'TRANSCRIPT', 'PENDING', null, new Date(), new Date());

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByAlumniId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    };
    mockEmailService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  describe('RequestDocument', () => {
    it('should create document request if no pending exists', async () => {
      mockRepo.findByAlumniId.mockResolvedValue([]);
      mockRepo.create.mockResolvedValue(mockReq);

      const useCase = new RequestDocument(mockRepo, mockEmailService);
      const result = await useCase.execute('alumni1', { documentType: 'TRANSCRIPT' });
      
      expect(result).toEqual(mockReq);
    });

    it('should throw DuplicateDocumentRequestError if a pending request of same type exists', async () => {
      mockRepo.findByAlumniId.mockResolvedValue([mockReq]);
      
      const useCase = new RequestDocument(mockRepo, mockEmailService);
      await expect(useCase.execute('alumni1', { documentType: 'TRANSCRIPT' })).rejects.toThrow(DuplicateDocumentRequestError);
    });
  });

  describe('UpdateDocumentStatus', () => {
    it('should update status successfully', async () => {
      mockRepo.findById.mockResolvedValue(mockReq);
      mockRepo.updateStatus.mockResolvedValue({ ...mockReq, status: 'COMPLETED' });

      const useCase = new UpdateDocumentStatus(mockRepo);
      const result = await useCase.execute('req1', 'COMPLETED');

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw DocumentNotFoundError if request does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const useCase = new UpdateDocumentStatus(mockRepo);
      await expect(useCase.execute('req1', 'COMPLETED')).rejects.toThrow(DocumentNotFoundError);
    });
  });
});

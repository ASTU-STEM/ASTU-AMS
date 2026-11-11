import { RequestDocument, GetMyDocuments } from '../../../application/use-cases/DocumentRequests';
import { IAlumniProfileRepository } from '../../../application/ports/IAlumniProfileRepository';
import { IDocumentRequestRepository } from '../../../application/ports/IDocumentRequestRepository';
import { IAuditLogger } from '../../../application/ports/IAuditLogger';
import { AlumniProfile, DocumentRequest } from '../../../domain/entities/Alumni';
import { EmailService } from '../../../../../core/services/EmailService';

describe('DocumentRequests Use Cases', () => {
  let mockAlumniRepo: jest.Mocked<IAlumniProfileRepository>;
  let mockDocRepo: jest.Mocked<IDocumentRequestRepository>;
  let mockLogger: jest.Mocked<IAuditLogger>;
  let mockEmailService: jest.Mocked<Pick<EmailService, 'sendGenericNotification'>>;

  const mockProfile = new AlumniProfile('alumniId1', 'userId1', 'stu1', 'John Doe', 'email@test.com', 'ACTIVE', true);

  beforeEach(() => {
    mockAlumniRepo = { findByUserId: jest.fn(), update: jest.fn() };
    mockDocRepo = { create: jest.fn(), findByAlumniId: jest.fn() };
    mockLogger = { log: jest.fn() };
    mockEmailService = { sendGenericNotification: jest.fn().mockResolvedValue(true) };
  });

  describe('RequestDocument', () => {
    it('should create document request and log action', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockProfile);
      const newDoc = new DocumentRequest('doc1', 'alumniId1', 'Transcript', 'Please rush', 'PENDING', new Date());
      mockDocRepo.create.mockResolvedValue(newDoc);

      const useCase = new RequestDocument(
        mockAlumniRepo,
        mockDocRepo,
        mockLogger,
        mockEmailService as unknown as EmailService
      );
      const result = await useCase.execute('userId1', { documentType: 'Transcript', additionalInstructions: 'Please rush' }, '127.0.0.1');

      expect(result).toEqual(newDoc);
      expect(mockLogger.log).toHaveBeenCalledWith('userId1', 'DOCUMENT_REQUEST', expect.any(String), '127.0.0.1');
    });
  });

  describe('GetMyDocuments', () => {
    it('should return list of documents', async () => {
      mockAlumniRepo.findByUserId.mockResolvedValue(mockProfile);
      const docs = [new DocumentRequest('doc1', 'alumniId1', 'Transcript', null, 'PENDING', new Date())];
      mockDocRepo.findByAlumniId.mockResolvedValue(docs);

      const useCase = new GetMyDocuments(mockAlumniRepo, mockDocRepo);
      const result = await useCase.execute('userId1');

      expect(result).toEqual(docs);
      expect(mockDocRepo.findByAlumniId).toHaveBeenCalledWith('alumniId1');
    });
  });
});

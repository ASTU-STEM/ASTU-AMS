import {
  RequestMentorship,
  RespondToMentorship,
  GetMyMentors,
  GetMyMentees
} from '../../../application/use-cases/ManageMentorship';
import { IMentorshipRepository } from '../../../application/ports/IMentorshipRepository';
import { MentorshipRequest } from '../../../domain/entities/MentorshipRequest';
import {
  DuplicateMentorshipRequestError,
  InvalidMentorshipTargetError,
  MentorshipRequestNotFoundError,
  UnauthorizedMentorshipActionError
} from '../../../domain/errors/MentorshipErrors';

describe('ManageMentorship Use Cases', () => {
  let mockRepo: jest.Mocked<IMentorshipRepository>;

  const mockRequest = new MentorshipRequest(
    'req1',
    'mentor1',
    'mentee1',
    'PENDING',
    'Hello, be my mentor',
    new Date(),
    new Date()
  );

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByPair: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      findRequestsForMentor: jest.fn(),
      findRequestsForMentee: jest.fn()
    };
  });

  describe('RequestMentorship', () => {
    it('should create a mentorship request successfully', async () => {
      mockRepo.findByPair.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockRequest);
      
      const useCase = new RequestMentorship(mockRepo);
      const result = await useCase.execute('mentor1', 'mentee1', 'Hello');
      
      expect(result).toEqual(mockRequest);
      expect(mockRepo.create).toHaveBeenCalledWith({
        mentorId: 'mentor1',
        menteeId: 'mentee1',
        message: 'Hello',
        status: 'PENDING'
      });
    });

    it('should throw InvalidMentorshipTargetError if mentor and mentee are the same', async () => {
      const useCase = new RequestMentorship(mockRepo);
      await expect(useCase.execute('alumni1', 'alumni1', 'Hello')).rejects.toThrow(InvalidMentorshipTargetError);
    });

    it('should throw DuplicateMentorshipRequestError if a request already exists', async () => {
      mockRepo.findByPair.mockResolvedValue(mockRequest);
      const useCase = new RequestMentorship(mockRepo);
      await expect(useCase.execute('mentor1', 'mentee1', 'Hello')).rejects.toThrow(DuplicateMentorshipRequestError);
    });
  });

  describe('RespondToMentorship', () => {
    it('should update status if user is the requested mentor', async () => {
      mockRepo.findById.mockResolvedValue(mockRequest);
      mockRepo.updateStatus.mockResolvedValue({ ...mockRequest, status: 'ACCEPTED' });
      
      const useCase = new RespondToMentorship(mockRepo);
      const result = await useCase.execute('req1', 'mentor1', 'ACCEPTED');
      
      expect(result.status).toBe('ACCEPTED');
      expect(mockRepo.updateStatus).toHaveBeenCalledWith('req1', 'ACCEPTED');
    });

    it('should throw UnauthorizedMentorshipActionError if user is not the mentor', async () => {
      mockRepo.findById.mockResolvedValue(mockRequest);
      const useCase = new RespondToMentorship(mockRepo);
      await expect(useCase.execute('req1', 'hacker', 'ACCEPTED')).rejects.toThrow(UnauthorizedMentorshipActionError);
    });

    it('should throw MentorshipRequestNotFoundError if request does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const useCase = new RespondToMentorship(mockRepo);
      await expect(useCase.execute('req1', 'mentor1', 'ACCEPTED')).rejects.toThrow(MentorshipRequestNotFoundError);
    });
  });

  describe('GetMyMentors', () => {
    it('should fetch mentors', async () => {
      mockRepo.findRequestsForMentee.mockResolvedValue([mockRequest]);
      const useCase = new GetMyMentors(mockRepo);
      const result = await useCase.execute('mentee1');
      expect(result).toHaveLength(1);
    });
  });

  describe('GetMyMentees', () => {
    it('should fetch mentees', async () => {
      mockRepo.findRequestsForMentor.mockResolvedValue([mockRequest]);
      const useCase = new GetMyMentees(mockRepo);
      const result = await useCase.execute('mentor1');
      expect(result).toHaveLength(1);
    });
  });
});

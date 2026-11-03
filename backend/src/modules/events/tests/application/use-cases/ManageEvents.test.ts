import {
  CreateEvent,
  UpdateEvent,
  DeleteEvent,
  GetEvents,
  RSVPToEvent,
  GetEventAttendees
} from '../../../application/use-cases/ManageEvents';
import { IEventRepository } from '../../../application/ports/IEventRepository';
import { Event, EventRSVP } from '../../../domain/entities/Event';
import {
  EventNotFoundError,
  UnauthorizedEventActionError,
  DuplicateRSVPError
} from '../../../domain/errors/EventErrors';

describe('ManageEvents Use Cases', () => {
  let mockRepo: jest.Mocked<IEventRepository>;

  const mockEvent = new Event(
    'evt1',
    'Tech Summit 2025',
    'Annual alumni tech summit',
    new Date('2025-06-01'),
    'Main Hall',
    'IN_PERSON',
    'admin1',
    new Date(),
    new Date()
  );

  const mockRSVP = new EventRSVP('rsvp1', 'evt1', 'alumni1', 'GOING', new Date());

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findRSVP: jest.fn(),
      createRSVP: jest.fn(),
      updateRSVP: jest.fn(),
      getAttendees: jest.fn()
    };
  });

  describe('CreateEvent', () => {
    it('should create an event', async () => {
      mockRepo.create.mockResolvedValue(mockEvent);
      const useCase = new CreateEvent(mockRepo);
      const result = await useCase.execute({
        title: 'Tech Summit 2025',
        description: 'Annual alumni tech summit',
        date: mockEvent.date,
        location: 'Main Hall',
        type: 'IN_PERSON',
        createdBy: 'admin1'
      });
      expect(result).toEqual(mockEvent);
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('UpdateEvent', () => {
    it('should update an event if user is the creator', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      mockRepo.update.mockResolvedValue({ ...mockEvent, title: 'Updated' });
      const useCase = new UpdateEvent(mockRepo);
      const result = await useCase.execute('evt1', 'admin1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw UnauthorizedEventActionError if user is not creator', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      const useCase = new UpdateEvent(mockRepo);
      await expect(useCase.execute('evt1', 'hacker', { title: 'Updated' })).rejects.toThrow(UnauthorizedEventActionError);
    });

    it('should throw EventNotFoundError if event does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const useCase = new UpdateEvent(mockRepo);
      await expect(useCase.execute('none', 'admin1', { title: 'Updated' })).rejects.toThrow(EventNotFoundError);
    });
  });

  describe('DeleteEvent', () => {
    it('should delete event if user is creator', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      const useCase = new DeleteEvent(mockRepo);
      await useCase.execute('evt1', 'admin1');
      expect(mockRepo.delete).toHaveBeenCalledWith('evt1');
    });

    it('should delete event if user is an office manager even when not creator', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      const useCase = new DeleteEvent(mockRepo);
      await useCase.execute('evt1', 'cms-user', 'ALUMNI_OFFICE');
      expect(mockRepo.delete).toHaveBeenCalledWith('evt1');
    });

    it('should throw UnauthorizedEventActionError for non-managers who are not creator', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      const useCase = new DeleteEvent(mockRepo);
      await expect(useCase.execute('evt1', 'hacker', 'ALUMNI')).rejects.toThrow(UnauthorizedEventActionError);
    });
  });

  describe('GetEvents', () => {
    it('should return list of events', async () => {
      mockRepo.findAll.mockResolvedValue([mockEvent]);
      const useCase = new GetEvents(mockRepo);
      const result = await useCase.execute();
      expect(result).toHaveLength(1);
    });
  });

  describe('RSVPToEvent', () => {
    it('should create a new RSVP if one does not exist', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      mockRepo.findRSVP.mockResolvedValue(null);
      mockRepo.createRSVP.mockResolvedValue(mockRSVP);
      const useCase = new RSVPToEvent(mockRepo);
      const result = await useCase.execute('evt1', 'alumni1', 'GOING');
      expect(result).toEqual(mockRSVP);
      expect(mockRepo.createRSVP).toHaveBeenCalledWith('evt1', 'alumni1', 'GOING');
    });

    it('should update an existing RSVP if status changes', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      mockRepo.findRSVP.mockResolvedValue(mockRSVP); // Currently GOING
      mockRepo.updateRSVP.mockResolvedValue({ ...mockRSVP, status: 'NOT_GOING' });
      const useCase = new RSVPToEvent(mockRepo);
      const result = await useCase.execute('evt1', 'alumni1', 'NOT_GOING');
      expect(result.status).toBe('NOT_GOING');
      expect(mockRepo.updateRSVP).toHaveBeenCalledWith('rsvp1', 'NOT_GOING');
    });

    it('should throw DuplicateRSVPError if status is identical', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      mockRepo.findRSVP.mockResolvedValue(mockRSVP); // Currently GOING
      const useCase = new RSVPToEvent(mockRepo);
      await expect(useCase.execute('evt1', 'alumni1', 'GOING')).rejects.toThrow(DuplicateRSVPError);
    });

    it('should throw EventNotFoundError if event does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      const useCase = new RSVPToEvent(mockRepo);
      await expect(useCase.execute('evt1', 'alumni1', 'GOING')).rejects.toThrow(EventNotFoundError);
    });
  });

  describe('GetEventAttendees', () => {
    it('should return attendees', async () => {
      mockRepo.findById.mockResolvedValue(mockEvent);
      mockRepo.getAttendees.mockResolvedValue([{ fullName: 'John Doe' }]);
      const useCase = new GetEventAttendees(mockRepo);
      const result = await useCase.execute('evt1');
      expect(result).toHaveLength(1);
    });
  });
});

import { IEventRepository } from '../ports/IEventRepository';
import { Event, EventRSVP } from '../../domain/entities/Event';
import {
  EventNotFoundError,
  UnauthorizedEventActionError,
  DuplicateRSVPError
} from '../../domain/errors/EventErrors';

export class CreateEvent {
  constructor(private readonly repo: IEventRepository) {}

  async execute(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
    return await this.repo.create(data);
  }
}

export class UpdateEvent {
  constructor(private readonly repo: IEventRepository) {}

  async execute(eventId: string, userId: string, data: Partial<Event>) {
    const event = await this.repo.findById(eventId);
    if (!event) throw new EventNotFoundError();
    if (event.createdBy !== userId) throw new UnauthorizedEventActionError();
    
    return await this.repo.update(eventId, data);
  }
}

export class DeleteEvent {
  constructor(private readonly repo: IEventRepository) {}

  async execute(eventId: string, userId: string) {
    const event = await this.repo.findById(eventId);
    if (!event) throw new EventNotFoundError();
    if (event.createdBy !== userId) throw new UnauthorizedEventActionError();
    
    return await this.repo.delete(eventId);
  }
}

export class GetEvents {
  constructor(private readonly repo: IEventRepository) {}

  async execute() {
    return await this.repo.findAll();
  }
}

export class RSVPToEvent {
  constructor(private readonly repo: IEventRepository) {}

  async execute(eventId: string, alumniId: string, status: string) {
    const event = await this.repo.findById(eventId);
    if (!event) throw new EventNotFoundError();

    const existingRSVP = await this.repo.findRSVP(eventId, alumniId);
    
    if (existingRSVP) {
      if (existingRSVP.status === status) {
        throw new DuplicateRSVPError();
      }
      return await this.repo.updateRSVP(existingRSVP.id, status);
    }

    return await this.repo.createRSVP(eventId, alumniId, status);
  }
}

export class GetEventAttendees {
  constructor(private readonly repo: IEventRepository) {}

  async execute(eventId: string) {
    const event = await this.repo.findById(eventId);
    if (!event) throw new EventNotFoundError();

    return await this.repo.getAttendees(eventId);
  }
}

import { IEventRepository } from '../ports/IEventRepository';
import { Event, EventRSVP } from '../../domain/entities/Event';
import {
  EventNotFoundError,
  UnauthorizedEventActionError,
  DuplicateRSVPError
} from '../../domain/errors/EventErrors';
import { NotificationDispatcher } from '../../../notifications/application/services/NotificationDispatcher';

const dispatcher = new NotificationDispatcher();

export class CreateEvent {
  constructor(private readonly repo: IEventRepository) {}

  async execute(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
    const event = await this.repo.create(data);
    
    // Broadcast event notification
    await dispatcher.broadcastEventNotification(event.title, event.date, event.location);
    
    return event;
  }
}

const EVENT_MANAGER_ROLES = new Set([
  'ADMIN',
  'SUPER_ADMIN',
  'ALUMNI_OFFICE',
  'CMS_MANAGER',
  'DEPARTMENT_HEAD',
]);

function canManageEvent(event: Event, userId: string, role?: string) {
  if (role && EVENT_MANAGER_ROLES.has(String(role).toUpperCase())) return true;
  // Legacy / seeded rows often have no createdBy — allow authenticated managers only above,
  // and the original author when present.
  if (event.createdBy && event.createdBy === userId) return true;
  return false;
}

export class UpdateEvent {
  constructor(private readonly repo: IEventRepository) {}

  async execute(eventId: string, userId: string, data: Partial<Event>, role?: string) {
    const event = await this.repo.findById(eventId);
    if (!event) throw new EventNotFoundError();
    if (!canManageEvent(event, userId, role)) throw new UnauthorizedEventActionError();
    
    return await this.repo.update(eventId, data);
  }
}

export class DeleteEvent {
  constructor(private readonly repo: IEventRepository) {}

  async execute(eventId: string, userId: string, role?: string) {
    const event = await this.repo.findById(eventId);
    if (!event) throw new EventNotFoundError();
    if (!canManageEvent(event, userId, role)) throw new UnauthorizedEventActionError();
    
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

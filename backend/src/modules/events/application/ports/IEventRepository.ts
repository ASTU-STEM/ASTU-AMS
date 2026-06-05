import { Event, EventRSVP } from '../../domain/entities/Event';

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findAll(): Promise<Event[]>;
  create(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event>;
  update(id: string, data: Partial<Event>): Promise<Event>;
  delete(id: string): Promise<void>;
  
  // RSVP operations
  findRSVP(eventId: string, alumniId: string): Promise<EventRSVP | null>;
  createRSVP(eventId: string, alumniId: string, status: string): Promise<EventRSVP>;
  updateRSVP(rsvpId: string, status: string): Promise<EventRSVP>;
  getAttendees(eventId: string): Promise<any[]>; // Returns list of alumni attendees
}

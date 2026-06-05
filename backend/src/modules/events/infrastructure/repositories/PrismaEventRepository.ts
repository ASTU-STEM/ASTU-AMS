import { IEventRepository } from '../../application/ports/IEventRepository';
import { Event, EventRSVP } from '../../domain/entities/Event';
import prisma from '../../../../core/config/db';

export class PrismaEventRepository implements IEventRepository {
  async findById(id: string): Promise<Event | null> {
    const event = await prisma.event.findUnique({ where: { id } });
    return event ? (event as any as Event) : null;
  }

  async findAll(): Promise<Event[]> {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });
    return events as any as Event[];
  }

  async create(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const event = await prisma.event.create({ data: data as any });
    return event as any as Event;
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    const event = await prisma.event.update({
      where: { id },
      data: data as any
    });
    return event as any as Event;
  }

  async delete(id: string): Promise<void> {
    await prisma.event.delete({ where: { id } });
  }

  async findRSVP(eventId: string, alumniId: string): Promise<EventRSVP | null> {
    const rsvp = await prisma.eventRSVP.findUnique({
      where: { eventId_alumniId: { eventId, alumniId } }
    });
    return rsvp ? (rsvp as any as EventRSVP) : null;
  }

  async createRSVP(eventId: string, alumniId: string, status: string): Promise<EventRSVP> {
    const rsvp = await prisma.eventRSVP.create({
      data: { eventId, alumniId, status }
    });
    return rsvp as any as EventRSVP;
  }

  async updateRSVP(rsvpId: string, status: string): Promise<EventRSVP> {
    const rsvp = await prisma.eventRSVP.update({
      where: { id: rsvpId },
      data: { status }
    });
    return rsvp as any as EventRSVP;
  }

  async getAttendees(eventId: string): Promise<any[]> {
    const attendees = await prisma.eventRSVP.findMany({
      where: { eventId, status: 'GOING' },
      include: {
        alumni: {
          select: {
            fullName: true,
            profilePicture: true,
            department: { select: { name: true } }
          }
        }
      }
    });
    return attendees;
  }
}

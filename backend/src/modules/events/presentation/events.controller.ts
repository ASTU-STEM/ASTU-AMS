import { Request, Response, NextFunction } from 'express';
import { PrismaEventRepository } from '../infrastructure/repositories/PrismaEventRepository';
import {
  CreateEvent,
  UpdateEvent,
  DeleteEvent,
  GetEvents,
  RSVPToEvent,
  GetEventAttendees
} from '../application/use-cases/ManageEvents';
import { createEventSchema, updateEventSchema, rsvpSchema } from './events.validation';
import { EventError } from '../domain/errors/EventErrors';
import prisma from '../../../core/config/db';

const repo = new PrismaEventRepository();

export const createEventController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createEventSchema.parse(req.body);
    const useCase = new CreateEvent(repo);
    const parsedDate = isNaN(new Date(validatedData.date).getTime()) ? new Date() : new Date(validatedData.date);
    const event = await useCase.execute({
      ...validatedData,
      date: parsedDate,
      createdBy: (req as any).user?.userId || 'system'
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEventController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = updateEventSchema.parse(req.body);
    const dataToUpdate = { ...validatedData };
    if (validatedData.date) {
      dataToUpdate.date = new Date(validatedData.date) as any;
    }
    const useCase = new UpdateEvent(repo);
    const event = await useCase.execute(req.params.eventId, (req as any).user.userId, dataToUpdate as any);
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEventController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new DeleteEvent(repo);
    await useCase.execute(req.params.eventId, (req as any).user.userId);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getEventsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    let registeredEventIds = new Set<string>();

    if (userId) {
      const alumni = await prisma.alumniProfile.findUnique({ where: { userId } }).catch(() => null);
      if (alumni) {
        const rsvps = await prisma.eventRSVP.findMany({
          where: { alumniId: alumni.id }
        }).catch(() => []);
        rsvps.forEach((r: any) => {
          if (['ATTENDING', 'GOING', 'CONFIRMED'].includes(r.status)) {
            registeredEventIds.add(r.eventId);
          }
        });
      }
    }

    const useCase = new GetEvents(repo);
    const events = await useCase.execute();
    const mappedEvents = events.map((e: any) => ({
      ...e,
      registered: Boolean(e.registered || registeredEventIds.has(e.id))
    }));

    res.json({ success: true, data: mappedEvents });
  } catch (error) {
    next(error);
  }
};

export const rsvpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = rsvpSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const alumni = await prisma.alumniProfile.findUnique({ where: { userId } });
    if (!alumni) return res.status(400).json({ success: false, message: 'Alumni profile required' });

    const existingRSVP = await repo.findRSVP(req.params.eventId, alumni.id);
    if (existingRSVP) {
      const rsvp = await repo.updateRSVP(existingRSVP.id, status || 'ATTENDING');
      return res.json({ success: true, data: rsvp });
    }

    const useCase = new RSVPToEvent(repo);
    const rsvp = await useCase.execute(req.params.eventId, alumni.id, status || 'ATTENDING');
    res.json({ success: true, data: rsvp });
  } catch (error: any) {
    if (error?.name === 'DuplicateRSVPError' || error?.message?.includes('Duplicate')) {
      return res.json({ success: true, message: 'Already registered for this event.' });
    }
    next(error);
  }
};

export const getAttendeesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetEventAttendees(repo);
    const attendees = await useCase.execute(req.params.eventId);
    res.json({ success: true, data: attendees });
  } catch (error) {
    next(error);
  }
};

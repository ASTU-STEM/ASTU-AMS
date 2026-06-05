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
import { AppError } from '../../../../core/errors/AppError';

const repo = new PrismaEventRepository();

export const createEventController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createEventSchema.parse(req.body);
    const useCase = new CreateEvent(repo);
    const event = await useCase.execute({
      ...validatedData,
      date: new Date(validatedData.date),
      createdBy: req.user!.id
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
    const event = await useCase.execute(req.params.eventId, req.user!.id, dataToUpdate as any);
    res.json({ success: true, data: event });
  } catch (error) {
    if (error instanceof EventError) return next(new AppError(error.message, error.statusCode));
    next(error);
  }
};

export const deleteEventController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new DeleteEvent(repo);
    await useCase.execute(req.params.eventId, req.user!.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    if (error instanceof EventError) return next(new AppError(error.message, error.statusCode));
    next(error);
  }
};

export const getEventsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetEvents(repo);
    const events = await useCase.execute();
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const rsvpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = rsvpSchema.parse(req.body);
    const useCase = new RSVPToEvent(repo);
    const rsvp = await useCase.execute(req.params.eventId, req.alumni!.id, status);
    res.json({ success: true, data: rsvp });
  } catch (error) {
    if (error instanceof EventError) return next(new AppError(error.message, error.statusCode));
    next(error);
  }
};

export const getAttendeesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetEventAttendees(repo);
    const attendees = await useCase.execute(req.params.eventId);
    res.json({ success: true, data: attendees });
  } catch (error) {
    if (error instanceof EventError) return next(new AppError(error.message, error.statusCode));
    next(error);
  }
};

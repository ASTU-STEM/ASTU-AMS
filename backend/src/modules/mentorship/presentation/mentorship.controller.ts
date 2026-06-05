import { Request, Response, NextFunction } from 'express';
import { PrismaMentorshipRepository } from '../infrastructure/repositories/PrismaMentorshipRepository';
import {
  RequestMentorship,
  RespondToMentorship,
  GetMyMentors,
  GetMyMentees
} from '../application/use-cases/ManageMentorship';
import { requestMentorshipSchema, respondMentorshipSchema } from './mentorship.validation';
import { MentorshipError } from '../domain/errors/MentorshipErrors';

const repo = new PrismaMentorshipRepository();

export const requestMentorshipController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mentorId, message } = requestMentorshipSchema.parse(req.body);
    const useCase = new RequestMentorship(repo);
    const request = await useCase.execute(mentorId, (req as any).user.alumniProfileId, message || null);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const respondMentorshipController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = respondMentorshipSchema.parse(req.body);
    const useCase = new RespondToMentorship(repo);
    const request = await useCase.execute(req.params.requestId, (req as any).user.alumniProfileId, status);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const getMyMentorsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetMyMentors(repo);
    const mentors = await useCase.execute((req as any).user.alumniProfileId);
    res.json({ success: true, data: mentors });
  } catch (error) {
    next(error);
  }
};

export const getMyMenteesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useCase = new GetMyMentees(repo);
    const mentees = await useCase.execute((req as any).user.alumniProfileId);
    res.json({ success: true, data: mentees });
  } catch (error) {
    next(error);
  }
};

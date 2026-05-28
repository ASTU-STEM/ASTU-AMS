import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response.utils';

export class MentorshipController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, 'Mentorship module placeholder', { available: false });
    } catch (err: any) {
      next(err);
    }
  }
}

export default MentorshipController;

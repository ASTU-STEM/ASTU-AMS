import { IMentorshipRepository } from '../ports/IMentorshipRepository';
import {
  DuplicateMentorshipRequestError,
  InvalidMentorshipTargetError,
  MentorshipRequestNotFoundError,
  UnauthorizedMentorshipActionError
} from '../../domain/errors/MentorshipErrors';

export class RequestMentorship {
  constructor(private readonly repo: IMentorshipRepository) {}

  async execute(mentorId: string, menteeId: string, message: string | null) {
    if (mentorId === menteeId) throw new InvalidMentorshipTargetError();

    const existingRequest = await this.repo.findByPair(mentorId, menteeId);
    if (existingRequest) throw new DuplicateMentorshipRequestError();

    return await this.repo.create({
      mentorId,
      menteeId,
      message,
      status: 'PENDING'
    });
  }
}

export class RespondToMentorship {
  constructor(private readonly repo: IMentorshipRepository) {}

  async execute(requestId: string, mentorId: string, status: string) {
    const request = await this.repo.findById(requestId);
    if (!request) throw new MentorshipRequestNotFoundError();
    if (request.mentorId !== mentorId) throw new UnauthorizedMentorshipActionError();

    return await this.repo.updateStatus(requestId, status);
  }
}

export class GetMyMentors {
  constructor(private readonly repo: IMentorshipRepository) {}

  async execute(menteeId: string) {
    return await this.repo.findRequestsForMentee(menteeId);
  }
}

export class GetMyMentees {
  constructor(private readonly repo: IMentorshipRepository) {}

  async execute(mentorId: string) {
    return await this.repo.findRequestsForMentor(mentorId);
  }
}

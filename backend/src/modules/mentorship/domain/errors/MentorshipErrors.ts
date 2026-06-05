export class MentorshipError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'MentorshipError';
    Object.setPrototypeOf(this, MentorshipError.prototype);
  }
}

export class DuplicateMentorshipRequestError extends MentorshipError {
  constructor() {
    super('A mentorship request already exists between you and this user.', 409);
    Object.setPrototypeOf(this, DuplicateMentorshipRequestError.prototype);
  }
}

export class InvalidMentorshipTargetError extends MentorshipError {
  constructor() {
    super('You cannot send a mentorship request to yourself.', 400);
    Object.setPrototypeOf(this, InvalidMentorshipTargetError.prototype);
  }
}

export class MentorshipRequestNotFoundError extends MentorshipError {
  constructor() {
    super('Mentorship request not found.', 404);
    Object.setPrototypeOf(this, MentorshipRequestNotFoundError.prototype);
  }
}

export class UnauthorizedMentorshipActionError extends MentorshipError {
  constructor() {
    super('You are not authorized to respond to this mentorship request.', 403);
    Object.setPrototypeOf(this, UnauthorizedMentorshipActionError.prototype);
  }
}

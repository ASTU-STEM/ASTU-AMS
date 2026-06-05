export class EventError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'EventError';
    Object.setPrototypeOf(this, EventError.prototype);
  }
}

export class EventNotFoundError extends EventError {
  constructor() {
    super('Event not found', 404);
    Object.setPrototypeOf(this, EventNotFoundError.prototype);
  }
}

export class DuplicateRSVPError extends EventError {
  constructor() {
    super('You have already RSVP\'d to this event.', 409);
    Object.setPrototypeOf(this, DuplicateRSVPError.prototype);
  }
}

export class RSVPNotFoundError extends EventError {
  constructor() {
    super('RSVP not found', 404);
    Object.setPrototypeOf(this, RSVPNotFoundError.prototype);
  }
}

export class UnauthorizedEventActionError extends EventError {
  constructor() {
    super('You are not authorized to modify this event.', 403);
    Object.setPrototypeOf(this, UnauthorizedEventActionError.prototype);
  }
}

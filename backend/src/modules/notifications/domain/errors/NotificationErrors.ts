export class NotificationError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'NotificationError';
    Object.setPrototypeOf(this, NotificationError.prototype);
  }
}

export class NotificationNotFoundError extends NotificationError {
  constructor() {
    super('Notification not found', 404);
    Object.setPrototypeOf(this, NotificationNotFoundError.prototype);
  }
}

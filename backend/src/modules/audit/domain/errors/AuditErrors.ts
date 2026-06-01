export class AuditError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'AuditError';
    Object.setPrototypeOf(this, AuditError.prototype);
  }
}

export class AuditLogNotFoundError extends AuditError {
  constructor() {
    super('Audit log entry not found', 404);
    Object.setPrototypeOf(this, AuditLogNotFoundError.prototype);
  }
}

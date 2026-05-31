export class RegistrarError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'RegistrarError';
    Object.setPrototypeOf(this, RegistrarError.prototype);
  }
}

export class GraduateNotFoundError extends RegistrarError {
  constructor() {
    super('Graduate record not found', 404);
    Object.setPrototypeOf(this, GraduateNotFoundError.prototype);
  }
}

export class InvalidFileFormatError extends RegistrarError {
  constructor(message: string = 'Invalid file format') {
    super(message, 400);
    Object.setPrototypeOf(this, InvalidFileFormatError.prototype);
  }
}

export class AlumniStatusUpdateError extends RegistrarError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, AlumniStatusUpdateError.prototype);
  }
}

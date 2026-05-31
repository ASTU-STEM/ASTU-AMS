export class AlumniError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'AlumniError';
    Object.setPrototypeOf(this, AlumniError.prototype);
  }
}

export class AlumniNotFoundError extends AlumniError {
  constructor() {
    super('Alumni profile not found', 404);
    Object.setPrototypeOf(this, AlumniNotFoundError.prototype);
  }
}

export class UnauthorizedExperienceError extends AlumniError {
  constructor() {
    super('Work experience not found or unauthorized', 404);
    Object.setPrototypeOf(this, UnauthorizedExperienceError.prototype);
  }
}

export class FileUploadError extends AlumniError {
  constructor() {
    super('No valid files were uploaded', 400);
    Object.setPrototypeOf(this, FileUploadError.prototype);
  }
}

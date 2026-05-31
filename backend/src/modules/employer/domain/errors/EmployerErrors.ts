export class EmployerError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'EmployerError';
    Object.setPrototypeOf(this, EmployerError.prototype);
  }
}

export class EmployerNotFoundError extends EmployerError {
  constructor() {
    super('Employer profile not found', 404);
    Object.setPrototypeOf(this, EmployerNotFoundError.prototype);
  }
}

export class JobNotFoundError extends EmployerError {
  constructor() {
    super('Job posting not found', 404);
    Object.setPrototypeOf(this, JobNotFoundError.prototype);
  }
}

export class JobApplicationNotFoundError extends EmployerError {
  constructor() {
    super('Job application not found', 404);
    Object.setPrototypeOf(this, JobApplicationNotFoundError.prototype);
  }
}

export class UnauthorizedEmployerActionError extends EmployerError {
  constructor(message: string = 'You do not have permission to modify this resource') {
    super(message, 403);
    Object.setPrototypeOf(this, UnauthorizedEmployerActionError.prototype);
  }
}

export class JobApplicationError extends EmployerError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, JobApplicationError.prototype);
  }
}

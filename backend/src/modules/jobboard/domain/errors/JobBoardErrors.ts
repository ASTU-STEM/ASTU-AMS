// ─── Job Board Domain Errors ─────────────────────────────────────────────────
// Business rule violations specific to the Job Board module.
// Each error carries an HTTP status code for the global error middleware.

export class JobBoardError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'JobBoardError';
    Object.setPrototypeOf(this, JobBoardError.prototype);
  }
}

export class AlumniProfileRequiredError extends JobBoardError {
  constructor() {
    super('You must have a complete alumni profile to perform this action.', 403);
    Object.setPrototypeOf(this, AlumniProfileRequiredError.prototype);
  }
}

export class DuplicateApplicationError extends JobBoardError {
  constructor() {
    super('You have already applied for this job.', 409);
    Object.setPrototypeOf(this, DuplicateApplicationError.prototype);
  }
}

export class JobExpiredError extends JobBoardError {
  constructor() {
    super('This job posting has passed its deadline.', 400);
    Object.setPrototypeOf(this, JobExpiredError.prototype);
  }
}

export class JobClosedError extends JobBoardError {
  constructor() {
    super('This job posting is no longer accepting applications.', 400);
    Object.setPrototypeOf(this, JobClosedError.prototype);
  }
}

export class JobNotPublishedError extends JobBoardError {
  constructor() {
    super('Job posting not found.', 404);
    Object.setPrototypeOf(this, JobNotPublishedError.prototype);
  }
}

export class SavedJobNotFoundError extends JobBoardError {
  constructor() {
    super('Saved job not found.', 404);
    Object.setPrototypeOf(this, SavedJobNotFoundError.prototype);
  }
}

export class ApplicationNotFoundError extends JobBoardError {
  constructor() {
    super('Application not found.', 404);
    Object.setPrototypeOf(this, ApplicationNotFoundError.prototype);
  }
}

export class CannotWithdrawError extends JobBoardError {
  constructor() {
    super('Cannot withdraw application in its current state.', 400);
    Object.setPrototypeOf(this, CannotWithdrawError.prototype);
  }
}

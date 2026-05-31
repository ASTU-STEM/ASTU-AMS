export class SurveyError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'SurveyError';
    Object.setPrototypeOf(this, SurveyError.prototype);
  }
}

export class SurveyNotFoundError extends SurveyError {
  constructor() {
    super('Survey not found', 404);
    Object.setPrototypeOf(this, SurveyNotFoundError.prototype);
  }
}

export class DuplicateSurveyResponseError extends SurveyError {
  constructor() {
    super('You have already submitted a response for this survey.', 409);
    Object.setPrototypeOf(this, DuplicateSurveyResponseError.prototype);
  }
}

export class InactiveSurveyError extends SurveyError {
  constructor() {
    super('This survey is no longer active.', 403);
    Object.setPrototypeOf(this, InactiveSurveyError.prototype);
  }
}

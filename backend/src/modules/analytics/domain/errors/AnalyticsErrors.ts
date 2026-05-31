export class AnalyticsError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'AnalyticsError';
    Object.setPrototypeOf(this, AnalyticsError.prototype);
  }
}

export class AnalyticsDataNotAvailableError extends AnalyticsError {
  constructor() {
    super('Analytics data is not currently available.', 503);
    Object.setPrototypeOf(this, AnalyticsDataNotAvailableError.prototype);
  }
}

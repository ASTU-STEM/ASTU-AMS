export class ContentError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'ContentError';
    Object.setPrototypeOf(this, ContentError.prototype);
  }
}

export class ContentNotFoundError extends ContentError {
  constructor(message = 'Content item not found') {
    super(message, 404);
    Object.setPrototypeOf(this, ContentNotFoundError.prototype);
  }
}

export class MediaAssetNotFoundError extends ContentError {
  constructor(message = 'Media asset not found') {
    super(message, 404);
    Object.setPrototypeOf(this, MediaAssetNotFoundError.prototype);
  }
}

export class UnauthorizedContentActionError extends ContentError {
  constructor(message = 'You are not authorized to perform this content action') {
    super(message, 403);
    Object.setPrototypeOf(this, UnauthorizedContentActionError.prototype);
  }
}

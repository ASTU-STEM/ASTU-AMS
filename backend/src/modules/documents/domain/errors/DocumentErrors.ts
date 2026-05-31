export class DocumentError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'DocumentError';
    Object.setPrototypeOf(this, DocumentError.prototype);
  }
}

export class DocumentNotFoundError extends DocumentError {
  constructor() {
    super('Document request not found', 404);
    Object.setPrototypeOf(this, DocumentNotFoundError.prototype);
  }
}

export class DuplicateDocumentRequestError extends DocumentError {
  constructor() {
    super('You already have a pending request for this document type.', 409);
    Object.setPrototypeOf(this, DuplicateDocumentRequestError.prototype);
  }
}

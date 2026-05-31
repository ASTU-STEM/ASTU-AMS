export class AuthError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid credentials', 401);
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class AccountPendingApprovalError extends AuthError {
  constructor() {
    super('Your account is pending admin approval', 403);
    Object.setPrototypeOf(this, AccountPendingApprovalError.prototype);
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('User not found', 404);
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super('Invalid or expired token', 401);
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}

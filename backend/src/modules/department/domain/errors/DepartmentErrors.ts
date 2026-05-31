export class DepartmentError extends Error {
  constructor(public readonly message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'DepartmentError';
    Object.setPrototypeOf(this, DepartmentError.prototype);
  }
}

export class DepartmentNotFoundError extends DepartmentError {
  constructor() {
    super('Department not found', 404);
    Object.setPrototypeOf(this, DepartmentNotFoundError.prototype);
  }
}

export class UnauthorizedDepartmentActionError extends DepartmentError {
  constructor(message: string = 'You do not have permission to access this department') {
    super(message, 403);
    Object.setPrototypeOf(this, UnauthorizedDepartmentActionError.prototype);
  }
}

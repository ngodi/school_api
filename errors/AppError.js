/**
 * AppError — base class for all application errors.
 * Throw this (or a subclass) anywhere in a handler or middleware.
 * ApiHandler._exec catches it and formats the response automatically.
 *
 * Usage:
 *   throw new AppError("School not found", 404);
 *   throw new NotFoundError("School");
 *   throw new ValidationError("Email is required");
 *   throw new UnauthorizedError();
 *   throw new ForbiddenError("You cannot transfer students to this school");
 */
export class AppError extends Error {
  constructor(message, code = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isAppError = true;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Not authorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 422);
  }
}

export class InternalError extends AppError {
  constructor(message = "An unexpected error occurred") {
    super(message, 500);
  }
}

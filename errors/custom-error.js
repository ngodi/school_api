import { BaseError } from "./baseError.js";

class CustomError extends BaseError {
  statusCode = 500;
  success = false;

  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors() {
    const errorResponse = {
      message: this.message,
      statusCode: this.statusCode,
      success: this.success,
    };

    return errorResponse;
  }
}

class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(message = "Bad request") {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

class NotAuthorizedError extends CustomError {
  statusCode = 401;

  constructor(message = "Not authenticated") {
    super(message);
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}

class TokenExpiredError extends CustomError {
  statusCode = 401;

  constructor(message = "Token has expired") {
    super(message);
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}
class ForbiddenError extends CustomError {
  statusCode = 403;

  constructor(message = "Not authorized") {
    super(message, error);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

class UniqueConstraintError extends CustomError {
  statusCode = 409;

  constructor(message = "Duplicate record") {
    super(message);
    Object.setPrototypeOf(this, UniqueConstraintError.prototype);
  }
}

class TooManyRequestsError extends CustomError {
  statusCode = 409;

  constructor(message = "Too many requests") {
    super(message);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(message = "Not found") {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

class ValidationError extends CustomError {
  statusCode = 422;

  constructor(message = "Validation Error") {
    super(message, error);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

class ServerError extends CustomError {
  statusCode = 500;

  constructor(message = "A server error occurred") {
    super(message);
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export {
  ForbiddenError,
  UniqueConstraintError,
  TooManyRequestsError,
  NotAuthorizedError,
  TokenExpiredError,
  NotFoundError,
  CustomError,
  ValidationError,
  BadRequestError,
  ServerError,
};

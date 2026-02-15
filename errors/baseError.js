export class BaseError extends Error {
  statusCode;
  success;
  error;

  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  serializeErrors() {}
}

export const errorHandler = (err) => {
  // AppError subclasses are intentional — use their code and message directly
  if (err.isAppError) {
    return {
      success: false,
      code: err.code,
      message: err.message,
    };
  }

  // Mongoose duplicate key (unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return {
      success: false,
      code: 409,
      message: `${field} already exists`,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return {
      success: false,
      code: 422,
      message: messages,
    };
  }

  // Mongoose cast error (invalid ObjectId etc.)
  if (err.name === "CastError") {
    return {
      success: false,
      code: 400,
      message: `Invalid value for ${err.path}: "${err.value}"`,
    };
  }

  // Unexpected error — log server-side, return safe message to client
  console.error(`[ApiHandler] Unexpected error in ${fnName}:`, err);
  return {
    success: false,
    code: 500,
    message: "An unexpected error occurred",
  };
};

class ResponseDispatcher {
  dispatch(res, { success, data, code, message, errors } = {}) {
    const statusCode = code ? code : success === true ? 200 : 400;
    const outputError = Array.isArray(errors)
      ? errors.map((err) => ({ field: err.field, message: err.msg }))
      : errors
        ? [errors]
        : null;
    return res.status(statusCode).send({
      success,
      message:
        message || (success ? "Operation successful" : "Operation failed"),
      ...(outputError ? { errors: outputError } : {}),
      ...(success && data ? { data: data } : {}),
    });
  }
}

export default ResponseDispatcher;

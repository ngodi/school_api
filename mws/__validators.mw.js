export default function validate(schema, source = "body") {
  return async function __validator(data) {
    const payload = data[source] || {};

    for (const field in schema) {
      const rules = schema[field];
      const value = payload[field];

      // Required check
      if (rules.required && (value === undefined || value === null)) {
        return {
          success: false,
          message: `${field} is required`,
        };
      }

      if (value !== undefined && value !== null) {
        // Type check
        if (rules.type) {
          if (rules.type === "string" && typeof value !== "string") {
            return { success: false, message: `${field} must be a string` };
          }

          if (rules.type === "number" && typeof value !== "number") {
            return { success: false, message: `${field} must be a number` };
          }

          if (rules.type === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              return {
                success: false,
                message: `${field} must be a valid email`,
              };
            }
          }
        }

        // Min length / value
        if (rules.min) {
          if (typeof value === "string" && value.length < rules.min) {
            return {
              success: false,
              message: `${field} must be at least ${rules.min} characters`,
            };
          }

          if (typeof value === "number" && value < rules.min) {
            return {
              success: false,
              message: `${field} must be >= ${rules.min}`,
            };
          }
        }
      }
    }

    return { success: true, data };
  };
}

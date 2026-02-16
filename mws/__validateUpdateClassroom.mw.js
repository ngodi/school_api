import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(1, "Classroom name cannot be empty").optional(),
    code: z.string().min(1, "Classroom code cannot be empty").optional(),
    capacity: z
      .number({ invalid_type_error: "Capacity must be a number" })
      .int("Capacity must be a whole number")
      .positive("Capacity must be greater than 0")
      .optional(),
    courses: z
      .array(z.string().min(1, "Course name cannot be empty"))
      .optional(),
    // schoolId changes not permitted after creation — omitted intentionally
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided for update",
  });

export default function __validateUpdateClassroom() {
  return async function __validateUpdateClassroom(data) {
    if (!data.classroomId) {
      return { success: false, code: 422, message: "Classroom id is required" };
    }

    const coerced = {
      ...data,
      capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
    };

    const result = schema.safeParse(coerced);
    if (!result.success) {
      return {
        success: false,
        code: 422,
        message: result.error.errors.map((e) => e.message).join(", "),
      };
    }
    return { success: true, data: { ...data, ...result.data } };
  };
}

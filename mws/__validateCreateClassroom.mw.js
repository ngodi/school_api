import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Classroom name is required"),
  code: z.string().min(1, "Classroom code is required"),
  schoolId: z.string().min(1, "schoolId is required"),
  // capacity and courses are optional per the schema
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number" })
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than 0")
    .optional(),
  courses: z.array(z.string().min(1, "Course name cannot be empty")).optional(),
});

export default function __validateCreateClassroom() {
  return async function __validateCreateClassroom(data) {
    // Coerce capacity to number if it arrived as a query/body string
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

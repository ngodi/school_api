import { z } from "zod";

const schema = z
  .object({
    firstName: z.string().min(1, "First name cannot be empty").optional(),
    lastName: z.string().min(1, "Last name cannot be empty").optional(),
    email: z.string().email("Invalid email address").optional(),
    // Allow moving student to a different classroom
    classroomId: z.string().min(1, "classroomId cannot be empty").optional(),
    // schoolId transfers not permitted — omitted intentionally
    enrollmentDate: z.coerce.date().optional(),
    status: z
      .enum(["active", "transferred"], {
        errorMap: () => ({ message: "Status must be active or transferred" }),
      })
      .optional(),
    // admissionNumber not updatable — auto-generated, omitted intentionally
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided for update",
  });

export default function __validateUpdateStudent() {
  return function __validateUpdateStudent(data) {
    if (!data.studentId) {
      return { success: false, code: 422, message: "Student id is required" };
    }

    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        code: 422,
        message: result.error.errors.map((e) => e.message).join(", "),
      };
    }
    return { success: true, data };
  };
}

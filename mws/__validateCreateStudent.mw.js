import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  classroomId: z.string().min(1, "classroomId is required"),
  schoolId: z.string().min(1, "schoolId is required"),
  // enrollmentDate optional — defaults to now in the schema
  enrollmentDate: z.coerce.date().optional(),
  // status optional — defaults to "active" in the schema
  status: z
    .enum(["active", "transferred"], {
      errorMap: () => ({ message: "Status must be active or transferred" }),
    })
    .optional(),
  // admissionNumber omitted — auto-generated in the pre-save hook
});

export default function __validateCreateStudent() {
  return async function __validateCreateStudent(data) {
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

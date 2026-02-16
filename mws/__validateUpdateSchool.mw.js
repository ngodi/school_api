import { z } from "zod";

// All fields optional on update — but at least one must be provided
const schema = z
  .object({
    name: z.string().min(1, "School name cannot be empty").optional(),
    address: z.string().min(1, "Address cannot be empty").optional(),
    contactEmail: z.string().email("Invalid contact email").optional(),
    phone: z.string().min(7, "Phone number is too short").optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided for update",
  });

export default function __validateUpdateSchool() {
  return function __validateUpdateSchool(data) {
    // id is required to know which school to update
    if (!data.schoolId) {
      return { success: false, code: 422, message: "School id is required" };
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

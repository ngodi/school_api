import { z } from "zod";

// All fields optional — but at least one must be present
const schema = z
  .object({
    firstName: z.string().min(1, "First name cannot be empty").optional(),
    lastName: z.string().min(1, "Last name cannot be empty").optional(),
    phone: z.string().min(7, "Phone number is too short").optional(),
    // Email changes allowed but must be valid
    email: z.string().email("Invalid email address").optional(),
    // Password changes: enforce same strength rules as create
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      )
      .optional(),
    // Role changes allowed only by superadmin — enforced in handler/rbac
    role: z
      .enum(["superadmin", "schooladmin"], {
        errorMap: () => ({ message: "Role must be superadmin or schooladmin" }),
      })
      .optional(),
    isActive: z.boolean().optional(),
    schoolId: z.string().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided for update",
  });

export default function __validateUpdateUser() {
  return async function __validateUpdateUser(data) {
    if (!data.userId) {
      return { success: false, code: 422, message: "User id is required" };
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

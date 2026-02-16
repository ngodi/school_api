import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["superadmin", "schooladmin"], {
    errorMap: () => ({ message: "Role must be superadmin or schooladmin" }),
  }),
  phone: z.string().min(7, "Phone number is too short").optional(),
  // schoolId required when creating a schooladmin
  schoolId: z.string().optional(),
});

export default function __validateCreateUser() {
  return function __validateCreateUser(data) {
    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        code: 422,
        message: result.error.errors.map((e) => e.message).join(", "),
      };
    }

    // schooladmin must be tied to a school
    if (data.role === "schooladmin" && !data.schoolId) {
      return {
        success: false,
        code: 422,
        message: "schoolId is required when creating a schooladmin",
      };
    }

    return { success: true, data };
  };
}

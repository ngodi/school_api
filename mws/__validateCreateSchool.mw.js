import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  contactEmail: z.string().email("Invalid email"),
  phone: z.string().min(7, "Invalid phone"),
});

export default function __validateCreateSchool() {
  return async function __validateCreateSchool(data) {
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

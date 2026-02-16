import { z } from "zod";

const schema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  toSchoolId: z.string().min(1, "toSchoolId is required"),
  toClassroomId: z.string().min(1, "toClassroomId is required"),
  reason: z.string().min(1, "Reason cannot be empty").optional(),
});

export default function __validateTransferStudent() {
  return function __validateTransferStudent(data) {
    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        code: 422,
        message: result.error.errors.map((e) => e.message).join(", "),
      };
    }

    // Cannot transfer to the same school AND classroom
    if (
      data.toSchoolId === data.currentSchoolId &&
      data.toClassroomId === data.currentClassroomId
    ) {
      return {
        success: false,
        code: 422,
        message: "Student is already enrolled in this school and classroom",
      };
    }

    return { success: true, data };
  };
}

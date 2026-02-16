import Student from "../managers/students/Student.model.js";

export default function __rbac_transfer() {
  return async function __rbac_transfer(data) {
    const user = data.user;

    // Superadmin can always transfer
    if (user.role === "superadmin") {
      return { success: true, data };
    }

    if (user.role !== "schooladmin") {
      return { success: false, code: 403, message: "Access denied" };
    }

    // Load the student to find their current school
    const student = await Student.findById(data.studentId);
    if (!student) {
      return { success: false, code: 404, message: "Student not found" };
    }

    const adminSchoolId = user.schoolId?.toString();
    const fromSchoolId = student.schoolId?.toString();
    const toSchoolId = data.toSchoolId;

    // Schooladmin must belong to either the source or destination school
    if (adminSchoolId !== fromSchoolId && adminSchoolId !== toSchoolId) {
      return {
        success: false,
        code: 403,
        message: "You can only transfer students from or to your own school",
      };
    }

    // Attach student to data so the handler doesn't need to re-fetch
    data.student = student;
    return { success: true, data };
  };
}

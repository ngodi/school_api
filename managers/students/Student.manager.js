import Classroom from "../classrooms/Classroom.model.js";
import School from "../schools/School.model.js";
import Student from "./Student.model.js";
import StudentTransfer from "./StudentTransfer.model.js";

class StudentManager {
  constructor({ config, mwsRepo, managers, redis }) {
    this.config = config;
    this.mwsRepo = mwsRepo;
    this.managers = managers;
    this.redis = redis;

    this.httpExposed = [
      "create|__auth|__rbac_schooladmin|__validateCreateStudent",
      "list|__auth|__rbac_schooladmin",
      "update|__auth|__rbac_schooladmin|__validateUpdateStudent",
      "get|__auth",
      "remove|__auth|__rbac_schooladmin",
      "post=transfer|__auth|__rbac_transfer|__validateTransferStudent",
    ];
  }

  async create({
    firstName,
    lastName,
    email,
    admissionNumber,
    classroomId,
    schoolId,
    user,
  }) {
    const exists = await Student.findOne({
      $or: [{ email }, { admissionNumber }],
    });
    if (exists)
      return {
        success: false,
        message: "Email or admission number already exists",
      };
    const student = new Student({
      firstName,
      lastName,
      email,
      admissionNumber,
      classroomId,
      schoolId,
      createdBy: user._id,
    });
    await student.save();
    return { success: true, data: student };
  }

  async get({ studentId }) {
    const student = await Student.findById(studentId);
    if (!student) return { success: false, message: "Student not found" };
    return { success: true, data: student };
  }

  async update({ studentId, ...updates }) {
    if (updates.email || updates.admissionNumber) {
      const exists = await Student.findOne({
        $or: [
          updates.email ? { email: updates.email } : {},
          updates.admissionNumber
            ? { admissionNumber: updates.admissionNumber }
            : {},
        ],
        _id: { $ne: studentId },
      });
      if (exists)
        return {
          success: false,
          message: "Email or admission number already exists",
        };
    }
    const student = await Student.findByIdAndUpdate(studentId, updates, {
      new: true,
    });
    if (!student) return { success: false, message: "Student not found" };
    return { success: true, data: student };
  }

  async remove({ studentId }) {
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) return { success: false, message: "Student not found" };
    return { success: true, data: student };
  }

  async list({ classroomId, schoolId, page = 1, limit = 10 }) {
    const query = {};
    if (classroomId) query.classroomId = classroomId;
    if (schoolId) query.schoolId = schoolId;
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find(query).skip(skip).limit(limit),
      Student.countDocuments(query),
    ]);
    return {
      success: true,
      data: {
        students,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async transfer(data) {
    const {
      studentId,
      toSchoolId,
      toClassroomId,
      reason,
      id: transferredBy,
    } = data;

    // __rbac_transfer already loaded and attached the student to avoid re-fetching
    const student = data.student || (await Student.findById(studentId));
    if (!student) {
      return { success: false, code: 404, message: "Student not found" };
    }

    // Validate destination school exists
    const toSchool = await School.findById(toSchoolId);
    if (!toSchool) {
      return {
        success: false,
        code: 404,
        message: "Destination school not found",
      };
    }

    // Validate destination classroom exists and belongs to destination school
    const toClassroom = await Classroom.findById(toClassroomId);
    if (!toClassroom) {
      return {
        success: false,
        code: 404,
        message: "Destination classroom not found",
      };
    }
    if (toClassroom.schoolId.toString() !== toSchoolId) {
      return {
        success: false,
        code: 422,
        message:
          "Destination classroom does not belong to the destination school",
      };
    }

    // Snapshot current location for the history record and for rollback
    const fromSchoolId = student.schoolId;
    const fromClassroomId = student.classroomId;
    const previousStatus = student.status;

    // Step 1: Update the student
    student.schoolId = toSchoolId;
    student.classroomId = toClassroomId;
    student.status = "transferred";

    try {
      await student.save();
    } catch (err) {
      // Student save failed — nothing written yet, nothing to roll back
      return {
        success: false,
        code: 500,
        message: `Transfer failed while updating student: ${err.message}`,
      };
    }

    // Step 2: Write the transfer history record
    let transfer;
    try {
      transfer = new StudentTransfer({
        studentId: student._id,
        fromSchoolId,
        fromClassroomId,
        toSchoolId,
        toClassroomId,
        transferredBy,
        reason: reason || null,
        status: "completed",
        transferredAt: new Date(),
      });
      await transfer.save();
    } catch (err) {
      // History write failed — roll the student back to their original location
      try {
        student.schoolId = fromSchoolId;
        student.classroomId = fromClassroomId;
        student.status = previousStatus;
        await student.save();
      } catch (rollbackErr) {
        // Rollback itself failed
        console.error(
          `[StudentManager.transfer] CRITICAL: student ${student._id} was moved ` +
            `but transfer record failed AND rollback failed. Manual intervention required.`,
          rollbackErr,
        );
      }

      return {
        success: false,
        code: 500,
        message: `Transfer failed while recording history: ${err.message}`,
      };
    }

    return {
      success: true,
      code: 200,
      message: "Student transferred successfully",
      data: { student, transfer },
    };
  }
}

export default StudentManager;

import Student from "./Student.model.js";

class StudentManager {
  constructor({ config, mwsRepo, managers, redis }) {
    this.config = config;
    this.mwsRepo = mwsRepo;
    this.managers = managers;
    this.redis = redis;

    this.httpExposed = [
      "create|__auth|__rbac_schooladmin",
      "list|__auth|__rbac_schooladmin",
      "update|__auth|__rbac_schooladmin",
      "get|__auth",
      "remove|__auth|__rbac_schooladmin",
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

  async get({ id }) {
    const student = await Student.findById(id);
    if (!student) return { success: false, message: "Student not found" };
    return { success: true, data: student };
  }

  async update({ id, ...updates }) {
    if (updates.email || updates.admissionNumber) {
      const exists = await Student.findOne({
        $or: [
          updates.email ? { email: updates.email } : {},
          updates.admissionNumber
            ? { admissionNumber: updates.admissionNumber }
            : {},
        ],
        _id: { $ne: id },
      });
      if (exists)
        return {
          success: false,
          message: "Email or admission number already exists",
        };
    }
    const student = await Student.findByIdAndUpdate(id, updates, { new: true });
    if (!student) return { success: false, message: "Student not found" };
    return { success: true, data: student };
  }

  async remove({ id }) {
    const student = await Student.findByIdAndDelete(id);
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
}

export default StudentManager;

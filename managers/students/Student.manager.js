import Student from "./Student.model.js";

class StudentManager {
  httpExposed = ["create", "get", "update", "remove", "list"];

  async create(
    __auth,
    __rbac,
    {
      firstName,
      lastName,
      email,
      admissionNumber,
      classroomId,
      schoolId,
      user,
    },
  ) {
    const exists = await Student.findOne({
      $or: [{ email }, { admissionNumber }],
    });
    if (exists)
      return { ok: false, error: "Email or admission number already exists" };
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
    return { ok: true, data: student };
  }

  async get(__auth, { id }) {
    const student = await Student.findById(id);
    if (!student) return { ok: false, error: "Student not found" };
    return { ok: true, data: student };
  }

  async update(__auth, __rbac, { id, ...updates }) {
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
        return { ok: false, error: "Email or admission number already exists" };
    }
    const student = await Student.findByIdAndUpdate(id, updates, { new: true });
    if (!student) return { ok: false, error: "Student not found" };
    return { ok: true, data: student };
  }

  async remove(__auth, __rbac, { id }) {
    const student = await Student.findByIdAndDelete(id);
    if (!student) return { ok: false, error: "Student not found" };
    return { ok: true, data: student };
  }

  async list(__auth, __rbac, { classroomId, schoolId, page = 1, limit = 10 }) {
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
      ok: true,
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

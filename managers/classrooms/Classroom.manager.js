import Classroom from "./Classroom.model.js";

class ClassroomManager {
  httpExposed = ["create", "get", "update", "remove", "list"];

  async create(__auth, __rbac, { name, code, schoolId, user }) {
    const exists = await Classroom.findOne({ code, schoolId });
    if (exists)
      return {
        ok: false,
        error: "Classroom code already exists in this school",
      };
    const classroom = new Classroom({
      name,
      code,
      schoolId,
      createdBy: user._id,
    });
    await classroom.save();
    return { ok: true, data: classroom };
  }

  async get(__auth, { id }) {
    const classroom = await Classroom.findById(id);
    if (!classroom) return { ok: false, error: "Classroom not found" };
    return { ok: true, data: classroom };
  }

  async update(__auth, __rbac, { id, ...updates }) {
    if (updates.code) {
      const exists = await Classroom.findOne({
        code: updates.code,
        _id: { $ne: id },
      });
      if (exists) return { ok: false, error: "Classroom code already exists" };
    }
    const classroom = await Classroom.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!classroom) return { ok: false, error: "Classroom not found" };
    return { ok: true, data: classroom };
  }

  async remove(__auth, __rbac, { id }) {
    const classroom = await Classroom.findByIdAndDelete(id);
    if (!classroom) return { ok: false, error: "Classroom not found" };
    return { ok: true, data: classroom };
  }

  async list(__auth, __rbac, { schoolId, page = 1, limit = 10 }) {
    const query = schoolId ? { schoolId } : {};
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (page - 1) * limit;
    const [classrooms, total] = await Promise.all([
      Classroom.find(query).skip(skip).limit(limit),
      Classroom.countDocuments(query),
    ]);
    return {
      ok: true,
      data: {
        classrooms,
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

export default ClassroomManager;

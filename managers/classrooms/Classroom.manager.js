import Classroom from "./Classroom.model.js";

class ClassroomManager {
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

  async create(data) {
    const { name, code, schoolId } = data;

    const exists = await Classroom.findOne({ code, schoolId });
    if (exists)
      return {
        success: false,
        code: 409,
        message: "Classroom code already exists in this school",
      };

    const classroom = new Classroom({
      name,
      code,
      schoolId,
      createdBy: data.id,
    });

    await classroom.save();

    return { success: true, data: classroom, code: 201 };
  }

  async get({ id }) {
    const classroom = await Classroom.findById(id);
    if (!classroom)
      return { success: false, message: "Classroom not found", code: 404 };
    return { success: true, data: classroom, code: 200 };
  }

  async update({ id, ...updates }) {
    if (updates.code) {
      const exists = await Classroom.findOne({
        code: updates.code,
        _id: { $ne: id },
      });
      if (exists)
        return {
          success: false,
          message: "Classroom code already exists",
          code: 400,
        };
    }
    const classroom = await Classroom.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!classroom)
      return { success: false, message: "Classroom not found", code: 404 };
    return { success: true, data: classroom, code: 200 };
  }

  async remove({ id }) {
    const classroom = await Classroom.findByIdAndDelete(id);

    if (!classroom)
      return { success: false, message: "Classroom not found", code: 404 };
    return { success: true, data: classroom, code: 204 };
  }

  async list(data) {
    let { schoolId, page = 1, limit = 10 } = data;
    const query = schoolId ? { schoolId } : {};

    page = Math.max(1, parseInt(page));
    limit = Math.max(1, Math.min(100, parseInt(limit)));

    const skip = (page - 1) * limit;

    const [classrooms, total] = await Promise.all([
      Classroom.find(query).skip(skip).limit(limit),
      Classroom.countDocuments(query),
    ]);

    return {
      success: true,
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

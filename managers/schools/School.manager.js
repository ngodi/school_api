import School from "./School.model.js";

export default class SchoolManager {
  constructor({ config, mwsRepo, managers, redis }) {
    this.config = config;
    this.mwsRepo = mwsRepo;
    this.managers = managers;
    this.redis = redis;

    this.httpExposed = [
      "create|__auth|__rbac_superadmin",
      "list|__auth|__rbac_superadmin",
      "update|__auth|__rbac_superadmin",
      "get|__auth",
      "remove|__auth|__rbac_superadmin",
    ];
  }

  async create(data) {
    const { name, address, contactEmail, phone } = data;

    const school = new School({
      name,
      address,
      contactEmail,
      phone,
      createdBy: data.id,
      createdAt: new Date(),
    });

    await school.save();

    return {
      success: true,
      code: 201,
      message: "School created successfully",
      data: school,
    };
  }

  async get(data) {
    const { schoolId } = data;
    const school = await School.findById(schoolId);

    if (!school) {
      return { success: false, code: 404, message: "School not found" };
    }

    return { success: true, code: 200, data: school };
  }

  async update(data) {
    const { schoolId, name, address, contactEmail, phone } = data;

    const school = await School.findByIdAndUpdate(
      schoolId,
      { name, address, contactEmail, phone },
      { new: true, runValidators: true },
    );

    if (!school) {
      return { success: false, code: 404, message: "School not found" };
    }

    return {
      success: true,
      code: 200,
      message: "School updated successfully",
      data: school,
    };
  }

  async list(data) {
    const { page = 1, limit = 10 } = data;
    const skip = (page - 1) * limit;

    const [schools, total] = await Promise.all([
      School.find().skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      School.countDocuments(),
    ]);

    return {
      success: true,
      code: 200,
      data: { schools, total, page: Number(page), limit: Number(limit) },
    };
  }

  async remove(data) {
    const { schoolId } = data;
    const school = await School.findByIdAndDelete(schoolId);

    if (!school) {
      return { success: false, code: 404, message: "School not found" };
    }

    return {
      success: true,
      code: 204,
      message: "School deleted successfully",
    };
  }
}

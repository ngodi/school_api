import School from "./School.model.js";
class SchoolManager {
  constructor({ config, mwsRepo } = {}) {
    this.config = config || {};
    this.mwsRepo = mwsRepo || {};

    // Expose these methods to HTTP API
    this.httpExposed = ["create", "list", "update", "remove", "get"];
  }

  // POST /api/v1/schools
  async create(data, __auth, __validators, __rbac_superadmin) {
    const { name, address, contactEmail, phone, user } = data;
    const school = new School({
      name,
      address,
      contactEmail,
      phone,
      createdBy: user._id,
      createdAt: new Date(),
    });
    await school.save();
    return {
      success: true,
      message: "School created successfully",
      data: school,
    };
  }

  // GET /api/v1/schools/get?id=id
  async get({ id: id }, __auth, __rbac_schooladmin) {
    console.log(`Fetching school with ID: ${id}`);
    const school = await School.findById(id);
    if (!school) return { success: false, message: "School not found" };
    return {
      success: true,
      message: "School retrieved successfully",
      data: school,
    };
  }

  // PUT /api/v1/schools/update?id=id
  async update({ id, ...updates }, __auth, __rbac_superadmin) {
    const school = await School.findByIdAndUpdate(id, updates, { new: true });
    if (!school) return { success: false, message: "School not found" };
    return {
      success: true,
      message: "School updated successfully",
      data: school,
    };
  }

  // DELETE /api/v1/schools/:id
  async remove({ id }, __auth, __rbac_superadmin) {
    const school = await School.findByIdAndDelete(id);
    if (!school) return { success: false, message: "School not found" };
    return {
      success: true,
      message: "School deleted successfully",
    };
  }

  // GET /api/v1/schools
  async list({ page = 1, limit = 10 }, __auth, __rbac_superadmin) {
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (page - 1) * limit;
    const [schools, total] = await Promise.all([
      School.find({}).skip(skip).limit(limit),
      School.countDocuments({}),
    ]);
    return {
      success: true,
      message: "Schools retrieved successfully",
      data: {
        schools,
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

export default SchoolManager;

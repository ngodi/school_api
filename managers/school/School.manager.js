import School from "./School.model.js";

/**
 * @openapi
 * /api/v1/admin/schools:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a new school
 *     description: Only superadmin can create schools
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: School created successfully
 *       401:
 *         description: Unauthorized
 *
 * /api/v1/schools/{id}:
 *   get:
 *     tags:
 *       - Schools
 *     summary: Get school details
 *     description: School admins can view their own school
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: School details retrieved
 *       403:
 *         description: Access denied
 *
 * /api/v1/admin/schools/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update school details
 *     description: Only superadmin can update schools
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               schoolId:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: School updated successfully
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a school
 *     description: Only superadmin can delete schools
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               schoolId:
 *                 type: string
 *     responses:
 *       200:
 *         description: School deleted successfully
 *       401:
 *         description: Unauthorized
 */
class SchoolManager {
  httpExposed = ["create", "list", "update", "remove", "get"];

  // POST /api/v1/schools
  async create(__auth, __rbac, { name, address, contactEmail, phone, user }) {
    const school = new School({
      name,
      address,
      contactEmail,
      phone,
      createdBy: user._id,
      createdAt: new Date(),
    });
    await school.save();
    return { ok: true, data: school };
  }

  // GET /api/v1/schools/:id
  async get(__auth, { id }) {
    const school = await School.findById(id);
    if (!school) return { ok: false, error: "School not found" };
    return { ok: true, data: school };
  }

  // PUT /api/v1/schools/:id
  async update(__auth, __rbac, { id, ...updates }) {
    const school = await School.findByIdAndUpdate(id, updates, { new: true });
    if (!school) return { ok: false, error: "School not found" };
    return { ok: true, data: school };
  }

  // DELETE /api/v1/schools/:id
  async remove(__auth, __rbac, { id }) {
    const school = await School.findByIdAndDelete(id);
    if (!school) return { ok: false, error: "School not found" };
    return { ok: true, data: school };
  }

  // GET /api/v1/schools
  async list(__auth, __rbac, {}) {
    const schools = await School.find({});
    return { ok: true, data: schools };
  }
}

export default SchoolManager;

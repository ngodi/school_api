import User from "./User.model.js";
import bcrypt from "bcrypt";

const userManager = {
  // List of exposed functions for API manager
  httpExposed: ["createUser", "login", "logout"],

  /**
   * Create user (school_admin) by superadmin or schooladmin
   */
  async createUser({ email, password, role, schoolId, requester }) {
    // Only allow creation of school_admin users
    if (role !== "school_admin") {
      return { ok: false, error: "Only school_admin users can be created" };
    }
    // Only superadmin or school_admin can create
    if (
      !requester ||
      !["superadmin", "school_admin"].includes(requester.role)
    ) {
      return { ok: false, error: "Not authorized to create users" };
    }
    // If school_admin, must provide schoolId and can only create for their own school
    if (requester.role === "school_admin") {
      if (!schoolId || String(schoolId) !== String(requester.schoolId)) {
        return { ok: false, error: "schoolId must match your own school" };
      }
    }
    // If superadmin, schoolId is required
    if (requester.role === "superadmin" && !schoolId) {
      return { ok: false, error: "schoolId is required for new user" };
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return { ok: false, error: "Email already in use" };
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash, role, schoolId });
    await user.save();
    return {
      ok: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      },
    };
  },

  /**
   * User login
   */
  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return { ok: false, error: "Invalid credentials" };
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { ok: false, error: "Invalid credentials" };
    }
    // Issue JWT
    const jwt = (await import("jsonwebtoken")).default;
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    return {
      ok: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
        },
      },
    };
  },

  /**
   * User logout
   */
  async logout({ token }) {
    // For stateless JWT, logout is handled client-side (token deletion).
    return {
      ok: true,
      message: "User logged out successfully",
    };
  },
};

export default userManager;

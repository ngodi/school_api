import User from "./User.model.js";
import bcrypt from "bcrypt";
import config from "../../config.js";

export default class UserManager {
  constructor({ config, mwsRepo, managers, redis }) {
    this.config = config;
    this.mwsRepo = mwsRepo;
    this.managers = managers;
    this.redis = redis;

    this.httpExposed = [
      "login",
      "logout|__auth",
      "create|__auth|__rbac_superadmin|__validateCreateUser",
      "list|__auth|__rbac_superadmin",
      "update|__auth|__rbac_superadmin|__validateUpdateUser",
      "get|__auth",
      "remove|__auth|__rbac_superadmin",
    ];
  }

  /**
   * List users with pagination
   */
  async list({ page = 1, limit = 10 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({})
        .populate("schoolId", "name address contactEmail phone")
        .skip(skip)
        .limit(limit),
      User.countDocuments({}),
    ]);
    return {
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  /**
   * Get user by ID
   */
  async get(data) {
    if (
      data.user.role === "schooladmin" &&
      data.user.id.toString() !== data.userId
    ) {
      return { success: false, message: "Not authorized to access this user" };
    }

    const user = await User.findById(data.userId).populate(
      "schoolId",
      "name address contactEmail phone",
    );
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return {
      success: true,
      message: "User retrieved successfully",
      data: user,
    };
  }

  /**
   * Update user by ID
   */
  async update({ userId, ...updates }) {
    const editableFields = ["firstName", "lastName", "phone"];

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    Object.keys(updates).forEach((key) => {
      if (editableFields.includes(key)) {
        user[key] = updates[key];
      }
    });
    await user.save();
    return {
      success: true,
      message: "User updated successfully",
      data: user,
    };
  }

  /**
   * Delete user by ID
   */
  async remove({ userId }) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return {
      success: true,
      message: "User deleted successfully",
    };
  }

  /**
   * Create user (school_admin) by superadmin or schooladmin
   */
  async create(data) {
    const { email, password, role, schoolId, firstName, lastName, phone } =
      data;
    // Only allow creation of school_admin users
    if (role !== "schooladmin") {
      return {
        success: false,
        message: "Only schooladmin users can be created",
      };
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return { success: false, message: "Email already in use" };
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      passwordHash,
      role,
      schoolId,
      firstName,
      lastName,
      phone,
    });
    await user.save();
    return {
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      },
    };
  }

  /**
   * User login
   */
  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return { success: false, message: "Invalid credentials" };
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { success: false, message: "Invalid credentials" };
    }
    // Issue JWT
    const jwt = (await import("jsonwebtoken")).default;
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    return {
      success: true,
      message: "Login successful",
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
  }

  /**
   * User logout
   */
  async logout({ token }) {
    // Get token expiration
    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    // Store in Redis
    await this.redis.set(`bl_${token}`, "true", { EX: ttl });
    return {
      success: true,
      message: "User logged out successfully",
    };
  }
}

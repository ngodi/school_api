import User from "./User.model.js";
import bcrypt from "bcrypt";
import config from "../../config.js";
import { get } from "mongoose";

const UserManager = {
  // List of exposed functions for API manager
  httpExposed: ["create", "login", "logout", "list", "get", "update", "remove"],
  /**
   * List users with pagination
   */
  async list({ page = 1, limit = 10 }, __auth, __rbac_superadmin) {
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
  },

  /**
   * Get user by ID
   */
  async get({ id }, __auth, __rbac_schooladmin) {
    const user = await User.findById(id).populate(
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
  },

  /**
   * Update user by ID
   */
  async update({ id, ...updates }, __auth, __rbac_superadmin) {
    const user = await User.findById(id);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    Object.keys(updates).forEach((key) => {
      if (key !== "password") {
        user[key] = updates[key];
      }
    });
    await user.save();
    return {
      success: true,
      message: "User updated successfully",
      data: user,
    };
  },

  /**
   * Delete user by ID
   */
  async remove({ id }, __auth, __rbac_superadmin) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return {
      success: true,
      message: "User deleted successfully",
    };
  },

  /**
   * Create user (school_admin) by superadmin or schooladmin
   */
  async create(data, __auth, __validators, __rbac_superadmin) {
    const { email, password, role, schoolId } = data;
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
    const user = new User({ email, passwordHash, role, schoolId });
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
  },

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
  },

  /**
   * User logout
   */
  async logout({ token }) {
    // For stateless JWT, logout is handled client-side (token deletion).
    return {
      success: true,
      message: "User logged out successfully",
    };
  },
};

export default UserManager;

import jwt from "jsonwebtoken";
import User from "../managers/users/User.model.js";
import config from "../config.js";
import { InternalError } from "../errors/AppError.js";

export default function authMiddleware({ redis }) {
  return async function __auth(data) {
    const token = data.token;

    if (!token) {
      return { success: false, message: "No token provided", code: 401 };
    }

    // Check token blacklist (set on logout)
    const isBlacklisted = await redis.get(`bl_${token}`);
    if (isBlacklisted) {
      return {
        success: false,
        message: "Not authorized, token expired",
        code: 401,
      };
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return {
          success: false,
          message: "Invalid or inactive user",
          code: 401,
        };
      }

      data.user = user;
      data.id = user._id.toString();
      return { success: true, data, code: 200 };
    } catch (err) {
      throw new InternalError(err.message);
    }
  };
}

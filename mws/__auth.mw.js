import jwt from "jsonwebtoken";
import User from "../managers/users/User.model.js";
import config from "../config.js";

export default function authMiddleware() {
  return async function __auth(data) {
    const token = data.token;
    if (!token) {
      return { success: false, message: "No token provided" };
    }
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return { success: false, message: "Invalid or inactive user" };
      }
      data.user = user;
      return { success: true, data };
    } catch (err) {
      return { success: false, message: "Invalid token" };
    }
  };
}

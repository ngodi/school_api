import jwt from "jsonwebtoken";
import User from "../managers/user/User.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key";

export default function authMiddleware() {
  return async function __auth(data) {
    const token = data.token;
    if (!token) {
      return { ok: false, error: "No token provided" };
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return { ok: false, error: "Invalid or inactive user" };
      }
      data.user = user;
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: "Invalid token" };
    }
  };
}

import { body, validationResult } from "express-validator";
import User from "../managers/user/User.model.js";

export const validateCreateUser = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const exists = await User.findOne({ email });
      if (exists) throw new Error("Email already in use");
      return true;
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role").isIn(["superadmin", "school_admin"]).withMessage("Invalid role"),
  body("schoolId")
    .optional()
    .isMongoId()
    .withMessage("Invalid schoolId format"),
];

export const validateLogin = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  next();
};

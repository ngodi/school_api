import { body, validationResult } from "express-validator";
import User from "../managers/users/User.model.js";

export default () => ({
  validateCreateUser: [
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
    body("role")
      .isIn(["superadmin", "schooladmin"])
      .withMessage("Invalid role"),
    body("schoolId")
      .optional()
      .isMongoId()
      .withMessage("Invalid schoolId format"),
  ],

  validateLogin: [
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],

  handleValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }
    next();
  },
});

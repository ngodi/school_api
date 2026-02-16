import { body, validationResult } from "express-validator";

export const validateCreateSchool = [
  body("name").notEmpty().withMessage("Name is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("contactEmail").isEmail().withMessage("Invalid email"),
  body("phone").notEmpty().withMessage("Phone is required"),
];

export const validateUpdateSchool = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("address").optional().notEmpty().withMessage("Address cannot be empty"),
  body("contactEmail").optional().isEmail().withMessage("Invalid email"),
  body("phone").optional().notEmpty().withMessage("Phone cannot be empty"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  next();
};

import { body, validationResult } from "express-validator";
import Classroom from "../managers/school/Classroom.model.js";

export const validateCreateClassroom = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 chars"),
  body("code")
    .isString()
    .withMessage("Code must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Code must be 2-20 chars")
    .custom(async (code, { req }) => {
      const exists = await Classroom.findOne({
        code,
        schoolId: req.body.schoolId,
      });
      if (exists)
        throw new Error("Classroom code already exists in this school");
      return true;
    }),
  body("schoolId").isMongoId().withMessage("Invalid schoolId format"),
];

export const validateUpdateClassroom = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 chars"),
  body("code")
    .optional()
    .isString()
    .withMessage("Code must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Code must be 2-20 chars")
    .custom(async (code, { req }) => {
      if (!code) return true;
      const exists = await Classroom.findOne({
        code,
        schoolId: req.body.schoolId,
        _id: { $ne: req.body.id },
      });
      if (exists)
        throw new Error("Classroom code already exists in this school");
      return true;
    }),
  body("schoolId")
    .optional()
    .isMongoId()
    .withMessage("Invalid schoolId format"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  next();
};

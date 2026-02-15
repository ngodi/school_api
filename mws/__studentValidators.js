import { body, validationResult } from "express-validator";
import Student from "../managers/students/Student.model.js";

export default () => ({
  validateCreateStudent: [
    body("firstName")
      .isString()
      .withMessage("First name must be a string")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be 2-50 chars"),
    body("lastName")
      .isString()
      .withMessage("Last name must be a string")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be 2-50 chars"),
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .custom(async (email) => {
        const exists = await Student.findOne({ email });
        if (exists) throw new Error("Email already in use");
        return true;
      }),
    body("admissionNumber")
      .isString()
      .withMessage("Admission number must be a string")
      .isLength({ min: 2, max: 30 })
      .withMessage("Admission number must be 2-30 chars")
      .custom(async (admissionNumber) => {
        const exists = await Student.findOne({ admissionNumber });
        if (exists) throw new Error("Admission number already in use");
        return true;
      }),
    body("classroomId").isMongoId().withMessage("Invalid classroomId format"),
    body("schoolId").isMongoId().withMessage("Invalid schoolId format"),
  ],

  validateUpdateStudent: [
    body("firstName")
      .optional()
      .isString()
      .withMessage("First name must be a string")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be 2-50 chars"),
    body("lastName")
      .optional()
      .isString()
      .withMessage("Last name must be a string")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be 2-50 chars"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email format")
      .custom(async (email, { req }) => {
        if (!email) return true;
        const exists = await Student.findOne({
          email,
          _id: { $ne: req.body.id },
        });
        if (exists) throw new Error("Email already in use");
        return true;
      }),
    body("admissionNumber")
      .optional()
      .isString()
      .withMessage("Admission number must be a string")
      .isLength({ min: 2, max: 30 })
      .withMessage("Admission number must be 2-30 chars")
      .custom(async (admissionNumber, { req }) => {
        if (!admissionNumber) return true;
        const exists = await Student.findOne({
          admissionNumber,
          _id: { $ne: req.body.id },
        });
        if (exists) throw new Error("Admission number already in use");
        return true;
      }),
    body("classroomId")
      .optional()
      .isMongoId()
      .withMessage("Invalid classroomId format"),
    body("schoolId")
      .optional()
      .isMongoId()
      .withMessage("Invalid schoolId format"),
  ],

  handleValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, errors: errors.array() });
    }
    next();
  },
});

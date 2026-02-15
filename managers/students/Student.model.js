import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  admissionNumber: { type: String, unique: true }, // will be auto-generated
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "transferred"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate admissionNumber before saving if not set
studentSchema.pre("save", async function (next) {
  if (!this.admissionNumber) {
    // Format: ADM + timestamp + random 3 digits
    const rand = Math.floor(100 + Math.random() * 900);
    this.admissionNumber = `ADM${Date.now()}${rand}`;
  }
  next();
});

const Student = mongoose.model("Student", studentSchema);

export default Student;

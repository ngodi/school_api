import mongoose from "mongoose";

const studentTransferSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  // Source
  fromSchoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  fromClassroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },

  // Destination
  toSchoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  toClassroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },

  // Who initiated and why
  transferredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: { type: String, default: null },

  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "completed",
  },

  transferredAt: { type: Date, default: Date.now },
});

const StudentTransfer = mongoose.model(
  "StudentTransfer",
  studentTransferSchema,
);

export default StudentTransfer;

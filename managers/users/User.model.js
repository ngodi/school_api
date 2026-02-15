import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "schooladmin"], required: true },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    default: null,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;

import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  contactEmail: { type: String, required: true },
  phone: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const School = mongoose.model("School", schoolSchema);

export default School;

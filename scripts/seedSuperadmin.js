import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../managers/user/User.model.js";
import connectWithRetry from "../loaders/MongooseLoader.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/school_management";
const SUPERADMIN_EMAIL =
  process.env.SUPERADMIN_EMAIL || "superadmin@example.com";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "supersecret";

async function seedSuperadmin() {
  await connectWithRetry();
  const existing = await User.findOne({ role: "superadmin" });
  if (existing) {
    console.log("Superadmin already exists:", existing.email);
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
  const user = new User({
    email: SUPERADMIN_EMAIL,
    passwordHash,
    role: "superadmin",
    schoolId: null,
    isActive: true,
    createdAt: new Date(),
  });
  await user.save();
  console.log("Superadmin created:", SUPERADMIN_EMAIL);
  process.exit(0);
}

seedSuperadmin().catch((err) => {
  console.error("Error seeding superadmin:", err);
  process.exit(1);
});

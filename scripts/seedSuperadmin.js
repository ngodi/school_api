import bcrypt from "bcrypt";
import User from "../managers/users/User.model.js";
import connectWithRetry from "../loaders/MongooseLoader.js";
import config from "../config.js";

const SUPERADMIN_EMAIL = config.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = config.SUPERADMIN_PASSWORD;

async function seedSuperadmin() {
  await connectWithRetry();

  const existing = await User.findOne({ role: "superadmin" });

  const passwordHash = bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  if (existing) {
    // Update existing superadmin with default password and ensure active
    existing.email = SUPERADMIN_EMAIL; // optional: reset email
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    await existing.save();
    console.log("Superadmin updated with default password:", SUPERADMIN_EMAIL);
  } else {
    // Create new superadmin
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
  }

  process.exit(0);
}

seedSuperadmin().catch((err) => {
  console.log("Error seeding superadmin:", err);
  process.exit(1);
});

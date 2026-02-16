import bcrypt from "bcrypt";
import User from "../managers/users/User.model.js";
import connectWithRetry from "../loaders/MongooseLoader.js";
import config from "../config.js";

const SUPERADMIN_EMAIL = config.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = config.SUPERADMIN_PASSWORD;
const SUPERADMIN_FIRST_NAME = config.SUPERADMIN_FIRST_NAME;
const SUPERADMIN_LAST_NAME = config.SUPERADMIN_LAST_NAME;

async function seedSuperadmin() {
  await connectWithRetry();

  const existing = await User.findOne({ role: "superadmin" });

  const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  if (existing) {
    // Update existing superadmin with default password and ensure active
    existing.email = SUPERADMIN_EMAIL; // optional: reset email
    existing.passwordHash = passwordHash;
    existing.firstName = SUPERADMIN_FIRST_NAME;
    existing.lastName = SUPERADMIN_LAST_NAME;
    existing.isActive = true;
    await existing.save();
    console.log("Superadmin updated with default password:", SUPERADMIN_EMAIL);
  } else {
    // Create new superadmin
    const user = new User({
      email: SUPERADMIN_EMAIL,
      passwordHash: passwordHash,
      role: "superadmin",
      schoolId: null,
      firstName: SUPERADMIN_FIRST_NAME,
      lastName: SUPERADMIN_LAST_NAME,
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

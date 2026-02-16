import dotenv from "dotenv";

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [],
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL,
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD,
  SUPERADMIN_FIRST_NAME: process.env.SUPERADMIN_FIRST_NAME,
  SUPERADMIN_LAST_NAME: process.env.SUPERADMIN_LAST_NAME,
  MONGO_TEST_URI:
    process.env.MONGO_TEST_URI ||
    "mongodb://localhost:27017/school_management_test",
};

export default config;

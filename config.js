import dotenv from "dotenv";

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL,
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD,
  MONGO_TEST_URI:
    process.env.MONGO_TEST_URI ||
    "mongodb://localhost:27017/school_management_test",
};

export default config;

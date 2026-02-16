// test/setup.js
import mongoose from "mongoose";
import config from "../config";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      config.MONGO_TEST_URI ||
        "mongodb://localhost:27017/school_management_test",
    );
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

import mongoose from "mongoose";
import config from "../config.js";

const MONGO_URI = config.MONGO_URI;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // ms

async function connectWithRetry(retries = MAX_RETRIES) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    if (retries > 0) {
      console.warn(
        `MongoDB connection failed. Retrying in ${RETRY_DELAY / 1000}s... (${retries} retries left)`,
      );
      setTimeout(() => connectWithRetry(retries - 1), RETRY_DELAY);
    } else {
      console.error("MongoDB connection failed after retries", err);
      process.exit(1);
    }
  }
}

export default connectWithRetry;

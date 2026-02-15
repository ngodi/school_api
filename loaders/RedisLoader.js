import { createClient } from "redis";
import config from "../config.js";

const REDIS_URL = config.REDIS_URL;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // ms

let client;

async function connectRedisWithRetry(retries = MAX_RETRIES) {
  try {
    client = createClient({ url: REDIS_URL });
    client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
    await client.connect();
    console.log("Redis connected");
    return client;
  } catch (err) {
    if (retries > 0) {
      console.warn(
        `Redis connection failed. Retrying in ${RETRY_DELAY / 1000}s... (${retries} retries left)`,
      );
      setTimeout(() => connectRedisWithRetry(retries - 1), RETRY_DELAY);
    } else {
      console.error("Redis connection failed after retries", err);
      process.exit(1);
    }
  }
}

export { connectRedisWithRetry, client };

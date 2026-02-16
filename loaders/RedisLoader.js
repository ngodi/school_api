import { createClient } from "redis";

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

let client;

async function connectRedisWithRetry({
  retries = MAX_RETRIES,
  REDIS_URL,
} = {}) {
  if (!REDIS_URL) {
    throw new Error(
      "REDIS_URL is not defined. Set it in your .env file or environment variables.",
    );
  }

  try {
    client = createClient({ url: REDIS_URL });

    client.on("error", (err) => {
      console.log("Redis Client Error", err);
    });

    await client.connect();
    console.log("Redis connected:", REDIS_URL);
    return client;
  } catch (err) {
    if (retries > 0) {
      console.warn(
        `Redis connection failed. Retrying in ${RETRY_DELAY / 1000}s... (${retries} retries left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

      return connectRedisWithRetry({ retries: retries - 1, REDIS_URL });
    } else {
      console.error("Redis connection failed after all retries:", err);
      process.exit(1);
    }
  }
}

export { connectRedisWithRetry, client };

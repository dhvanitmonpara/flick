import Redis from "ioredis";
import { env } from "@/config/env";

declare global {
	// eslint-disable-next-line no-var
	var __FLICK_REDIS_AVAILABLE__: boolean | undefined;
}

const MAX_REDIS_CONNECT_ATTEMPTS = 3;

if (globalThis.__FLICK_REDIS_AVAILABLE__ === undefined) {
	globalThis.__FLICK_REDIS_AVAILABLE__ = false;
}

export const redisClient = new Redis(env.REDIS_URL, {
	enableReadyCheck: true,
	lazyConnect: true,
	maxRetriesPerRequest: null,
	retryStrategy: () => null,
});

export const isRedisAvailable = () =>
	globalThis.__FLICK_REDIS_AVAILABLE__ === true;

const setRedisAvailable = (available: boolean) => {
	globalThis.__FLICK_REDIS_AVAILABLE__ = available;
};

export const initializeRedis = async () => {
	for (let attempt = 1; attempt <= MAX_REDIS_CONNECT_ATTEMPTS; attempt++) {
		try {
			if (redisClient.status !== "ready") {
				await redisClient.connect();
			}
			await redisClient.ping();
			setRedisAvailable(true);
			return;
		} catch {
			// Silent by design: Redis failures should never bubble up.
		}
	}

	setRedisAvailable(false);
};

redisClient.on("ready", () => {
	setRedisAvailable(true);
});

redisClient.on("end", () => {
	setRedisAvailable(false);
});

redisClient.on("error", () => {
	setRedisAvailable(false);
});

void initializeRedis();

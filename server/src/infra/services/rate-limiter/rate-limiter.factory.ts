import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import {
	isRedisAvailable,
	redisClient,
} from "@/infra/services/cache/clients/redis.client";
import type { RateLimiter } from "./rate-limiter.interface";
export class RedisLimiter implements RateLimiter {
	constructor(private rl: RateLimiterRedis) {}

	async consume(key: string) {
		if (!isRedisAvailable()) return;
		try {
			await this.rl.consume(key);
		} catch {
			// fail-open on Redis issues
		}
	}

	async get(key: string) {
		if (!isRedisAvailable()) return null;
		try {
			const info = await this.rl.get(key);
			if (!info) return null;

			return {
				remaining: info.remainingPoints,
				resetAt: Math.floor(Date.now() / 1000 + info.msBeforeNext / 1000),
			};
		} catch {
			return null;
		}
	}

	get limit() {
		return this.rl.points;
	}
}

export class MemoryLimiter implements RateLimiter {
	constructor(private rl: RateLimiterMemory) {}

	async consume(key: string) {
		await this.rl.consume(key);
	}

	async get(key: string) {
		const info = await this.rl.get(key);
		if (!info) return null;

		return {
			remaining: info.remainingPoints,
			resetAt: Math.floor(Date.now() / 1000 + info.msBeforeNext / 1000),
		};
	}

	get limit() {
		return this.rl.points;
	}
}

export const createLimiter = (
	keyPrefix: string,
	points: number,
	blockDuration = 5 * 60,
	duration = 60,
) => {
	if (!isRedisAvailable()) {
		return new MemoryLimiter(
			new RateLimiterMemory({
				keyPrefix,
				points,
				duration,
				blockDuration,
			}),
		);
	}

	return new RedisLimiter(
		new RateLimiterRedis({
			storeClient: redisClient,
			keyPrefix,
			points,
			duration,
			blockDuration,
		}),
	);
};

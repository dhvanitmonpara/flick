import type Redis from "ioredis";
import { isRedisAvailable } from "../clients/redis.client";
import type { CacheProvider } from "../cache.interface";

export class RedisCacheProvider implements CacheProvider {
	constructor(private client: Redis) {}

	async get<_T>(key: string, _options?: { bypassL1?: boolean }) {
		if (!isRedisAvailable()) return null;
		try {
			const val = await this.client.get(key);
			return val ? JSON.parse(val) : null;
		} catch {
			return null;
		}
	}

	async set<T>(key: string, value: T, ttl?: number) {
		if (!isRedisAvailable()) return false;
		const str = JSON.stringify(value);

		if (ttl <= 0) throw new Error("TTL must be positive");

		try {
			if (ttl !== undefined) {
				return (await this.client.set(key, str, "EX", ttl)) === "OK";
			} else {
				return (await this.client.set(key, str)) === "OK";
			}
		} catch {
			return false;
		}
	}

	async del(key: string) {
		if (!isRedisAvailable()) return false;
		try {
			return (await this.client.del(key)) > 0;
		} catch {
			return false;
		}
	}

	async flush() {
		if (!isRedisAvailable()) return;
		try {
			await this.client.flushall();
		} catch {
			// silent
		}
	}

	async has(key: string) {
		if (!isRedisAvailable()) return false;
		try {
			return (await this.client.exists(key)) === 1;
		} catch {
			return false;
		}
	}

	async incr(key: string): Promise<number> {
		if (!isRedisAvailable()) return 0;
		try {
			return this.client.incr(key);
		} catch {
			return 0;
		}
	}
}

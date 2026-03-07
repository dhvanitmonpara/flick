import type Redis from "ioredis";
import type { CacheProvider } from "../cache.interface";

export class RedisCacheProvider implements CacheProvider {
	constructor(private client: Redis) {}

	async get<_T>(key: string, _options?: { bypassL1?: boolean }) {
		const val = await this.client.get(key);
		return val ? JSON.parse(val) : null;
	}

	async set<T>(key: string, value: T, ttl?: number) {
		const str = JSON.stringify(value);

		if (ttl <= 0) throw new Error("TTL must be positive");

		if (ttl !== undefined) {
			return (await this.client.set(key, str, "EX", ttl)) === "OK";
		} else {
			return (await this.client.set(key, str)) === "OK";
		}
	}

	async del(key: string) {
		return (await this.client.del(key)) > 0;
	}

	async flush() {
		await this.client.flushall();
	}

	async has(key: string) {
		return (await this.client.exists(key)) === 1;
	}

	async incr(key: string): Promise<number> {
		return this.client.incr(key);
	}
}

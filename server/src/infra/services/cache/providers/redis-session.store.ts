import type Redis from "ioredis";
import { isRedisAvailable } from "../clients/redis.client";
import type { RedisSessionStoreInterface } from "../cache.interface";

export class RedisSessionStore implements RedisSessionStoreInterface {
	constructor(private client: Redis) {}

	async setKeepTtl<T>(key: string, value: T) {
		if (!isRedisAvailable()) return false;
		const str = JSON.stringify(value);

		try {
			return (await this.client.set(key, str, "KEEPTTL")) === "OK";
		} catch {
			return false;
		}
	}

	async hincrby(key: string, field: string, increment: number) {
		if (!isRedisAvailable()) return 0;
		try {
			return await this.client.hincrby(key, field, increment);
		} catch {
			return 0;
		}
	}

	async hget(key: string, field: string) {
		if (!isRedisAvailable()) return null;
		try {
			return await this.client.hget(key, field);
		} catch {
			return null;
		}
	}

	async hset(key: string, field: string, value: string) {
		if (!isRedisAvailable()) return 0;
		try {
			return await this.client.hset(key, field, value);
		} catch {
			return 0;
		}
	}
}

import NodeCache from "node-cache";
import type { CacheProvider } from "../cache.interface";

export class NodeCacheProvider implements CacheProvider {
	private cache: NodeCache;

	constructor(ttlSeconds?: number) {
		this.cache = new NodeCache({
			stdTTL: ttlSeconds,
			checkperiod: ttlSeconds ? ttlSeconds * 0.2 : 60,
		});
	}

	async get<T>(key: string) {
		return this.cache.get<T>(key) ?? null;
	}

	async set<T>(key: string, value: T, ttl?: number) {
		if (ttl <= 0) throw new Error("TTL must be positive");
		return this.cache.set(key, value, ttl);
	}

	async del(key: string) {
		return this.cache.del(key) > 0;
	}

	async flush() {
		this.cache.flushAll();
	}

	async has(key: string) {
		return this.cache.has(key);
	}

	async incr(key: string): Promise<number> {
		const _minTtl = this.cache.getTtl(key) ?? 0;
		const current = (this.cache.get<number>(key) || 0) + 1;
		// Calculate remaining TTL based on NodeCache getTtl logic (returns timestamp).
		// Note: To simplify, we'll just set it without explicit TTL if it didn't have one,
		// or use stdTTL. NodeCache lets us set it.
		this.cache.set(key, current);
		return current;
	}
}

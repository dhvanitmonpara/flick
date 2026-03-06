export interface CacheProvider {
  get<T>(key: string, options?: { bypassL1?: boolean }): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  flush(): Promise<void>;
  has(key: string): Promise<boolean>;
  incr(key: string): Promise<number>;
}

export interface RedisSessionStoreInterface {
  setKeepTtl<T>(key: string, value: T): Promise<boolean>;
  hincrby(key: string, field: string, increment: number): Promise<number>;
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, field: string, value: string): Promise<number>;
}
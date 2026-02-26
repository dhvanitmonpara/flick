import logger from "@/core/logger";
import cache from "@/infra/services/cache/index";

const coalescingMap = new Map<string, Promise<any>>();

export const cached = async <T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> => {
  const hit = await cache.get<T>(key);
  if (hit !== null) {
    logger.debug(`CACHE HIT → ${key}`);
    return hit;
  }

  if (coalescingMap.has(key)) {
    logger.debug(`CACHE COALESCE → ${key}`);
    return coalescingMap.get(key) as Promise<T>;
  }

  logger.debug(`CACHE MISS → ${key}`);

  const fetchPromise = (async () => {
    try {
      const result = await fetcher();
      if (result !== null) {
        await cache.set(key, result, ttl);
        logger.debug(`CACHE SET → ${key}`);
      }
      return result;
    } finally {
      coalescingMap.delete(key);
    }
  })();

  coalescingMap.set(key, fetchPromise);
  return fetchPromise;
};

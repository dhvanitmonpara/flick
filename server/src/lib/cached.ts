import logger from "@/core/logger";
import cache from "@/infra/services/cache/index";

export const cached = async <T>(key: string, fetcher: () => Promise<T>) => {
  const hit = await cache.get<T>(key);
  if (hit !== null) {
    logger.debug(`CACHE HIT → ${key}`);
    return hit;
  }

  logger.debug(`CACHE MISS → ${key}`);

  const result = await fetcher();

  if (result !== null) {
    await cache.set(key, result);
    logger.debug(`CACHE SET → ${key}`);
  }

  return result;
};

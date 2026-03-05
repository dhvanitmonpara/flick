import cache from "@/infra/services/cache";

const feedbackCacheKeys = {
  id: (id: string) => `feedback:id:${id}`,
  listVersionKey: () => `feedback:list:version`,
  all: async (limit: number, skip: number, type?: string, status?: string) => {
    const version = (await cache.get<number>(`feedback:list:version`, { bypassL1: true })) || 1;
    return `feedback:all:v${version}:${limit}:${skip}:${type || 'all'}:${status || 'all'}`;
  },
  count: async (type?: string, status?: string) => {
    const version = (await cache.get<number>(`feedback:list:version`, { bypassL1: true })) || 1;
    return `feedback:count:v${version}:${type || 'all'}:${status || 'all'}`;
  },
};

export default feedbackCacheKeys

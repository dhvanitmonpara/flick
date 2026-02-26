import cache from "@/infra/services/cache";

const postCacheKeys = {
  id: (id: string) => `post:id:${id}`,

  postVersionKey: (id: string) => `post:version:${id}`,
  postsListVersionKey: () => `posts:list:version`,

  idWithDetails: async (id: string, userId?: string) => {
    const version = (await cache.get<number>(`post:version:${id}`, { bypassL1: true })) || 1;
    return `post:details:v${version}:${id}:${userId || 'anonymous'}`;
  },

  many: async (
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    topic?: string,
    collegeId?: string,
    branch?: string,
    userId?: string
  ) => {
    const version = (await cache.get<number>(`posts:list:version`, { bypassL1: true })) || 1;
    return `post:many:v${version}:${page}:${limit}:${sortBy}:${sortOrder}:${topic || 'all'}:${collegeId || 'all'}:${branch || 'all'}:${userId || 'anonymous'}`;
  },

  count: (topic?: string, collegeId?: string, branch?: string) =>
    `post:count:${topic || 'all'}:${collegeId || 'all'}:${branch || 'all'}`,
};

export default postCacheKeys;
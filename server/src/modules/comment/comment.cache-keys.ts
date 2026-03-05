import cache from "@/infra/services/cache";

const commentCacheKeys = {
  id: (id: string) => `comment:id:${id}`,
  postCount: (postId: string) => `comment:count:post:${postId}`,
  postCommentsVersionKey: (postId: string) => `post:${postId}:comments:version`,
  commentRepliesVersionKey: (commentId: string) => `comment:${commentId}:replies:version`,
  postComments: async (
    postId: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    userId?: string,
    blockerAuthId?: string
  ) => {
    const versionKey = `post:${postId}:comments:version`;
    const version = (await cache.get<number>(versionKey, { bypassL1: true })) || 1;
    return `post:${postId}:comments:v${version}:page:${page}:limit:${limit}:sortBy:${sortBy}:sortOrder:${sortOrder}:user:${userId || "guest"}:blocker:${blockerAuthId || "none"}`;
  },
  commentReplies: async (
    commentId: string,
    limit: number = 10
  ) => {
    const versionKey = `comment:${commentId}:replies:version`;
    const version = (await cache.get<number>(versionKey, { bypassL1: true })) || 1;
    return `comment:${commentId}:replies:v${version}:limit:${limit}`;
  }
};

export default commentCacheKeys;
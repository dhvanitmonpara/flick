import { BookmarkAdapter } from "@/infra/db/adapters";
import { cached } from "@/lib/cached";

const keys = {
  id: (id: string) => `bookmark:id:${id}`,
  multiId: (...ids: string[]) => `bookmark:ids:${ids.join(",")}`,
};

export const findBookmark = (userId: string, postId: string) =>
  cached(keys.multiId(userId, postId), () => BookmarkAdapter.findByUserAndPostId(userId, postId))

export const findBookmarkWithPost = (userId: string, postId: string) =>
  cached(keys.multiId(userId, postId), () => BookmarkAdapter.findByUserAndPostIdWithPost(userId, postId));

export const getUserBookmarkedPosts = (userId: string) =>
  cached(keys.id(userId), () => BookmarkAdapter.findBookmarkedPostsByUserId(userId));

export const createBookmark = (userId: string, postId: string) =>
  BookmarkAdapter.create({ userId, postId });

export const deleteBookmark = (userId: string, postId: string) =>
  BookmarkAdapter.deleteBookmarkByUserAndPostId(userId, postId);
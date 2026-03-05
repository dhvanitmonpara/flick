import { HttpError } from "@/core/http";
import BookmarkRepo from "./bookmark.repo";
import logger from "@/core/logger";
import PostRepo from "../post/post.repo";
import UserRepo from "../user/user.repo";
import { assertNoBlockRelationBetweenUsers } from "../user/block.guard";
import cache from "@/infra/services/cache";
import bookmarkCacheKeys from "./bookmark.cache-keys";
import postCacheKeys from "../post/post.cache-keys";

class BookmarkService {
  async createBookmark(userId: string, postId: string) {
    logger.info("Creating bookmark", { userId, postId });

    const post = await PostRepo.CachedRead.findById(postId);
    if (!post) {
      throw HttpError.notFound("Post not found", {
        code: "POST_NOT_FOUND",
        meta: { source: "BookmarkService.createBookmark" },
      });
    }

    await assertNoBlockRelationBetweenUsers(
      userId,
      post.postedBy,
      "BookmarkService.createBookmark"
    );
    
    const existing = await BookmarkRepo.CachedRead.findBookmark(userId, postId);
    if (existing) {
      logger.warn("Bookmark already exists", { userId, postId });
      throw new HttpError({
        statusCode: 409,
        message: "Bookmark already exists",
        code: "BOOKMARK_ALREADY_EXISTS",
        meta: { source: "BookmarkService.createBookmark" },
        errors: [
          {
            field: "postId",
            message: "Bookmark already exists",
          },
        ],
      });
    }

    const newBookmark = await BookmarkRepo.Write.createBookmark({ userId, postId });
    await cache.del(bookmarkCacheKeys.multiId(userId, postId));
    await cache.del(bookmarkCacheKeys.id(userId));
    await cache.incr(postCacheKeys.postVersionKey(postId));
    await cache.incr(postCacheKeys.postsListVersionKey());
    logger.info("Bookmark created successfully", { userId, postId, bookmarkId: newBookmark.id });
    return newBookmark;
  }

  async getUserBookmarkedPosts(userId: string) {
    logger.info("Fetching user bookmarked posts", { userId });
    
    const bookmarks = await BookmarkRepo.CachedRead.getUserBookmarkedPosts(userId);
    const user = await UserRepo.Read.findById(userId, {});
    if (!user) {
      throw HttpError.notFound("User not found", {
        code: "USER_NOT_FOUND",
        meta: { source: "BookmarkService.getUserBookmarkedPosts" },
      });
    }

    const blockedUserIds = await UserRepo.Blocks.getBlockedUserIdsInEitherDirection(user.authId);
    const blockedUserIdSet = new Set(blockedUserIds);

    const filteredBookmarks = bookmarks.filter((bookmark) => {
      const authorId = bookmark.postedBy?.id;
      return !authorId || !blockedUserIdSet.has(authorId);
    });

    logger.info("Retrieved user bookmarked posts", {
      userId,
      count: filteredBookmarks.length,
      filteredOut: bookmarks.length - filteredBookmarks.length,
    });
    return filteredBookmarks;
  }

  async deleteBookmark(userId: string, postId: string) {
    logger.info("Deleting bookmark", { userId, postId });
    
    const deleted = await BookmarkRepo.Write.deleteBookmark(userId, postId);
    if (!deleted) {
      logger.warn("Bookmark not found for deletion", { userId, postId });
      throw HttpError.notFound("Bookmark not found for this user",
        {
          code: "BOOKMARK_NOT_FOUND",
          meta: { source: "BookmarkService.deleteBookmark" },
          errors: [{ field: "postId", message: "Bookmark not found for this user" }],
        });
    }

    await cache.del(bookmarkCacheKeys.multiId(userId, postId));
    await cache.del(bookmarkCacheKeys.id(userId));
    await cache.incr(postCacheKeys.postVersionKey(postId));
    await cache.incr(postCacheKeys.postsListVersionKey());

    logger.info("Bookmark deleted successfully", { userId, postId });
    return deleted;
  }

  async getBookmark(userId: string, postId: string) {
    logger.info("Fetching bookmark", { userId, postId });
    
    const bookmark = await BookmarkRepo.CachedRead.findBookmarkWithPost(userId, postId);
    if (!bookmark) {
      logger.warn("Bookmark not found", { userId, postId });
      throw HttpError.notFound("Bookmark not found for this user",
        {
          code: "BOOKMARK_NOT_FOUND",
          meta: { source: "BookmarkService.getBookmark" },
          errors: [{ field: "postId", message: "Bookmark not found for this user" }],
        });
    }

    const post = await PostRepo.CachedRead.findById(postId);
    if (!post) {
      throw HttpError.notFound("Post not found", {
        code: "POST_NOT_FOUND",
        meta: { source: "BookmarkService.getBookmark" },
      });
    }

    await assertNoBlockRelationBetweenUsers(userId, post.postedBy, "BookmarkService.getBookmark");
    
    logger.info("Bookmark retrieved successfully", { userId, postId, bookmarkId: bookmark.id });
    return bookmark;
  }
}

export default new BookmarkService;

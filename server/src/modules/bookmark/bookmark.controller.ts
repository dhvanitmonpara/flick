import ApiResponse from "@/core/http/ApiResponse.js";
import { AsyncHandler } from "@/core/http/asyncHandler.js";
import bookmarkService from "./bookmark.service";
import { Request } from "express";

class BookmarkController {

  @AsyncHandler()
  async createBookmark(req: Request) {
    const { postId } = req.body;
    const userId = req.user.id;

    const newBookmark = await bookmarkService.createBookmark(userId, postId);

    return ApiResponse.created({
      bookmark: newBookmark,
    });
  };

  @AsyncHandler()
  async getUserBookmarkedPosts(req: Request) {
    const userId = req.user.id;

    const posts = await bookmarkService.getUserBookmarkedPosts(userId);

    return ApiResponse.ok({
      posts,
      count: posts.length,
    });
  };

  @AsyncHandler()
  async deleteBookmark(req: Request) {
    const { postId } = req.params;
    const userId = req.user.id;

    await bookmarkService.deleteBookmark(userId, postId);
    return ApiResponse.ok({ message: "Bookmark deleted" });
  };

  @AsyncHandler()
  async getBookmark(req: Request) {
    const { postId } = req.params;
    const userId = req.user.id;

    const bookmark = await bookmarkService.getBookmark(userId, postId);
    return ApiResponse.ok({ bookmark });
  };

}

export default new BookmarkController();
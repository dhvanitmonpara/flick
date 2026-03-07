import type { Request } from "express";
import { Controller, HttpResponse } from "@/core/http";
import * as bookmarkSchemas from "./bookmark.schema";
import bookmarkService from "./bookmark.service";

@Controller()
class BookmarkController {
	static async createBookmark(req: Request) {
		const { postId } = bookmarkSchemas.PostIdSchema.parse(req.body);
		const userId = req.user.id;

		const newBookmark = await bookmarkService.createBookmark(userId, postId);

		return HttpResponse.created("Bookmark created successfully", {
			bookmark: newBookmark,
		});
	}

	static async getUserBookmarkedPosts(req: Request) {
		const userId = req.user.id;

		const posts = await bookmarkService.getUserBookmarkedPosts(userId);

		return HttpResponse.ok("User bookmarked posts retrieved successfully", {
			posts,
			count: posts.length,
		});
	}

	static async deleteBookmark(req: Request) {
		const { postId } = bookmarkSchemas.PostIdSchema.parse(req.params);
		const userId = req.user.id;

		await bookmarkService.deleteBookmark(userId, postId);
		return HttpResponse.ok("Bookmark deleted successfully");
	}

	static async getBookmark(req: Request) {
		const { postId } = bookmarkSchemas.PostIdSchema.parse(req.params);
		const userId = req.user.id;

		const bookmark = await bookmarkService.getBookmark(userId, postId);
		return HttpResponse.ok("Bookmark retrieved successfully", { bookmark });
	}
}

export default BookmarkController;

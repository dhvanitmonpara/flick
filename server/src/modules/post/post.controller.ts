import type { Request } from "express";
import { Controller, HttpError, HttpResponse } from "@/core/http";
import * as postSchemas from "./post.schema";
import postService from "./post.service";

@Controller()
class PostController {
	static async createPost(req: Request) {
		const { title, content, topic, isPrivate } =
			postSchemas.CreatePostSchema.parse(req.body);
		const userId = req.user.id;

		const newPost = await postService.createPost({
			title,
			content,
			topic,
			isPrivate,
			postedBy: userId,
		});

		return HttpResponse.created("Post created successfully", { post: newPost });
	}

	static async getPosts(req: Request) {
		const { page, limit, sortBy, sortOrder, topic, collegeId, branch } =
			postSchemas.GetPostsQuerySchema.parse(req.query);

		const userId = req.user?.id;
		const userCollegeId = req.user?.collegeId;
		const blockerAuthId = req.user?.authId;

		const result = await postService.getPosts({
			page,
			limit,
			sortBy,
			sortOrder,
			topic,
			collegeId,
			branch,
			userId,
			userCollegeId,
			blockerAuthId,
		});

		return HttpResponse.ok("Posts retrieved successfully", result);
	}

	static async getPostById(req: Request) {
		const { id } = postSchemas.PostIdSchema.parse(req.params);
		const user = req.user;

		const post = await postService.getPostById(id, user);

		return HttpResponse.ok("Post retrieved successfully", { post });
	}

	static async updatePost(req: Request) {
		const { id } = postSchemas.PostIdSchema.parse(req.params);
		const { title, content, topic, isPrivate } =
			postSchemas.UpdatePostSchema.parse(req.body);
		const userId = req.user.id;

		const updatedPost = await postService.updatePost(id, userId, {
			title,
			content,
			topic,
			isPrivate,
		});

		return HttpResponse.ok("Post updated successfully", { post: updatedPost });
	}

	static async deletePost(req: Request) {
		const { id } = postSchemas.PostIdSchema.parse(req.params);
		const userId = req.user.id;

		await postService.deletePost(id, userId);

		return HttpResponse.ok("Post deleted successfully");
	}

	static async incrementPostViews(req: Request) {
		const { id } = postSchemas.PostIdSchema.parse(req.params);

		await postService.incrementPostViews(id);

		return HttpResponse.ok("Post view incremented");
	}

	static async getPostsByCollege(req: Request) {
		const { collegeId } = postSchemas.CollegeIdSchema.parse(req.params);
		const { page, limit, sortBy, sortOrder } =
			postSchemas.GetPostsQuerySchema.parse(req.query);

		const userId = req.user?.id;
		const userCollegeId = req.user?.collegeId;
		const blockerAuthId = req.user?.authId;

		const result = await postService.getPostsByCollege(collegeId, {
			page,
			limit,
			sortBy,
			sortOrder,
			userId,
			userCollegeId,
			blockerAuthId,
		});

		return HttpResponse.ok("Posts retrieved successfully by college", result);
	}

	static async getPostsByBranch(req: Request) {
		const { branch } = postSchemas.BranchSchema.parse(req.params);
		const { page, limit, sortBy, sortOrder } =
			postSchemas.GetPostsQuerySchema.parse(req.query);

		const userId = req.user?.id;
		const userCollegeId = req.user?.collegeId;
		const blockerAuthId = req.user?.authId;

		const result = await postService.getPostsByBranch(branch, {
			page,
			limit,
			sortBy,
			sortOrder,
			userId,
			userCollegeId,
			blockerAuthId,
		});

		return HttpResponse.ok("Posts retrieved successfully by branch", result);
	}

	static async getPostsByUser(req: Request) {
		const userId = req.params.userId;
		if (!userId) {
			throw HttpError.badRequest("User ID is required");
		}

		const { page, limit, sortBy, sortOrder } =
			postSchemas.GetPostsQuerySchema.parse(req.query);

		const currentUserId = req.user?.id;
		const userCollegeId = req.user?.collegeId;
		const blockerAuthId = req.user?.authId;

		const result = await postService.getPostsByAuthor(userId, {
			page,
			limit,
			sortBy,
			sortOrder,
			userId: currentUserId,
			userCollegeId,
			blockerAuthId,
		});

		return HttpResponse.ok("Posts retrieved successfully by user", result);
	}
}

export default PostController;

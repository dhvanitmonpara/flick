import { Request } from "express";
import { AuthenticatedRequest } from "@/core/middlewares/auth/auth.middleware.js";
import ApiResponse from "@/core/http/ApiResponse.js";
import { AsyncHandler } from "@/core/http/asyncHandler.js";
import postService from "./post.service";

class PostController {

  @AsyncHandler()
  async createPost(req: AuthenticatedRequest) {
    const { title, content, topic } = req.body;
    const userId = req.user.id;

    const newPost = await postService.createPost({
      title,
      content,
      topic,
      postedBy: userId,
    });

    return ApiResponse.created({
      message: "Post created successfully",
      post: newPost,
    });
  }

  @AsyncHandler()
  async getPosts(req: Request) {
    const { page, limit, sortBy, sortOrder, topic, collegeId, branch } = req.query as {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "views";
      sortOrder?: "asc" | "desc";
      topic?: string;
      collegeId?: string;
      branch?: string;
    };

    const userId = (req as AuthenticatedRequest).user?.id;

    const result = await postService.getPosts({
      page,
      limit,
      sortBy,
      sortOrder,
      topic,
      collegeId,
      branch,
      userId,
    });

    return ApiResponse.ok(result);
  }

  @AsyncHandler()
  async getPostById(req: Request) {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;

    const post = await postService.getPostById(id, userId);

    return ApiResponse.ok({
      post,
    });
  }

  @AsyncHandler()
  async updatePost(req: AuthenticatedRequest) {
    const { id } = req.params;
    const { title, content, topic } = req.body;
    const userId = req.user.id;

    const updatedPost = await postService.updatePost(id, userId, {
      title,
      content,
      topic,
    });

    return ApiResponse.ok({
      message: "Post updated successfully",
      post: updatedPost,
    });
  }

  @AsyncHandler()
  async deletePost(req: AuthenticatedRequest) {
    const { id } = req.params;
    const userId = req.user.id;

    await postService.deletePost(id, userId);

    return ApiResponse.ok({
      message: "Post deleted successfully",
    });
  }

  @AsyncHandler()
  async incrementPostViews(req: Request) {
    const { id } = req.params;

    await postService.incrementPostViews(id);

    return ApiResponse.ok({
      message: "Post view incremented",
    });
  }

  @AsyncHandler()
  async getPostsByCollege(req: Request) {
    const { collegeId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query as {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "views";
      sortOrder?: "asc" | "desc";
    };

    const userId = (req as AuthenticatedRequest).user?.id;

    const result = await postService.getPostsByCollege(collegeId, {
      page,
      limit,
      sortBy,
      sortOrder,
      userId,
    });

    return ApiResponse.ok(result);
  }

  @AsyncHandler()
  async getPostsByBranch(req: Request) {
    const { branch } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query as {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "views";
      sortOrder?: "asc" | "desc";
    };

    const userId = (req as AuthenticatedRequest).user?.id;

    const result = await postService.getPostsByBranch(branch, {
      page,
      limit,
      sortBy,
      sortOrder,
      userId,
    });

    return ApiResponse.ok(result);
  }
}

export default new PostController();
import { HttpError } from "@/core/http";
import PostRepo from "./post.repo";
import recordAudit from "@/lib/record-audit";
import { observabilityContext } from "../audit/audit-context";
import logger from "@/core/logger";

class PostService {
  async createPost(postData: {
    title: string;
    content: string;
    topic: string;
    isPrivate?: boolean;
    postedBy: string;
  }) {
    logger.info("Creating post", {
      topic: postData.topic,
      postedBy: postData.postedBy,
      title: postData.title
    });

    const newPost = await PostRepo.Write.create({
      title: postData.title.trim(),
      content: postData.content.trim(),
      topic: postData.topic as any,
      isPrivate: postData.isPrivate ?? false,
      postedBy: postData.postedBy,
    });

    logger.info("Post created successfully", {
      postId: newPost.id,
      topic: newPost.topic,
      postedBy: newPost.postedBy
    });

    await recordAudit({
      action: "user:created:post",
      entityType: "post",
      entityId: newPost.id,
      after: { id: newPost.id },
    });

    const postWithDetails = await PostRepo.Read.findByIdWithDetails(newPost.id, postData.postedBy);

    return postWithDetails || newPost;
  }

  async getPostById(id: string, user?: { id: string; collegeId: string }) {
    logger.info("Fetching post by ID", { postId: id, userId: user?.id });

    const post = await PostRepo.CachedRead.findByIdWithDetails(id, user?.id);
    if (!post) {
      logger.warn("Post not found", { postId: id });
      throw HttpError.notFound("Post not found", {
        code: "POST_NOT_FOUND",
        meta: { source: "PostService.getPostById" },
        errors: [{ field: "id", message: "Post not found" }],
      });
    }

    if (post.isPrivate) {
      if (!user) {
        throw HttpError.unauthorized("Please log in to view this college-only post.", {
          code: "POST_VIEW_UNAUTHORIZED",
          meta: { source: "PostService.getPostById" },
        });
      }
      if (user.collegeId !== post.postedBy?.college?.id) {
        throw HttpError.forbidden("You do not have access to view this college-only post.", {
          code: "POST_VIEW_FORBIDDEN",
          meta: { source: "PostService.getPostById" },
        });
      }
    }

    logger.info("Post retrieved successfully", { postId: id, title: post.title });
    return post;
  }

  async getPosts(options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "views";
    sortOrder?: "asc" | "desc";
    topic?: string;
    collegeId?: string;
    branch?: string;
    userId?: string;
    userCollegeId?: string;
  }) {
    const postsResult = await PostRepo.CachedRead.findMany(options);
    const posts = Array.isArray(postsResult) ? postsResult : [];
    const totalCount = await PostRepo.CachedRead.countAll({
      topic: options?.topic,
      collegeId: options?.collegeId,
      branch: options?.branch,
      userCollegeId: options?.userCollegeId,
    });

    const page = options?.page || 1;
    const limit = options?.limit || 10;

    const result = {
      posts,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    };

    logger.info("Retrieved posts", {
      count: posts.length,
      totalCount,
      page,
      limit,
      topic: options?.topic,
      collegeId: options?.collegeId
    });

    return result;
  }

  async updatePost(
    id: string,
    userId: string,
    updates: {
      title?: string;
      content?: string;
      topic?: string;
      isPrivate?: boolean;
    }
  ) {
    logger.info("Updating post", { postId: id, userId, updates: Object.keys(updates) });

    // First check if post exists and get author info
    const existingPost = await PostRepo.CachedRead.findById(id);
    if (!existingPost) {
      logger.warn("Post not found for update", { postId: id, userId });
      throw HttpError.notFound("Post not found", {
        code: "POST_NOT_FOUND",
        meta: { source: "PostService.updatePost" },
        errors: [{ field: "id", message: "Post not found" }],
      });
    }

    // Check if user is the author
    if (existingPost.postedBy !== userId) {
      logger.warn("Unauthorized post update attempt", { postId: id, userId, authorId: existingPost.postedBy });
      throw HttpError.forbidden("You are not authorized to update this post", {
        code: "POST_UPDATE_FORBIDDEN",
        meta: { source: "PostService.updatePost" },
        errors: [{ field: "id", message: "You are not authorized to update this post" }],
      });
    }

    const cleanUpdates: any = {};
    const beforeUpdates: any = {};
    if (updates.title) {
      cleanUpdates.title = updates.title.trim();
      beforeUpdates.title = existingPost.title
    }
    if (updates.content) {
      cleanUpdates.content = updates.content.trim();
      beforeUpdates.content = existingPost.content
    }
    if (updates.topic) {
      cleanUpdates.topic = updates.topic;
      beforeUpdates.topic = existingPost.topic
    }
    if (updates.isPrivate !== undefined) {
      cleanUpdates.isPrivate = updates.isPrivate;
      beforeUpdates.isPrivate = existingPost.isPrivate;
    }

    const updatedPost = await PostRepo.Write.updateById(id, cleanUpdates);

    logger.info("Post updated successfully", { postId: id, userId, updatedFields: Object.keys(cleanUpdates) });

    await recordAudit({
      action: "user:updated:post",
      entityType: "post",
      entityId: updatedPost.id,
      before: beforeUpdates,
      after: { ...cleanUpdates },
    });

    return updatedPost;
  }

  async deletePost(id: string, userId: string) {
    // First check if post exists and get author info
    const existingPost = await PostRepo.CachedRead.findById(id);
    if (!existingPost) {
      throw HttpError.notFound("Post not found", {
        code: "POST_NOT_FOUND",
        meta: { source: "PostService.deletePost" },
        errors: [{ field: "id", message: "Post not found" }],
      });
    }

    // Check if user is the author
    if (existingPost.postedBy !== userId) {
      throw HttpError.forbidden("You are not authorized to delete this post", {
        code: "POST_DELETE_FORBIDDEN",
        meta: { source: "PostService.deletePost" },
        errors: [{ field: "id", message: "You are not authorized to delete this post" }],
      });
    }

    const deletedPost = await PostRepo.Write.deleteById(id);

    await recordAudit({
      action: "user:deleted:post",
      entityType: "post",
      entityId: deletedPost.id,
      before: { id: deletedPost.id },
    });

    return deletedPost;
  }

  async incrementPostViews(id: string) {
    // Note: In a real implementation, you might want to add IP-based view tracking
    // to prevent multiple views from the same user/IP within a time window
    const ctx = observabilityContext.getStore()

    const updatedPost = await PostRepo.Write.incrementViews(id);
    return updatedPost;
  }

  async getPostsByCollege(collegeId: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "views";
    sortOrder?: "asc" | "desc";
    userId?: string;
    userCollegeId?: string;
  }) {
    return this.getPosts({
      ...options,
      collegeId,
    });
  }

  async getPostsByBranch(branch: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "views";
    sortOrder?: "asc" | "desc";
    userId?: string;
    userCollegeId?: string;
  }) {
    return this.getPosts({
      ...options,
      branch,
    });
  }
}

export default new PostService();

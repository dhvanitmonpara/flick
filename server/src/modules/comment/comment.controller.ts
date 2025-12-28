import { Request } from "express";
import ApiResponse from "@/core/http/ApiResponse.js";
import { AsyncHandler } from "@/core/http/asyncHandler.js";
import commentService from "./comment.service";

class CommentController {

  @AsyncHandler()
  async getCommentsByPostId(req: Request) {
    const { postId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query as {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt";
      sortOrder?: "asc" | "desc";
    };

    const userId = req.user?.id;

    const result = await commentService.getCommentsByPostId(postId, {
      page,
      limit,
      sortBy,
      sortOrder,
      userId,
    });

    return ApiResponse.ok(result);
  }

  @AsyncHandler()
  async createComment(req: Request) {
    const { content, parentCommentId } = req.body;
    const { postId } = req.params;
    const userId = req.user.id;

    const newComment = await commentService.createComment({
      content,
      postId,
      commentedBy: userId,
      parentCommentId,
    });

    return ApiResponse.created({
      message: "Comment created successfully",
      comment: newComment,
    });
  }

  @AsyncHandler()
  async updateComment(req: Request) {
    const { content } = req.body;
    const { commentId } = req.params;
    const userId = req.user.id;

    const updatedComment = await commentService.updateComment(commentId, userId, content);

    return ApiResponse.ok({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  }

  @AsyncHandler()
  async deleteComment(req: Request) {
    const { commentId } = req.params;
    const userId = req.user.id;

    await commentService.deleteComment(commentId, userId);

    return ApiResponse.ok({
      message: "Comment deleted successfully",
    });
  }

  @AsyncHandler()
  async getCommentById(req: Request) {
    const { commentId } = req.params;

    const comment = await commentService.getCommentById(commentId);

    return ApiResponse.ok({
      comment,
    });
  }
}

export default new CommentController();
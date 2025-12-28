import { ApiError } from "@/core/http";
import * as commentRepo from "./comment.repo";

class CommentService {
  async getCommentsByPostId(
    postId: string,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt";
      sortOrder?: "asc" | "desc";
      userId?: string;
    }
  ) {
    const comments = await commentRepo.findByPostId(postId, options);
    const totalComments = await commentRepo.countByPostId(postId);

    const page = options?.page || 1;
    const limit = options?.limit || 10;

    return {
      comments,
      meta: {
        total: totalComments,
        page,
        limit,
        totalPages: Math.ceil(totalComments / limit),
      },
    };
  }

  async createComment(commentData: {
    content: string;
    postId: string;
    commentedBy: string;
    parentCommentId?: string;
  }) {
    const newComment = await commentRepo.create({
      content: commentData.content.trim(),
      postId: commentData.postId,
      commentedBy: commentData.commentedBy,
      parentCommentId: commentData.parentCommentId || null,
    });

    return newComment;
  }

  async updateComment(commentId: string, userId: string, content: string) {
    // First check if comment exists and get author info
    const existingComment = await commentRepo.findByIdWithAuthor(commentId);
    if (!existingComment) {
      throw new ApiError({
        statusCode: 404,
        message: "Comment not found",
        code: "COMMENT_NOT_FOUND",
        data: { service: "CommentService.updateComment" },
        errors: [{ field: "commentId", message: "Comment not found" }],
      });
    }

    // Check if user is the author
    if (existingComment.commentedBy !== userId) {
      throw new ApiError({
        statusCode: 403,
        message: "You are not authorized to update this comment",
        code: "COMMENT_UPDATE_FORBIDDEN",
        data: { service: "CommentService.updateComment" },
        errors: [{ field: "commentId", message: "You are not authorized to update this comment" }],
      });
    }

    const updatedComment = await commentRepo.updateById(commentId, {
      content: content.trim(),
    });

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string) {
    // First check if comment exists and get author info
    const existingComment = await commentRepo.findByIdWithAuthor(commentId);
    if (!existingComment) {
      throw new ApiError({
        statusCode: 404,
        message: "Comment not found",
        code: "COMMENT_NOT_FOUND",
        data: { service: "CommentService.deleteComment" },
        errors: [{ field: "commentId", message: "Comment not found" }],
      });
    }

    // Check if user is the author
    if (existingComment.commentedBy !== userId) {
      throw new ApiError({
        statusCode: 403,
        message: "You are not authorized to delete this comment",
        code: "COMMENT_DELETE_FORBIDDEN",
        data: { service: "CommentService.deleteComment" },
        errors: [{ field: "commentId", message: "You are not authorized to delete this comment" }],
      });
    }

    const deletedComment = await commentRepo.deleteById(commentId);
    return deletedComment;
  }

  async getCommentById(commentId: string) {
    const comment = await commentRepo.findById(commentId);
    if (!comment) {
      throw new ApiError({
        statusCode: 404,
        message: "Comment not found",
        code: "COMMENT_NOT_FOUND",
        data: { service: "CommentService.getCommentById" },
        errors: [{ field: "commentId", message: "Comment not found" }],
      });
    }
    return comment;
  }
}

export default new CommentService();
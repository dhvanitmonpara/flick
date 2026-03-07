import { HttpError } from "@/core/http";
import logger from "@/core/logger";
import cache from "@/infra/services/cache";
import { moderationService } from "@/infra/services/moderator";
import recordAudit from "@/lib/record-audit";
import postCacheKeys from "../post/post.cache-keys";
import PostRepo from "../post/post.repo";
import { assertNoBlockRelationBetweenUsers } from "../user/block.guard";
import commentCacheKeys from "./comment.cache-keys";
import CommentRepo from "./comment.repo";

class CommentService {
	async getCommentsByPostId(
		postId: string,
		options?: {
			page?: number;
			limit?: number;
			sortBy?: "createdAt" | "updatedAt";
			sortOrder?: "asc" | "desc";
			blockerAuthId?: string;
			requesterUserId?: string;
		},
	) {
		logger.info("Fetching comments by post ID", { postId, options });

		const post = await PostRepo.CachedRead.findById(postId);
		if (!post || post.isBanned || post.isShadowBanned) {
			throw HttpError.notFound("Post not found", {
				code: "POST_NOT_FOUND",
				meta: { source: "CommentService.getCommentsByPostId" },
			});
		}

		if (options?.requesterUserId) {
			await assertNoBlockRelationBetweenUsers(
				options.requesterUserId,
				post.postedBy,
				"CommentService.getCommentsByPostId",
			);
		}

		const comments = await CommentRepo.CachedRead.findByPostId(postId, options);
		const totalComments = await CommentRepo.CachedRead.countByPostId(postId);

		const page = options?.page || 1;
		const limit = options?.limit || 10;

		const result = {
			comments,
			meta: {
				total: totalComments,
				page,
				limit,
				totalPages: Math.ceil(totalComments / limit),
			},
		};

		logger.info("Retrieved comments by post ID", {
			postId,
			commentsCount: comments.length,
			totalComments,
			page,
			limit,
		});

		return result;
	}

	async createComment(commentData: {
		content: string;
		postId: string;
		commentedBy: string;
		parentCommentId?: string;
	}) {
		logger.info("Creating comment", {
			postId: commentData.postId,
			commentedBy: commentData.commentedBy,
			parentCommentId: commentData.parentCommentId,
		});

		const post = await PostRepo.CachedRead.findById(commentData.postId);
		if (!post) {
			throw HttpError.notFound("Post not found", {
				code: "POST_NOT_FOUND",
				meta: { source: "CommentService.createComment" },
			});
		}
		if (post.isBanned || post.isShadowBanned) {
			throw HttpError.notFound("Post not found", {
				code: "POST_NOT_FOUND",
				meta: { source: "CommentService.createComment" },
			});
		}

		await assertNoBlockRelationBetweenUsers(
			commentData.commentedBy,
			post.postedBy,
			"CommentService.createComment",
		);

		if (commentData.parentCommentId) {
			const parentComment = await CommentRepo.CachedRead.findById(
				commentData.parentCommentId,
			);
			if (!parentComment) {
				throw HttpError.notFound("Parent comment not found", {
					code: "COMMENT_NOT_FOUND",
					meta: { source: "CommentService.createComment" },
				});
			}
			if (parentComment.isBanned) {
				throw HttpError.notFound("Parent comment not found", {
					code: "COMMENT_NOT_FOUND",
					meta: { source: "CommentService.createComment" },
				});
			}

			if (parentComment.postId !== commentData.postId) {
				throw HttpError.badRequest(
					"Parent comment does not belong to this post",
					{
						code: "INVALID_PARENT_COMMENT",
						meta: { source: "CommentService.createComment" },
					},
				);
			}

			await assertNoBlockRelationBetweenUsers(
				commentData.commentedBy,
				parentComment.commentedBy,
				"CommentService.createComment",
			);
		}

		const moderationResult = await moderationService.moderateText({
			text: commentData.content,
			runValidator: true,
		});
		if (!moderationResult.allowed) {
			const violation = moderationResult.violation;
			if (!violation) {
				throw HttpError.badRequest("Content violates moderation policy", {
					code: "CONTENT_POLICY_VIOLATION",
					meta: { source: "CommentService.createComment" },
				});
			}
			throw HttpError.badRequest("Content violates moderation policy", {
				code: violation.code,
				meta: {
					source: "CommentService.createComment",
					matches: violation.matches,
					reasons: violation.reasons,
					moderationSource: violation.source,
				},
				errors: violation.reasons.map((reason) => ({
					field: "content",
					message: reason,
				})),
			});
		}

		const newComment = await CommentRepo.Write.create({
			content: commentData.content.trim(),
			postId: commentData.postId,
			commentedBy: commentData.commentedBy,
			parentCommentId: commentData.parentCommentId || null,
		});

		logger.info("Comment created successfully", {
			commentId: newComment.id,
			postId: newComment.postId,
			commentedBy: newComment.commentedBy,
		});

		await recordAudit({
			action: "user:created:comment",
			entityType: "comment",
			entityId: newComment.id,
			after: { id: newComment.id },
			metadata: {
				postId: newComment.postId,
				parentCommentId: newComment.parentCommentId,
			},
		});

		const commentWithAuthor = await CommentRepo.Read.findByIdWithAuthor(
			newComment.id,
		);

		if (newComment.parentCommentId) {
			await cache.incr(
				commentCacheKeys.commentRepliesVersionKey(newComment.parentCommentId),
			);
		} else {
			await cache.incr(
				commentCacheKeys.postCommentsVersionKey(newComment.postId),
			);
		}
		await cache.incr(postCacheKeys.postVersionKey(newComment.postId));
		await cache.incr(postCacheKeys.postsListVersionKey());

		return commentWithAuthor || newComment;
	}

	async updateComment(commentId: string, userId: string, content: string) {
		logger.info("Updating comment", { commentId, userId });

		const moderationResult = await moderationService.moderateText({
			text: content,
			runValidator: true,
		});
		if (!moderationResult.allowed) {
			const violation = moderationResult.violation;
			if (!violation) {
				throw HttpError.badRequest("Content violates moderation policy", {
					code: "CONTENT_POLICY_VIOLATION",
					meta: { source: "CommentService.updateComment" },
				});
			}
			throw HttpError.badRequest("Content violates moderation policy", {
				code: violation.code,
				meta: {
					source: "CommentService.updateComment",
					matches: violation.matches,
					reasons: violation.reasons,
					moderationSource: violation.source,
				},
				errors: violation.reasons.map((reason) => ({
					field: "content",
					message: reason,
				})),
			});
		}

		// First check if comment exists and get author info
		const existingComment = await CommentRepo.CachedRead.findById(commentId);
		if (!existingComment) {
			logger.warn("Comment not found for update", { commentId, userId });
			throw HttpError.notFound("Comment not found", {
				code: "COMMENT_NOT_FOUND",
				meta: { source: "CommentService.updateComment" },
				errors: [{ field: "commentId", message: "Comment not found" }],
			});
		}

		// Check if user is the author
		if (existingComment.commentedBy !== userId) {
			logger.warn("Unauthorized comment update attempt", {
				commentId,
				userId,
				authorId: existingComment.commentedBy,
			});
			throw HttpError.forbidden(
				"You are not authorized to update this comment",
				{
					code: "COMMENT_UPDATE_FORBIDDEN",
					meta: { source: "CommentService.updateComment" },
					errors: [
						{
							field: "commentId",
							message: "You are not authorized to update this comment",
						},
					],
				},
			);
		}

		const updatedComment = await CommentRepo.Write.updateById(commentId, {
			content: content.trim(),
		});

		logger.info("Comment updated successfully", { commentId, userId });

		await recordAudit({
			action: "user:updated:comment",
			entityType: "comment",
			entityId: updatedComment.id,
			before: { content: existingComment.content },
			after: { content },
		});

		if (existingComment.parentCommentId) {
			await cache.incr(
				commentCacheKeys.commentRepliesVersionKey(
					existingComment.parentCommentId,
				),
			);
		} else {
			await cache.incr(
				commentCacheKeys.postCommentsVersionKey(existingComment.postId),
			);
		}
		await cache.incr(postCacheKeys.postVersionKey(existingComment.postId));
		await cache.incr(postCacheKeys.postsListVersionKey());

		return updatedComment;
	}

	async deleteComment(commentId: string, userId: string) {
		// First check if comment exists and get author info
		const existingComment = await CommentRepo.CachedRead.findById(commentId);
		if (!existingComment) {
			throw HttpError.notFound("Comment not found", {
				code: "COMMENT_NOT_FOUND",
				meta: { source: "CommentService.deleteComment" },
				errors: [{ field: "commentId", message: "Comment not found" }],
			});
		}

		// Check if user is the author
		if (existingComment.commentedBy !== userId) {
			throw HttpError.forbidden(
				"You are not authorized to delete this comment",
				{
					code: "COMMENT_DELETE_FORBIDDEN",
					meta: { source: "CommentService.deleteComment" },
					errors: [
						{
							field: "commentId",
							message: "You are not authorized to delete this comment",
						},
					],
				},
			);
		}

		const deletedComment = await CommentRepo.Write.deleteById(commentId);

		await recordAudit({
			action: "user:deleted:comment",
			entityType: "comment",
			entityId: deletedComment.id,
			before: { id: deletedComment.id },
			metadata: { userId },
		});

		if (deletedComment.parentCommentId) {
			await cache.incr(
				commentCacheKeys.commentRepliesVersionKey(
					deletedComment.parentCommentId,
				),
			);
		} else {
			await cache.incr(
				commentCacheKeys.postCommentsVersionKey(deletedComment.postId),
			);
		}
		await cache.incr(postCacheKeys.postVersionKey(deletedComment.postId));
		await cache.incr(postCacheKeys.postsListVersionKey());

		return deletedComment;
	}

	async getCommentById(commentId: string, requesterUserId?: string) {
		const comment = await CommentRepo.CachedRead.findById(commentId);
		if (!comment || comment.isBanned) {
			throw HttpError.notFound("Comment not found", {
				code: "COMMENT_NOT_FOUND",
				meta: { source: "CommentService.getCommentById" },
				errors: [{ field: "commentId", message: "Comment not found" }],
			});
		}

		if (requesterUserId) {
			await assertNoBlockRelationBetweenUsers(
				requesterUserId,
				comment.commentedBy,
				"CommentService.getCommentById",
			);
		}

		return comment;
	}
}

export default new CommentService();

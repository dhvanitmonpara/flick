import { z } from "zod";

export const CreateCommentSchema = z.object({
	content: z
		.string()
		.min(1, "Comment content is required")
		.max(1000, "Comment content too long"),
	parentCommentId: z.uuid("Invalid parent comment ID").nullable().optional(),
});

export const UpdateCommentSchema = z.object({
	content: z
		.string()
		.min(1, "Comment content is required")
		.max(1000, "Comment content too long"),
});

export const CommentIdSchema = z.object({
	commentId: z.uuid("Invalid comment ID format"),
});

export const PostIdSchema = z.object({
	postId: z.uuid("Invalid post ID format"),
});

export const GetCommentsQuerySchema = z.object({
	page: z
		.string()
		.transform((val) => parseInt(val, 10) || 1)
		.optional(),
	limit: z
		.string()
		.transform((val) => parseInt(val, 10) || 10)
		.optional(),
	sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
});

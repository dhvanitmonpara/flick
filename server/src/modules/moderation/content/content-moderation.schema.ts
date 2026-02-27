import z from "zod";

export const postIdParamsSchema = z.object({
  postId: z.uuid("Invalid post ID"),
});

export const commentIdParamsSchema = z.object({
  commentId: z.uuid("Invalid comment ID"),
});

export const postModerationStateSchema = z.object({
  state: z.enum(["active", "banned", "shadow_banned"]),
});

export const commentModerationStateSchema = z.object({
  state: z.enum(["active", "banned"]),
});

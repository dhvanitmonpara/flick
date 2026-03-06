import { z } from "zod";

export const moderationWordSchema = z.object({
  word: z.string().min(1).max(128),
  strictMode: z.boolean().default(false),
  severity: z.enum(["mild", "moderate", "severe"]),
});

export const moderationWordUpdateSchema = z
  .object({
    word: z.string().min(1).max(128).optional(),
    strictMode: z.boolean().optional(),
    severity: z.enum(["mild", "moderate", "severe"]).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one update field is required",
  });

export const moderationWordIdSchema = z.object({
  id: z.uuid("Invalid banned word id"),
});

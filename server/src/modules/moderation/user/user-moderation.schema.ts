import z from "zod";

export const userSearchQuerySchema = z
  .object({
    email: z.email().optional(),
    username: z.string().min(1).optional(),
  })
  .refine((data) => data.email || data.username, {
    message: "Either email or username must be provided",
  });

export const userIdParamsSchema = z.object({
  userId: z.uuid("Invalid user ID"),
});

export const userModerationStateSchema = z.object({
  blocked: z.boolean(),
  suspension: z
    .object({
      ends: z.iso.datetime("Invalid suspension end date"),
      reason: z.string().min(1, "Suspension reason is required"),
    })
    .optional(),
}).refine(
  (data) => !(data.suspension && data.blocked === false),
  { message: "Suspension requires blocked=true", path: ["suspension"] },
);

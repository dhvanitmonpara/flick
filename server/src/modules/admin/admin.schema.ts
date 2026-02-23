import { z } from "zod";

export const ManageUsersQuerySchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
});

export type ManageUsersQueryType = z.infer<typeof ManageUsersQuerySchema>;

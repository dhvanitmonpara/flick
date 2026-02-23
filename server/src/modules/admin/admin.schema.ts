import { z } from "zod";

export const ManageUsersQuerySchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
});

export type ManageUsersQueryType = z.infer<typeof ManageUsersQuerySchema>;

export const GetReportsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.preprocess(
    (val) => (typeof val === "string" ? val.split(",") : val),
    z.array(z.string()).default(["pending", "resolved"])
  ),
  fields: z.string().optional(),
});

export type GetReportsQueryType = z.infer<typeof GetReportsQuerySchema>;

export const GetLogsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().default("timestamp"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type GetLogsQueryType = z.infer<typeof GetLogsQuerySchema>;

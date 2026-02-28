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

export const CreateCollegeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters string"),
  emailDomain: z.string().min(3, "Valid email domain is required (e.g. '@college.edu')"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  profile: z.url("Profile must be a valid URL").optional(),
});

export type CreateCollegeType = z.infer<typeof CreateCollegeSchema>;

export const UpdateCollegeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters string").optional(),
  emailDomain: z.string().min(3, "Valid email domain is required (e.g. '@college.edu')").optional(),
  city: z.string().min(2, "City is required").optional(),
  state: z.string().min(2, "State is required").optional(),
  profile: z.url("Profile must be a valid URL").optional(),
});

export type UpdateCollegeType = z.infer<typeof UpdateCollegeSchema>;

export const CollegeIdSchema = z.object({
  id: z.string().uuid("Invalid college ID format"),
});

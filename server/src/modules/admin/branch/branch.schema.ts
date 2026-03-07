import { z } from "zod";

export const CreateBranchSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters string"),
	code: z.string().min(2, "Code must be at least 2 characters string"),
});

export type CreateBranchType = z.infer<typeof CreateBranchSchema>;

export const UpdateBranchSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters string")
		.optional(),
	code: z
		.string()
		.min(2, "Code must be at least 2 characters string")
		.optional(),
});

export type UpdateBranchType = z.infer<typeof UpdateBranchSchema>;

export const BranchIdSchema = z.object({
	id: z.string().uuid("Invalid branch ID format"),
});

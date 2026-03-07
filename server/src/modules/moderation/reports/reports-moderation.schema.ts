import z from "zod";

const reportStatusSchema = z.enum(["pending", "resolved", "ignored"]);

export const createReportSchema = z.object({
	targetId: z.uuid("Target ID is required"),
	type: z.enum(["Post", "Comment"]),
	reason: z.string().min(1, "Reason is required"),
	message: z.string().min(1, "Message is required"),
});

export const reportIdParamsSchema = z.object({
	id: z.uuid("Invalid report ID"),
});

export const reportsByUserParamsSchema = z.object({
	userId: z.uuid("Invalid user ID"),
});

export const reportFiltersSchema = z.object({
	page: z
		.string()
		.optional()
		.transform((value) => (value ? Number.parseInt(value, 10) : 1)),
	limit: z
		.string()
		.optional()
		.transform((value) => (value ? Number.parseInt(value, 10) : 10)),
	type: z.enum(["Post", "Comment", "Both"]).optional().default("Both"),
	status: z
		.string()
		.optional()
		.transform((value) => value?.split(",") ?? ["pending"])
		.pipe(z.array(reportStatusSchema)),
});

export const updateReportSchema = z.object({
	status: reportStatusSchema,
});

export const bulkDeleteReportsSchema = z.object({
	reportIds: z.array(z.uuid("Invalid report ID")).min(1),
});

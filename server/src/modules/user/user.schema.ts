import { z } from "zod";

const EmailSchema = z.email("Email is required");

export const userOAuthSchema = z.object({
	email: EmailSchema,
	username: z.string().optional(),
});

export const tempTokenSchema = z.object({
	tempToken: z.string("Temp token is required"),
});

export const userIdSchema = z.object({
	userId: z.string("User ID is required"),
});

export const registrationSchema = z.object({
	email: EmailSchema,
});

export const initializeUserSchema = registrationSchema.extend({
	email: EmailSchema,
	password: z
		.string("Password is required")
		.min(6, "Password must be at least 6 characters"),
});

export const googleCallbackSchema = z.object({
	code: z.string("Code is required"),
});

export const searchQuerySchema = z.object({
	query: z.string("Query is required"),
});

export const UpdateProfileSchema = z.object({
	branch: z.string().min(1, "Branch must be at least 1 characters long"),
});

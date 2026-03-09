import { z } from "zod";

export const CreateCollegeSchema = z.object({
	name: z.string().min(1, "College name is required"),
	emailDomain: z
		.string()
		.min(1, "Email domain is required")
		.regex(/^[\w.-]+\.[a-z]{2,}$/i, "Invalid email domain format"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	profile: z.url("Profile must be a valid URL").optional(),
	branches: z.array(z.string().uuid("Invalid branch ID format")).optional(),
});

export const UpdateCollegeSchema = z.object({
	name: z.string().min(1, "College name is required").optional(),
	emailDomain: z
		.string()
		.min(1, "Email domain is required")
		.regex(/^[\w.-]+\.[a-z]{2,}$/i, "Invalid email domain format")
		.optional(),
	city: z.string().min(1, "City is required").optional(),
	state: z.string().min(1, "State is required").optional(),
	profile: z.url("Profile must be a valid URL").optional(),
	branches: z.array(z.string().uuid("Invalid branch ID format")).optional(),
});

export const CollegeIdSchema = z.object({
	id: z.uuid("Invalid college ID format"),
});

export const CollegeFiltersSchema = z.object({
	city: z.string().optional(),
	state: z.string().optional(),
});

export const CreateCollegeRequestSchema = z.object({
	name: z.string().min(2, "College name is required"),
	emailDomain: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, "Email domain is required")
		.regex(/^[\w.-]+\.[a-z]{2,}$/i, "Invalid email domain format"),
	city: z.string().min(2, "City is required"),
	state: z.string().min(2, "State is required"),
	requestedByEmail: z.email("A valid email is required"),
}).superRefine((value, ctx) => {
	const requesterDomain = value.requestedByEmail.split("@")[1]?.toLowerCase();
	const collegeDomain = value.emailDomain.toLowerCase();

	if (requesterDomain !== collegeDomain) {
		ctx.addIssue({
			code: "custom",
			path: ["requestedByEmail"],
			message: "Requester email must match the college email domain",
		});
	}
});

export const UpdateCollegeRequestSchema = z.object({
	status: z.enum(["pending", "approved", "rejected"]),
	resolvedCollegeId: z.uuid("Invalid college ID format").optional(),
});

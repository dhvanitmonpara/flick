import { z } from "zod";

const EmailSchema = z.email("Email is required");

export const loginSchema = z.object({
  email: EmailSchema,
  password: z.string("Password is required"),
});

export const verifyOtpSchema = z.object({
  otp: z.string("OTP is required"),
});

export const otpSchema = z.object({
  email: EmailSchema,
});

export const tempTokenSchema = z.object({
  tempToken: z.string("Temp token is required"),
});

export const initializeUserSchema = z.object({
  email: EmailSchema,
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const onboardingSchema = z.object({
  branch: z
    .string("Branch is required")
    .min(1, "Branch must be at least 1 characters long"),
});

export const registrationSchema = z.object({
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const googleCallbackSchema = z.object({
  code: z.string("Code is required"),
});

export const forgotPasswordSchema = z.object({
  email: EmailSchema,
  redirectTo: z.string().url("Redirect URL must be valid").optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string("New password is required")
    .min(6, "Password must be at least 6 characters"),
  token: z.string("Reset token must be a string").optional(),
});

export const resetPasswordQuerySchema = z.object({
  token: z.string("Reset token must be a string").optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string("Password must be a string").optional(),
  token: z.string("Token must be a string").optional(),
  callbackURL: z.string().url("Callback URL must be valid").optional(),
});

export const adminListQuerySchema = z.object({
  query: z.string().optional(),
  limit: z.coerce
    .number("Limit must be a number")
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .optional(),
  offset: z.coerce
    .number("Offset must be a number")
    .int("Offset must be an integer")
    .min(0, "Offset must be at least 0")
    .optional(),
});

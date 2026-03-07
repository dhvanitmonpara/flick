import type { Request, Response } from "express";
import { Controller, HttpError, HttpResponse } from "@/core/http";
import * as authSchemas from "./auth.schema";
import authService from "./auth.service";

@Controller()
class AuthController {
	static async loginUser(req: Request, res: Response) {
		const { email, password } = authSchemas.loginSchema.parse(req.body);

		const user = await authService.loginAuth(email, password, res);

		return HttpResponse.ok("User logged in successfully!", {
			...user,
			password: null,
			refreshToken: null,
		});
	}

	static async logoutUser(req: Request, res: Response) {
		await authService.logoutAuth(req, res);

		return HttpResponse.ok("User logged out successfully");
	}

	static async refreshAccessToken(req: Request) {
		const incomingRefreshToken =
			req.cookies.refreshToken || req.body?.refreshToken;

		if (!incomingRefreshToken)
			throw HttpError.unauthorized("Unauthorized request", {
				meta: { source: "authService.refreshAccessTokenService" },
			});

		// const { accessToken, refreshToken } =
		//   await authService.refreshAccessTokenService(incomingRefreshToken, req);

		// authService.setAuthCookies(res, accessToken, refreshToken);

		return HttpResponse.ok("Access token refreshed successfully");
	}

	static async sendOtp(req: Request) {
		const { email } = authSchemas.otpSchema.parse(req.body);

		const signupId = req.cookies.pending_signup || req.body.pending_signup;

		if (!signupId)
			throw HttpError.badRequest("Signup ID is required", {
				meta: { source: "send_otp" },
			});

		const { messageId } = await authService.sendOtp(signupId, email);

		return HttpResponse.ok("OTP sent successfully", { messageId });
	}

	static async verifyUserOtp(req: Request) {
		const { otp } = authSchemas.verifyOtpSchema.parse(req.body);

		const signupId = req.cookies.pending_signup || req.body.pending_signup;

		if (!signupId)
			throw HttpError.badRequest("Signup ID is required", {
				meta: { source: "verify_otp" },
			});

		const isVerified = await authService.verifyUserOtp(signupId, otp);

		return HttpResponse.ok(
			isVerified ? "OTP verified successfully" : "Invalid OTP",
			{ isVerified },
		);
	}

	static async verifyOtp(req: Request) {
		const { otp } = authSchemas.verifyOtpSchema.parse(req.body);

		const signupId = req.cookies.pending_signup || req.body.pending_signup;

		if (!signupId)
			throw HttpError.badRequest("Signup ID is required", {
				meta: { source: "verify_otp" },
			});

		const isVerified = await authService.verifyOtp(signupId, otp);

		return HttpResponse.ok(
			isVerified ? "OTP verified successfully" : "Invalid OTP",
			{ isVerified },
		);
	}

	static async googleCallback(req: Request) {
		const { code } = authSchemas.googleCallbackSchema.parse(req.query);
		await authService.handleGoogleOAuth(code, req);
		return HttpResponse.redirect("/");
	}

	static async initializeUser(req: Request, res: Response) {
		const { email } = authSchemas.initializeUserSchema.parse(req.body);

		const result = await authService.initializeRegistration(email, res);

		return HttpResponse.created(
			"User initialized successfully and OTP sent",
			result,
		);
	}

	static async registerUser(req: Request, res: Response) {
		const { password } = authSchemas.registrationSchema.parse(req.body);

		const data = await authService.finishRegistration(req, password, res);

		return HttpResponse.created("Form submitted successfully!", data);
	}

	static async completeOnboarding(req: Request) {
		const { branch } = authSchemas.onboardingSchema.parse(req.body);
		const data = await authService.completeOnboarding(req, branch);
		return HttpResponse.ok("Onboarding completed successfully!", data);
	}

	static async getCurrentUser(req: Request) {
		const user = req.user;
		return HttpResponse.ok("User retrieved successfully", { user });
	}

	static async deleteAccount(req: Request, res: Response) {
		const payload = authSchemas.deleteAccountSchema.parse(req.body ?? {});
		await authService.deleteAccount(req, res, payload);
		return HttpResponse.ok("Account deleted successfully");
	}

	static async forgotPassword(req: Request) {
		const { email, redirectTo } = authSchemas.forgotPasswordSchema.parse(
			req.body,
		);

		await authService.requestPasswordReset(email, redirectTo);

		return HttpResponse.ok("Password reset request sent successfully");
	}

	static async resetPassword(req: Request) {
		const { token: queryToken } = authSchemas.resetPasswordQuerySchema.parse(
			req.query,
		);
		const { newPassword, token: bodyToken } =
			authSchemas.resetPasswordSchema.parse(req.body);

		const token = bodyToken ?? queryToken;

		await authService.resetPassword(newPassword, token);

		return HttpResponse.ok("Password reset successfully");
	}

	static async logoutAllDevices(req: Request) {
		await authService.logoutAllDevices(req);
		return HttpResponse.ok("Logged out from all other devices successfully");
	}

	static async getAllAdmins(req: Request) {
		const { query, limit, offset } = authSchemas.adminListQuerySchema.parse(
			req.query,
		);

		const result = await authService.getAllAdmins({ query, limit, offset });

		return HttpResponse.ok("Admin users fetched successfully", result);
	}

	static async getAllUsersForAdmin(req: Request) {
		const { query, limit, offset } = authSchemas.adminListQuerySchema.parse(
			req.query,
		);

		const result = await authService.getAllUsersForAdmin({
			query,
			limit,
			offset,
		});

		return HttpResponse.ok("Users fetched successfully", result);
	}

	static async sendLoginOtp(req: Request) {
		const { email } = authSchemas.loginOtpSchema.parse(req.body);
		const result = await authService.sendLoginOtp(email);
		return HttpResponse.ok("OTP sent successfully", result);
	}

	static async verifyLoginOtp(req: Request, res: Response) {
		const { email, otp } = authSchemas.verifyLoginOtpSchema.parse(req.body);
		const result = await authService.verifyLoginOtpAndSignIn(email, otp, res);
		return HttpResponse.ok("Logged in successfully", {
			userId: result.user.id,
		});
	}

	static async getPasswordStatus(req: Request) {
		const authId = req.auth?.id;
		if (!authId) throw HttpError.unauthorized("Unauthorized request");
		const hasPassword = await authService.hasPassword(authId);
		return HttpResponse.ok("Password status fetched", { hasPassword });
	}

	static async setPassword(req: Request) {
		const { newPassword, currentPassword } =
			authSchemas.setPasswordSchema.parse(req.body);
		const result = await authService.setOrChangePassword(
			req,
			newPassword,
			currentPassword,
		);
		return HttpResponse.ok(
			result.changed
				? "Password changed successfully"
				: "Password set successfully",
			{ hasPassword: true },
		);
	}
}

export default AuthController;

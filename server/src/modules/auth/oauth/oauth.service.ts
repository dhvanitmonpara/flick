import type { Request } from "express";
import { nanoid } from "nanoid";
import { HttpError } from "@/core/http";
import logger from "@/core/logger";
import { auth } from "@/infra/auth/auth";
import parseHeaders from "@/lib/better-auth/parse-headers";
import recordAudit from "@/lib/record-audit";
import UserRepo from "@/modules/user/user.repo";
import type { CollegeSelect } from "@/shared/types/College";
import authService from "../auth.service";

class OAuthService {
	handleGoogleOAuth = async (code: string, req: Request) => {
		logger.info("Handling Google OAuth", {
			code: `${code.substring(0, 10)}...`,
		});

		// Exchange code for access token
		// Get user info
		// Check existing user

		const headers = parseHeaders(req.headers);
		const session = await auth.api.getSession({ headers });

		if (!session) {
			logger.error("Session not found", {
				source: "OAuthService.handleGoogleOAuth",
			});
			throw HttpError.unauthorized("Unauthorized request", {
				code: "UNAUTHORIZED",
				meta: { source: "handle_google_oauth" },
			});
		}

		const existingProfile = await UserRepo.CachedRead.findByAuthId(
			session.user.id,
			{},
		);
		if (existingProfile) {
			return existingProfile;
		}

		let college: null | CollegeSelect = null;
		try {
			college = await authService.ensureEmailVerified(session.user.email);
		} catch (error) {
			if (HttpError.isHttpError(error) && error.code === "COLLEGE_NOT_FOUND") {
				await authService.cleanupOrphanedAuthUser(session.user.id);
			}
			throw error;
		}

		const username = nanoid(12);

		const profile = await UserRepo.Write.create({
			username,
			collegeId: college.id,
			branch: null,
			authId: session.user.id,
			status: "ONBOARDING",
		});

		await recordAudit({
			action: "auth:created:account",
			entityType: "auth",
			entityId: session.user.id,
			after: { id: session.user.id },
			metadata: { registrationMethod: "google" },
		});

		return profile;
	};
}

export default new OAuthService();

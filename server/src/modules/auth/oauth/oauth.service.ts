import { Request } from "express";
import recordAudit from "@/lib/record-audit";
import logger from "@/core/logger";
import { auth } from "@/infra/auth/auth";
import parseHeaders from "@/lib/better-auth/parse-headers";
import authService from "../auth.service";
import UserRepo from "@/modules/user/user.repo";
import { nanoid } from "nanoid";
import { HttpError } from "@/core/http";

class OAuthService {
  handleGoogleOAuth = async (code: string, req: Request) => {
    logger.info("Handling Google OAuth", { code: code.substring(0, 10) + "..." });

    // Exchange code for access token
    // Get user info
    // Check existing user

    const headers = parseHeaders(req.headers)
    const session = await auth.api.getSession({ headers });

    console.log(session)

    if (!session) {
      logger.error("Session not found", {
        source: "OAuthService.handleGoogleOAuth"
      })
      throw HttpError.unauthorized("Unauthorized request", {
        code: "UNAUTHORIZED",
        meta: { source: "handle_google_oauth" },
      });
    }

    const existingProfile = await UserRepo.CachedRead.findByAuthId(session.user.id, {});
    if (existingProfile) {
      console.log("profile exists")
      return existingProfile;
    }

    console.log("profile doesnt exist, creating one")

    const college = await authService.ensureEmailVerified(session.user.email);

    const username = nanoid(12);

    const profile = await UserRepo.Write.create({
      username,
      collegeId: college.id,
      branch: null,
      authId: session.user.id,
      status: "ONBOARDING",
    });

    console.log(profile)

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

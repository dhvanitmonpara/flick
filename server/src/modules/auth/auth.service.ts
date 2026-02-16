import { Request, Response } from "express";
import { HttpError } from "@/core/http";
import cache, { redis } from "@/infra/services/cache/index";
import AuthRepo from "@/modules/auth/auth.repo";
import oauthService from "@/modules/auth/oauth/oauth.service";
import otpService from "@/modules/auth/otp/otp.service";
import recordAudit from "@/lib/record-audit";
import logger from "@/core/logger";
import { auth } from "@/infra/auth/auth";
import { forwardSetCookieHeaders } from "@/lib/better-auth/http-helpers";
import parseHeaders from "@/lib/better-auth/parse-headers";
import { isDisposableEmailDomain } from "disposable-email-domains-js";
import CollegeRepo from "../college/college.repo";
import { nanoid } from "nanoid";
import CryptoTools from "@/lib/crypto-tools";
import crypto from "node:crypto";
import { PendingUser } from "./auth.types";
import { env } from "@/config/env";

class AuthService {

  redeemTempToken = async (tempToken: string) => {
    const stored: { accessToken: string; refreshToken: string } | undefined =
      await cache.get(tempToken);

    if (!stored) return null;

    await cache.del(tempToken);

    return stored;
  };

  getPendingUser = async (signupId: string) => {
    const stored = (await cache.get(`pending:${signupId}`)) as PendingUser;

    if (!stored) {
      throw HttpError.forbidden("Invalid or expired signup session");
    }

    return stored;
  };

  initializeRegistration = async (
    email: string,
    branch: string,
    res: Response
  ) => {
    const existingUser = await AuthRepo.CachedRead.findByEmail(email);

    if (existingUser) {
      logger.warn("User with this email already exists", {
        source: "initialize_registration"
      })
      throw HttpError.forbidden("User with this email already exists", {
        meta: { source: "authService.initializeRegistration" },
      });
    }

    this.validateStudentEmail(email);

    const college = await CollegeRepo.CachedRead.findByEmailDomain(email.split("@")[1]);

    if (!college) {
      logger.error("College not found", {
        source: "authService.initializeRegistration"
      })
      throw HttpError.notFound("College not found", {
        code: "COLLEGE_NOT_FOUND",
        meta: { source: "initialize_registration" },
      });
    }

    this.checkDisposableMail(email)

    const encryptedEmail = CryptoTools.email.encrypt(email.toLowerCase());
    const signupId = crypto.randomBytes(32).toString("hex");

    const otpData = await this.sendOtp(signupId, email);

    const cacheSuccess = await cache.set(
      `pending:${signupId}`,
      {
        branch,
        collegeId: college.id,
        email: encryptedEmail,
        verified: false
      },
      900
    );

    if (!cacheSuccess) {
      logger.error("Failed to set user in cache", {
        source: "authService.initializeRegistration"
      })
      throw HttpError.internal("Failed to set user in cache", {
        meta: { source: "initialize_registration" },
      });
    }

    res.cookie("pending_signup", signupId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 900 * 1000,
      path: "/",
      domain: env.COOKIE_DOMAIN
    });

    await recordAudit({
      action: "user:initialized:account",
      entityType: "user",
      entityId: signupId,
    });

    return { success: true };
  };

  verifyUserOtp = async (signupId: string, otp: string) => {
    const stored = await this.getPendingUser(signupId);

    const attemptsKey = `otp_attempts:${signupId}`;

    const attempts =
      ((await cache.get(attemptsKey)) as number) || 0;

    if (attempts >= 5) {
      await cache.del(`otp:${signupId}`);
      await cache.del(`pending:${signupId}`);
      throw HttpError.forbidden("Too many OTP attempts. Try later.");
    }

    const isOTPValid = await this.verifyOtp(signupId, otp);

    if (!isOTPValid) {
      const newAttempts = attempts + 1;

      await cache.set(attemptsKey, newAttempts, 900);

      logger.warn("Invalid OTP", {
        source: "verify_user_otp",
        attempts: newAttempts,
      });

      if (newAttempts >= 5) {
        throw HttpError.forbidden("Too many OTP attempts. Try later.");
      }

      throw HttpError.forbidden("Invalid OTP");
    };

    await cache.del(attemptsKey);
    await cache.del(`otp:${signupId}`);

    // Mark verified
    await redis.setKeepTtl(
      `pending:${signupId}`,
      { ...stored, verified: true },
    );

    return { verified: true };
  };

  finishRegistration = async (req: Request, password: string, res: Response) => {
    const signupId = req.cookies.pending_signup;
    const stored = await this.getPendingUser(signupId);
    const { email, branch, collegeId, verified } = stored;

    if (!verified) {
      throw HttpError.forbidden("User not verified");
    }

    const username = nanoid(12);
    const decryptedEmail = CryptoTools.email.decrypt(email)
    const lookupEmail = CryptoTools.email.hash(decryptedEmail)

    const response = await auth.api.signUpEmail({
      body: {
        email: decryptedEmail,
        lookupEmail,
        password,
        name: username,
        collegeId,
        branch,
      },
      asResponse: true,
      returnHeaders: true,
    });

    if (res && response.headers) forwardSetCookieHeaders(response.headers, res);

    const data = await response.json();
    const createdUser = data.user;

    await cache.del(`pending:${signupId}`);

    await recordAudit({
      action: "user:created:account",
      entityType: "user",
      entityId: createdUser.id,
      after: { id: createdUser.id },
      metadata: { registrationMethod: "better-auth" },
    });

    return { createdUser, session: data.session };
  };

  loginAuth = async (email: string, password: string, res: Response) => {
    const response = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
      returnHeaders: true,
    });

    forwardSetCookieHeaders(response.headers, res);

    const data = await response.json();

    await recordAudit({
      action: "user:logged:in:self",
      entityType: "auth",
      entityId: data.user.id,
    });

    return data
  };

  logoutAuth = async (req: Request, res: Response, userId: string) => {
    const headers = parseHeaders(req.headers)
    const response = await auth.api.signOut({ headers, asResponse: true, returnHeaders: true });
    forwardSetCookieHeaders(response.headers, res);

    await recordAudit({
      action: "user:logged:out:self",
      entityType: "auth",
      entityId: userId,
    });
  };

  validateStudentEmail(email: string) {
    if (typeof email !== "string") {
      throw HttpError.badRequest("Invalid email format");
    }

    const parts = email.split("@");
    if (parts.length !== 2) {
      throw HttpError.badRequest("Invalid email structure");
    }

    const [localPart] = parts;

    if (!/^\d+$/.test(localPart)) {
      throw HttpError.badRequest("Enrollment ID must be numeric");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      throw HttpError.badRequest("Invalid email address format");
    }
  }

  checkDisposableMail = (email: string) => {
    const domain = email.split("@")[1];

    if (isDisposableEmailDomain(domain)) {
      throw HttpError.badRequest("Disposable emails not allowed");
    }
  };

  sendOtp = otpService.sendOtp;
  verifyOtp = otpService.verifyOtp
  handleGoogleOAuth = oauthService.handleGoogleOAuth
}

export default new AuthService();

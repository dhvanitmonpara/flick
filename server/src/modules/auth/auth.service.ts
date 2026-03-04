import { Request, Response } from "express";
import { HttpError } from "@/core/http";
import { eq, and } from "drizzle-orm";
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
import UserRepo from "../user/user.repo";
import { isConstraintViolation } from "@/lib/pg/errors/constraint-violantion";
import { notifications } from "@/infra/db/tables/notification.table";
import { auth as authTable, verification as verificationTable, session, account } from "@/infra/db/tables/auth.table";
import db from "@/infra/db";
import mailService from "@/infra/services/mail";

class AuthService {
  getPendingUser = async (signupId: string, options?: { bypassL1?: boolean }) => {
    const stored = (await cache.get(`pending:${signupId}`, options)) as PendingUser;

    if (!stored) {
      throw HttpError.forbidden("Invalid or expired signup session");
    }

    return stored;
  };

  initializeRegistration = async (
    email: string,
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

    const college = await this.ensureEmailVerified(email);

    const encryptedEmail = CryptoTools.email.encrypt(email.toLowerCase());
    // const signupId = crypto.randomBytes(32).toString("hex");
    const signupId = crypto.randomUUID();

    await this.sendOtp(signupId, email);

    const cacheSuccess = await cache.set(
      `pending:${signupId}`,
      {
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
    const stored = await this.getPendingUser(signupId, { bypassL1: true });
    const { email, verified, collegeId } = stored;

    if (!verified) {
      throw HttpError.forbidden("User not verified");
    }

    const username = nanoid(12);
    const decryptedEmail = CryptoTools.email.decrypt(email)

    const existingAuth = await AuthRepo.Read.findByEmail(decryptedEmail);

    let createdUser;
    let isNewAuth = false;

    if (existingAuth) {
      createdUser = existingAuth;
    } else {
      const response = await auth.api.signUpEmail({
        body: {
          email: decryptedEmail,
          password,
          name: username,
        },
        asResponse: true,
        returnHeaders: true,
      });

      const parsed = await response.json();
      createdUser = parsed.user;
      isNewAuth = true;

      await db.update(authTable).set({ emailVerified: true }).where(eq(authTable.id, createdUser.id));
      createdUser.emailVerified = true;

      if (res && response.headers) forwardSetCookieHeaders(response.headers, res);
    }

    let profile = await UserRepo.Read.findByAuthId(createdUser.id, {});

    if (!profile) {
      try {
        profile = await UserRepo.Write.create({
          username,
          collegeId,
          branch: null,
          authId: createdUser.id,
          status: "ONBOARDING",
        });
      } catch (error) {
        if (isConstraintViolation(error)) {
          profile = await UserRepo.Read.findByAuthId(createdUser.id, {});
          if (!profile) {
            throw HttpError.internal("Failed to create user profile. Please try again.");
          }
        } else {
          throw error;
        }
      }
    }

    await cache.del(`pending:${signupId}`);
    res.clearCookie("pending_signup", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      domain: env.COOKIE_DOMAIN
    });

    if (isNewAuth) {
      await recordAudit({
        action: "auth:created:account",
        entityType: "auth",
        entityId: createdUser.id,
        after: { id: createdUser.id },
        metadata: { registrationMethod: "email" },
      });
    }

    return { user: createdUser, profile };
  };

  completeOnboarding = async (req: Request, branch: string) => {
    const userId = req.user.id;

    await cache.del(`user:id:${userId}`);
    await cache.del(`user:authId:${req.auth.id}`);

    const existingProfile = await UserRepo.Read.findById(userId, {});
    if (!existingProfile) {
      throw HttpError.internal("Profile missing for authenticated user");
    }
    if (existingProfile.status === "ACTIVE") {
      throw HttpError.forbidden("User already onboarded", { code: "USER_ALREADY_ONBOARDED" });
    }

    // TODO: Check if branch is valid

    try {
      const profile = await UserRepo.Write.updateById(userId, {
        branch,
        status: "ACTIVE",
      });

      await cache.del(`user:id:${userId}`);
      await cache.del(`user:authId:${req.auth.id}`);

      await recordAudit({
        action: "user:finished:onboarding",
        entityType: "user",
        entityId: userId,
        after: { id: profile.id },
      });

      return profile;
    } catch (error) {
      if (isConstraintViolation(error)) {
        return await UserRepo.Read.findById(userId, {});
      }
      throw error;
    }
  };

  ensureEmailVerified = async (email: string) => {
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
    };

    this.checkDisposableMail(email)

    return college;
  }

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

  logoutAuth = async (req: Request, res: Response) => {
    const headers = parseHeaders(req.headers)
    const response = await auth.api.signOut({ headers, asResponse: true, returnHeaders: true });
    forwardSetCookieHeaders(response.headers, res);

    await recordAudit({
      action: "user:logged:out:self",
      entityType: "auth",
      entityId: req.auth?.id,
    });
  };

  deleteAccount = async (
    req: Request,
    res: Response,
    payload: { password?: string; token?: string; callbackURL?: string },
  ) => {
    const headers = parseHeaders(req.headers);
    const userId = req.auth?.id;

    if (!userId) {
      throw HttpError.unauthorized("Unauthorized request");
    }

    const profile = await UserRepo.Read.findByAuthId(userId, {});

    if (profile) {
      await db.delete(notifications).where(eq(notifications.receiverId, profile.id));
      await cache.del(`user:id:${profile.id}`);
      await cache.del(`user:username:${profile.username}`);
      await cache.del(`user:authId:${userId}`);
    }

    let authResponse: Response | undefined;
    try {
      authResponse = await auth.api.signOut({
        headers,
        asResponse: true,
        returnHeaders: true,
      }) as unknown as Response;
    } catch {
      // Swallowing errors just in case
    }

    if (authResponse) {
      forwardSetCookieHeaders((authResponse as unknown as globalThis.Response).headers, res);
    } else {
      res.clearCookie("better-auth.session_token", { path: "/" });
      res.clearCookie("better-auth.session_data", { path: "/" });
    }

    await db.delete(authTable).where(eq(authTable.id, userId));

    await recordAudit({
      action: "other:action",
      entityType: "auth",
      entityId: userId,
      metadata: { source: "authService.deleteAccount" },
    });

    return true;
  };

  requestPasswordReset = async (email: string, redirectTo?: string) => {
    const result = await auth.api.requestPasswordReset({
      body: { email, redirectTo },
    });

    await recordAudit({
      action: "user:forgot:password",
      entityType: "auth",
      entityId: email,
    });

    return result;
  };

  resetPassword = async (newPassword: string, token?: string) => {
    let targetUserId: string | null = null;
    if (token) {
      const [dbResetToken] = await db
        .select()
        .from(verificationTable)
        .where(eq(verificationTable.identifier, `reset-password:${token}`))
        .limit(1);

      if (dbResetToken) {
        targetUserId = dbResetToken.value;
      }
    }

    const result = await auth.api.resetPassword({
      body: {
        newPassword,
        token,
      },
    });

    if (targetUserId) {
      await db.update(authTable).set({ emailVerified: true }).where(eq(authTable.id, targetUserId));
    }

    await recordAudit({
      action: "user:initialized:forgot-password",
      entityType: "auth",
      entityId: token ?? "tokenless",
    });

    return result;
  };

  logoutAllDevices = async (req: Request) => {
    const headers = parseHeaders(req.headers);
    const result = await auth.api.revokeOtherSessions({ headers });

    await recordAudit({
      action: "other:action",
      entityType: "auth",
      entityId: req.auth?.id ?? "unknown",
      metadata: { source: "authService.logoutAllDevices" },
    });

    return result;
  };

  getAllAdmins = async (options: { query?: string; limit?: number; offset?: number }) => {
    return AuthRepo.Read.listAdmins(options);
  };

  getAllUsersForAdmin = async (options: { query?: string; limit?: number; offset?: number }) => {
    return AuthRepo.Read.listUsersForAdmin(options);
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

  sendLoginOtp = async (email: string) => {
    const existing = await AuthRepo.Read.findByEmail(email);

    const cooldownKey = `login_otp_cooldown:${email}`;
    const inCooldown = await cache.get(cooldownKey);
    if (inCooldown) {
      throw HttpError.tooManyRequests("Please wait a minute before requesting another OTP.");
    }
    await cache.set(cooldownKey, true, 60);

    const cacheKey = `login_otp:${email}`;
    const attemptsKey = `login_otp_attempts:${email}`;
    const attempts = ((await cache.get(attemptsKey)) as number) || 0;
    if (attempts >= 5) {
      throw HttpError.forbidden("Too many OTP attempts. Try later.");
    }

    if (!existing) {
      const dummyOtp = (Math.floor(Math.random() * 900000) + 100000).toString();
      const hashed = await CryptoTools.otp.hash(dummyOtp);
      await cache.set(cacheKey, hashed, 900);
      return { success: true };
    }

    const data = await import("@/infra/services/mail").then((m) =>
      m.default.send(email, "OTP", { username: email, projectName: "Flick" })
    );

    if (data.status === "error" || !data?.otp) {
      throw HttpError.internal("OTP send failed");
    }

    const hashed = await CryptoTools.otp.hash(data.otp);
    await cache.set(cacheKey, hashed, 900);

    return { success: true };
  };

  verifyLoginOtpAndSignIn = async (email: string, otp: string, res: Response) => {
    const CryptoTools = (await import("@/lib/crypto-tools")).default;
    const cacheKey = `login_otp:${email}`;
    const attemptsKey = `login_otp_attempts:${email}`;

    const attempts = ((await cache.get(attemptsKey)) as number) || 0;
    if (attempts >= 5) {
      throw HttpError.forbidden("Too many OTP attempts. Try later.");
    }

    const cached = await cache.get<string>(cacheKey);
    if (!cached) {
      throw HttpError.forbidden("OTP expired or not found. Request a new one.");
    }

    const isMatch = await CryptoTools.otp.compare(otp, cached);
    if (!isMatch) {
      const newAttempts = attempts + 1;
      await cache.set(attemptsKey, newAttempts, 900);
      if (newAttempts >= 5) {
        await cache.del(cacheKey);
        throw HttpError.forbidden("Too many OTP attempts. Try later.");
      }
      throw HttpError.forbidden("Invalid OTP");
    }

    await cache.del(cacheKey);
    await cache.del(attemptsKey);

    // Find the auth user
    const authUser = await AuthRepo.Read.findByEmail(email);
    if (!authUser) {
      throw HttpError.forbidden("Invalid OTP");
    }

    // Create a session directly in the DB
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(session).values({
      id: sessionId,
      token: sessionToken,
      userId: authUser.id,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.cookie("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
      domain: env.COOKIE_DOMAIN,
    });

    await recordAudit({
      action: "user:logged:in:self",
      entityType: "auth",
      entityId: authUser.id,
      metadata: { method: "otp" },
    });

    return { success: true, user: authUser };
  };

  // ── Password management (set / change) ─────────────────────────────────────

  hasPassword = async (authId: string): Promise<boolean> => {
    const [row] = await db
      .select({ password: account.password })
      .from(account)
      .where(and(eq(account.userId, authId), eq(account.providerId, "credential")))
      .limit(1);
    return !!row?.password;
  };

  setOrChangePassword = async (
    req: Request,
    newPassword: string,
    currentPassword?: string,
  ) => {
    const headers = parseHeaders(req.headers);
    const sessionData = await auth.api.getSession({ headers });
    if (!sessionData) {
      throw HttpError.unauthorized("Unauthorized request");
    }
    const authId = sessionData.user.id;

    const alreadyHasPassword = await this.hasPassword(authId);

    if (alreadyHasPassword) {
      if (!currentPassword) {
        throw HttpError.badRequest("Current password is required to change password");
      }

      const result = await auth.api.changePassword({
        body: { newPassword, currentPassword, revokeOtherSessions: false },
        headers,
      });

      await recordAudit({
        action: "user:forgot:password",
        entityType: "auth",
        entityId: authId,
        metadata: { action: "change_password" },
      });

      return { success: true, changed: true, result };
    } else {
      // OAuth-only user — set password for the first time via setPassword endpoint
      const result = await auth.api.setPassword({
        body: { newPassword },
        headers,
      });

      await db.update(authTable).set({ emailVerified: true }).where(eq(authTable.id, authId));

      await recordAudit({
        action: "user:forgot:password",
        entityType: "auth",
        entityId: authId,
        metadata: { action: "set_password" },
      });

      return { success: true, changed: false, result };
    }
  };

  sendOtp = otpService.sendOtp;
  verifyOtp = otpService.verifyOtp
  handleGoogleOAuth = oauthService.handleGoogleOAuth
}

export default new AuthService();

import { NextFunction, Request, Response } from "express";
import UserRepo from "@/modules/user/user.repo";
import { toInternalUser } from "@/modules/user/user.dto";
import AuthRepo from "@/modules/auth/auth.repo";
import { HttpError } from "@/core/http";
import logger from "@/core/logger";
import { auth } from "@/infra/auth/auth";
import { fromNodeHeaders } from "better-auth/node";
import authService from "@/modules/auth/auth.service";
import recordAudit from "@/lib/record-audit";
import { nanoid } from "nanoid";

const injectUser = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.auth?.id) {
    return next();
  }

  let user = await UserRepo.CachedRead.findByAuthId(req.auth.id, {});

  if (!user) {
    if (req.auth.email) {
      try {
        // Attempt to create a profile dynamically if this is an OAuth user missing one.
        const college = await authService.ensureEmailVerified(req.auth.email);

        user = await UserRepo.Write.create({
          username: nanoid(12),
          collegeId: college.id,
          branch: null,
          authId: req.auth.id,
          status: "ONBOARDING",
        });

        await recordAudit({
          action: "auth:created:account",
          entityType: "auth",
          entityId: req.auth.id,
          after: { id: req.auth.id },
          metadata: { source: "injectUser_middleware_autoregister" },
        });

        req.user = toInternalUser(user);
        return next();
      } catch (error) {
        // Fallthrough to the cleanup logic if dynamic creation fails (e.g. invalid college domain)
        console.error("DYNAMIC_PROFILE_CREATION_ERROR:", error);
        logger.warn("Dynamic profile creation failed", { authId: req.auth.id, error });
      }
    }

    logger.warn("Orphaned auth user found, cleaning up", { authId: req.auth.id });

    try {
      await AuthRepo.Write.deleteById(req.auth.id);
      await auth.api.revokeSessions({ headers: fromNodeHeaders(req.headers) });
    } catch (err) {
      console.log(err)
      logger.error("Failed to remove orphaned auth user", { authId: req.auth.id, err });
    }

    throw HttpError.unauthorized("Session is invalid. Please sign in again.", {
      code: "INVALID_SESSION",
    });
  }

  req.user = toInternalUser(user);
  next();
};

export default injectUser;
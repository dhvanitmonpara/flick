import { NextFunction, Request, Response } from "express";
import UserRepo from "@/modules/user/user.repo";
import { toInternalUser } from "@/modules/user/user.dto";
import { HttpError } from "@/core/http";
import logger from "@/core/logger";
import authService from "@/modules/auth/auth.service";
import recordAudit from "@/lib/record-audit";
import { nanoid } from "nanoid";
import { isConstraintViolation } from "@/lib/pg/errors/constraint-violantion";

const injectUser = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.auth?.id) {
    return next();
  }

  let user = await UserRepo.CachedRead.findByAuthId(req.auth.id, {});

  if (!user && req.auth.email) {
    const college = await authService.ensureEmailVerified(req.auth.email);

    try {
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
    } catch (createError) {
      if (isConstraintViolation(createError)) {
        user = await UserRepo.Read.findByAuthId(req.auth.id, {});
      } else {
        logger.error("Failed to create platform_user in middleware", {
          authId: req.auth.id,
          error: createError,
        });
        throw HttpError.internal("Failed to create user profile");
      }
    }
  }

  if (!user) {
    throw HttpError.forbidden(
      "Profile not found. Please complete registration.",
      { code: "PROFILE_NOT_FOUND" }
    );
  }

  req.user = toInternalUser(user);
  next();
};

export default injectUser;
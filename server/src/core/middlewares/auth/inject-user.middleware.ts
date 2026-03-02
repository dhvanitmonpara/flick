import { NextFunction, Request, Response } from "express";
import UserRepo from "@/modules/user/user.repo";
import { toInternalUser } from "@/modules/user/user.dto";
import AuthRepo from "@/modules/auth/auth.repo";
import { HttpError } from "@/core/http";
import logger from "@/core/logger";
import { auth } from "@/infra/auth/auth";
import { fromNodeHeaders } from "better-auth/node";

const injectUser = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.auth?.id) {
    return next();
  }

  const user = await UserRepo.CachedRead.findByAuthId(req.auth.id, {});

  if (!user) {
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
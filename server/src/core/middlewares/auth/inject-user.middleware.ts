import { NextFunction, Request, Response } from "express";
import UserRepo from "@/modules/user/user.repo";
import { toInternalUser } from "@/modules/user/user.dto";

const injectUser = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.auth?.id) {
    return next();
  }

  const user = await UserRepo.CachedRead.findByAuthId(req.auth.id, {});

  if (!user || user.status === "ONBOARDING") {
    return next();
  }

  req.user = toInternalUser(user);
  next();
}

export default injectUser;
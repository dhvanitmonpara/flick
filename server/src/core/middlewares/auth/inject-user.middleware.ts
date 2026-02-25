import { NextFunction, Request, Response } from "express";
import UserRepo from "@/modules/user/user.repo";
import { HttpError } from "@/core/http";
import { toInternalUser } from "@/modules/user/user.dto";

const injectUser = async (req: Request, _: Response, next: NextFunction) => {
  const user = await UserRepo.CachedRead.findByAuthId(req.auth.id, {});

  if (!user) {
    return HttpError.notFound("User not found");
  }

  req.user = toInternalUser(user);
  next();
}

export default injectUser;
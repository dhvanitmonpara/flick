import type { NextFunction, Request, Response } from "express";
import { HttpError } from "@/core/http";

const stopBannedUser = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.auth) {
    throw HttpError.unauthorized("Unauthorized");
  }

  if (req.auth.isBanned) {
    throw HttpError.forbidden("Banned users cannot perform this action", { code: "USER_BANNED" });
  }

  next();
};

export default stopBannedUser;

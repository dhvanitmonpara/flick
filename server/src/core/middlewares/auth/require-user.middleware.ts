import { NextFunction, Request, Response } from "express";
import { HttpError } from "@/core/http";

const requireUser = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.user) {
    throw HttpError.notFound("User not found");
  }

  if (req.user.status === "ONBOARDING") {
    throw HttpError.forbidden("User not onboarded");
  }

  next();
}

export default requireUser;

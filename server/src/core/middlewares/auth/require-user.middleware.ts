import { NextFunction, Request, Response } from "express";
import { HttpError } from "@/core/http";

const requireOnboardedUser = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.user) {
    throw HttpError.notFound("User not found");
  }

  if (req.user.status === "ONBOARDING") {
    throw HttpError.forbidden("User not onboarded", { 
      code: "USER_NOT_ONBOARDED",
      meta: { 
        source: "requireOnboardedUser",
        collegeId: req.user.collegeId,
      } 
    });
  }

  next();
}

export { requireOnboardedUser };

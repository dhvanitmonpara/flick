import type { NextFunction, Request, Response } from "express";
import { HttpError } from "@/core/http";

const requireTerms = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.user) {
    throw HttpError.notFound("User not found");
  }

  if (!req.user.isAcceptedTerms) {
    throw HttpError.forbidden("Terms not accepted", { code: "TERMS_NOT_ACCEPTED" });
  }

  next();
};

export default requireTerms;

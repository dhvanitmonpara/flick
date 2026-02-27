import { NextFunction, Request, Response } from "express";
import { HttpError } from "@/core/http";

const requireUser = async (req: Request, _: Response, next: NextFunction) => {
  if (!req.user) {
    throw HttpError.notFound("User not found");
  }
  next();
}

export default requireUser;

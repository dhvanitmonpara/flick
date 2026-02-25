import type { NextFunction, Request, Response } from "express";
import { toInternalAuth } from "@/modules/auth/auth.dto";
import { auth } from "@/infra/auth/auth";
import { HttpError } from "@/core/http";
import { AuthSelect } from "@/shared/types/Auth";
import { fromNodeHeaders } from "better-auth/node";
import logger from "@/core/logger";

export const authenticate = async (req: Request, _: Response, next: NextFunction) => {
  const headers = fromNodeHeaders(req.headers);
  logger.info("Authenticate headers", { cookie: headers.get("cookie") });

  const session = await auth.api.getSession({ headers });

  logger.info("Session returned", { session: !!session });

  if (!session || !session.session.userId) {
    throw HttpError.unauthorized("Unauthorized");
  }

  req.session = session.session;
  req.auth = toInternalAuth(session.user as AuthSelect);
  next();
};

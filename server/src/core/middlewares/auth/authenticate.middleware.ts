import type { NextFunction, Request, Response } from "express";
import { toInternalAuth } from "@/modules/auth/auth.dto";
import { auth } from "@/infra/auth/auth";
import { AuthSelect } from "@/shared/types/Auth";
import { fromNodeHeaders } from "better-auth/node";
import logger from "@/core/logger";

export const authenticate = async (req: Request, _: Response, next: NextFunction) => {
  const headers = fromNodeHeaders(req.headers);
  logger.info("Optional Authenticate headers", { cookie: headers.get("cookie") });

  const session = await auth.api.getSession({ headers });

  if (session && session.session.userId) {
    req.session = session.session;
    req.auth = toInternalAuth(session.user as AuthSelect);
  }

  next();
};

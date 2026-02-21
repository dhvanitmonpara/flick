import type { NextFunction, Request, Response } from "express";
import { toInternalAuth } from "@/modules/auth/auth.dto";
import { auth } from "@/infra/auth/auth";
import { HttpError } from "@/core/http";
import { AuthSelect } from "@/shared/types/Auth";
import { toWebHeaders } from "@/lib/to-web-headers";

export const authenticate = async (req: Request, _: Response, next: NextFunction) => {

  const session = await auth.api.getSession({
    headers: toWebHeaders(req.headers),
  });

  if (!session) {
    throw HttpError.unauthorized("Unauthorized")
  }

  req.session = session.session;
  req.auth = toInternalAuth(session.user as AuthSelect);
  next();
}

import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import logger from "@/core/logger";
import { auth } from "@/infra/auth/auth";
import { toInternalAuth } from "@/modules/auth/auth.dto";
import type { AuthSelect } from "@/shared/types/Auth";

export const authenticate = async (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	const headers = fromNodeHeaders(req.headers);
	logger.info("Optional Authenticate headers", {
		cookie: headers.get("cookie"),
	});

	const session = await auth.api.getSession({ headers });

	if (session?.session?.userId) {
		req.session = session.session;
		req.auth = toInternalAuth(session.user as AuthSelect);
	}

	next();
};

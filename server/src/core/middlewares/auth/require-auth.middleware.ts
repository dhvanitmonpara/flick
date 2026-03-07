import type { NextFunction, Request, Response } from "express";
import { HttpError } from "@/core/http";

const requireAuth = async (req: Request, _: Response, next: NextFunction) => {
	if (!req.auth || !req.session.userId) {
		throw HttpError.unauthorized("Unauthorized");
	}

	next();
};

export default requireAuth;

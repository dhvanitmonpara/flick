import compose from "@/lib/compose-middleware";
import { authenticate } from "./auth/authenticate.middleware";
import injectUser from "./auth/inject-user.middleware";
import requireAuth from "./auth/require-auth.middleware";
import { requireRole } from "./auth/require-roles.middleware";
import { requireOnboardedUser } from "./auth/require-user.middleware";

export const identity = authenticate;

export const authenticated = compose(authenticate, requireAuth);

export const withRequiredUserContext = compose(
	authenticate,
	requireAuth,
	injectUser,
	requireOnboardedUser,
);

export const withOptionalUserContext = compose(authenticate, injectUser);

export const checkUserContext = compose(requireAuth, requireOnboardedUser);

export const adminOnly = compose(
	authenticate,
	requireAuth,
	requireRole("admin"),
);

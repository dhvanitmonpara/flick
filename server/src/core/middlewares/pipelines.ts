import compose from "@/lib/compose-middleware";
import { requireRole } from "./auth/require-roles.middleware";
import { authenticate } from "./auth/authenticate.middleware";
import injectUser from "./auth/inject-user.middleware";
import ensureRatelimit from "./rate-limit.middleware";

export const rateLimitAndAuthenticate = compose(ensureRatelimit.api, authenticate)
export const adminOnly = compose(authenticate, requireRole("admin"))
export const authenticateUser = compose(authenticate, injectUser)

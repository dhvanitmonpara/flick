import { authenticate } from "./auth/auth.middleware";
import { requirePermission } from "./requirePermission.middleware";
import { requireRole } from "./requireRoles.middleware";
import errorMiddleware from "./error.middleware";
import rateLimitMiddleware from "./rate-limit.middleware";
import { upload } from "./upload.middleware";
import { validate } from "./validate.middleware";
import compose from "@/lib/compose-middleware";

const adminOnly = compose(authenticate, requireRole("admin"));
const userOnly = compose(authenticate, requireRole("user"));

export {
  authenticate,
  userOnly,
  adminOnly,
  rateLimitMiddleware,
  requirePermission,
  requireRole,
  errorMiddleware,
  upload,
  validate,
};

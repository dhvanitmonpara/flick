import type { Request, Response, NextFunction } from "express";
import { getUserPermissions } from "@/core/security/rbac";
import { Permission, Role } from "@/config/roles";
import { HttpError } from "@/core/http";
import logger from "@/core/logger";

export const requirePermission =
  (...required: Permission[]) =>
    (req: Request, _: Response, next: NextFunction) => {
      if (!req.auth) {
        logger.warn("auth.middleware.permission_auth_required", {
          source: "requirePermission",
        });

        throw HttpError.unauthorized("Unauthorized request", {
          code: "AUTH_REQUIRED",
          meta: { source: "authMiddleware.requirePermission" }
        });
      }

      const userRole = req.auth.role as Role;
      const userRoles = userRole ? [userRole] : [];
      const permissions = getUserPermissions(userRoles);

      // superuser / wildcard permission
      if (permissions.includes("*")) {
        return next();
      }

      const hasAll = required.every(p =>
        permissions.includes(p)
      );

      if (!hasAll) {
        logger.warn("auth.middleware.permission_denied", {
          source: "requirePermission",
          userId: req.auth.id,
          required,
          actual: permissions,
        });

        throw HttpError.forbidden("Permission denied", {
          code: "PERMISSION_FORBIDDEN",
          meta: {
            source: "authMiddleware.requirePermission",
            required,
            actual: permissions
          }
        });
      }

      next();
    };

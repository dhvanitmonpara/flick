import type { Request } from "express";
import { Controller, HttpResponse } from "@/core/http";
import HttpError from "@/core/http/error";
import authService from "@/modules/auth/auth.service";
import * as authSchemas from "@/modules/auth/auth.schema";
import UserManagementService from "./user-moderation.service";
import * as userAdminSchemas from "./user-moderation.schema";

const ignoredModerationErrors = ["already blocked", "not blocked"];

const tryBestEffort = async (handler: () => Promise<unknown>) => {
  try {
    await handler();
  } catch (error) {
    if (
      !(error instanceof HttpError) ||
      !ignoredModerationErrors.some((fragment) =>
        error.message.toLowerCase().includes(fragment),
      )
    ) {
      throw error;
    }
  }
};

@Controller()
class UserAdminController {
  static async list(req: Request) {
    const { query, limit, offset } = authSchemas.adminListQuerySchema.parse(req.query);
    const result = await authService.getAllUsersForAdmin({ query, limit, offset });

    return HttpResponse.ok("Users fetched successfully", result);
  }

  static async search(req: Request) {
    const filters = userAdminSchemas.userSearchQuerySchema.parse(req.query);
    const users = await UserManagementService.getUsersByQuery(filters);

    return HttpResponse.ok("Users fetched successfully", users);
  }

  static async upsertModerationState(req: Request) {
    const { userId } = userAdminSchemas.userIdParamsSchema.parse(req.params);
    const { blocked, suspension } = userAdminSchemas.userModerationStateSchema.parse(req.body);

    if (blocked) {
      await tryBestEffort(() => UserManagementService.blockUser(userId));
    } else {
      await tryBestEffort(() => UserManagementService.unblockUser(userId));
    }

    if (suspension) {
      await UserManagementService.suspendUser(userId, {
        ends: new Date(suspension.ends),
        reason: suspension.reason,
      });
    }

    return HttpResponse.ok("User moderation state updated", {
      userId,
      blocked,
      suspension: suspension ?? null,
    });
  }

  static async getSuspension(req: Request) {
    const { userId } = userAdminSchemas.userIdParamsSchema.parse(req.params);
    const suspension = await UserManagementService.getSuspensionStatus(userId);

    return HttpResponse.ok("User suspension status fetched", suspension);
  }
}

export default UserAdminController;

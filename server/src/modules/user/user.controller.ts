import userService from "./user.service";
import type { Request } from "express";
import { toPublicUser } from "./user.dto";
import { HttpResponse, Controller } from "@/core/http";
import * as userSchemas from "@/modules/user/user.schema";

@Controller()
class UserController {
  static async getUserProfileById(req: Request) {
    const { userId } = userSchemas.userIdSchema.parse(req.params);

    const user = await userService.getUserProfileById(userId);

    return HttpResponse.ok("User fetched successfully", toPublicUser(user));
  }

  static async searchUsers(req: Request) {
    const { query } = userSchemas.searchQuerySchema.parse(req.params);

    const users = await userService.searchUsers(query);

    return HttpResponse.ok("Users fetched successfully", users.map(toPublicUser));
  }

  static async getUserProfile(req: Request) {
    return HttpResponse.ok("User fetched successfully!", toPublicUser(req.user));
  }

  static async acceptTerms(req: Request) {
    await userService.acceptTerms(req.user.id, req.auth.id);

    return HttpResponse.ok("Terms accepted successfully");
  }

  static async updateUserProfile(req: Request) {
    const userId = req.user.id;
    const { branch } = userSchemas.UpdateProfileSchema.parse(req.body);

    const updatedUser = await userService.updateUserProfile(userId, { branch });

    return HttpResponse.ok("Profile updated successfully", toPublicUser(updatedUser));
  }

  static async blockUser(req: Request) {
    const { userId } = userSchemas.userIdSchema.parse(req.params);
    const result = await userService.blockUser(req.user.id, userId);
    return HttpResponse.ok("User blocked successfully", result);
  }

  static async unblockUser(req: Request) {
    const { userId } = userSchemas.userIdSchema.parse(req.params);
    const result = await userService.unblockUser(req.user.id, userId);
    return HttpResponse.ok("User unblocked successfully", result);
  }

  static async getBlockedUsers(req: Request) {
    const blocked = await userService.getBlockedUsers(req.user.id);
    return HttpResponse.ok("Blocked users fetched", blocked);
  }
}

export default UserController;

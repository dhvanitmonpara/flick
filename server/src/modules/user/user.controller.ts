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
    await userService.acceptTerms(req.user.id);

    return HttpResponse.ok("Terms accepted successfully");
  }
}

export default UserController;

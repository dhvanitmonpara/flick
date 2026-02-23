import type { Request } from "express";
import { HttpResponse, Controller } from "@/core/http";
import adminService from "./admin.service";
import * as adminSchemas from "./admin.schema";

@Controller()
class AdminController {
  static async getOverview(req: Request) {
    const data = await adminService.getDashboardOverview();
    return HttpResponse.ok("Dashboard overview fetched successfully", data);
  }

  static async manageUsersQuery(req: Request) {
    const { username, email } = adminSchemas.ManageUsersQuerySchema.parse(req.query);

    const users = await adminService.getManageUsersQuery(username, email);

    return HttpResponse.ok("Users fetched successfully", { users });
  }
}

export default AdminController;

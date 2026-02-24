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

  static async getReports(req: Request) {
    const { page, limit, status } = adminSchemas.GetReportsQuerySchema.parse(req.query);

    const reports = await adminService.getReports(page, limit, status);

    return HttpResponse.ok("Reports fetched successfully", {
      data: reports.data,
      pagination: reports.pagination
    });
  }

  static async getAllColleges(req: Request) {
    const colleges = await adminService.getAllColleges();
    return HttpResponse.ok("Colleges fetched successfully", { colleges });
  }

  static async getLogs(req: Request) {
    const { page, limit, sortBy, sortOrder } = adminSchemas.GetLogsQuerySchema.parse(req.query);

    const logs = await adminService.getLogs(page, limit, sortBy, sortOrder as "asc" | "desc");

    return HttpResponse.ok("Logs fetched successfully", logs);
  }

  static async getAllFeedbacks(req: Request) {
    const feedbacks = await adminService.getAllFeedbacks();
    return HttpResponse.ok("Feedbacks fetched successfully", feedbacks);
  }

  static async createCollege(req: Request) {
    const data = adminSchemas.CreateCollegeSchema.parse(req.body);
    const newCollege = await adminService.createCollege(data);
    return HttpResponse.created("College created successfully", newCollege);
  }

  static async updateCollege(req: Request) {
    const { id } = adminSchemas.CollegeIdSchema.parse(req.params);
    const updates = adminSchemas.UpdateCollegeSchema.parse(req.body);

    const updatedCollege = await adminService.updateCollege(id, updates);

    if (!updatedCollege) {
      const { HttpError } = await import("@/core/http");
      throw HttpError.notFound("College not found");
    }

    return HttpResponse.ok("College updated successfully", updatedCollege);
  }
}

export default AdminController;

import type { Request } from "express";
import { HttpResponse, Controller, HttpError } from "@/core/http";
import adminService from "./admin.service";
import * as adminSchemas from "./admin.schema";
import { uploadImageToCloudinary } from "@/infra/services/media/cloudinary.service";

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
      throw HttpError.notFound("College not found");
    }

    return HttpResponse.ok("College updated successfully", updatedCollege);
  }

  static async uploadCollegeProfile(req: Request) {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    const id = adminSchemas.CollegeIdSchema.parse(req.params).id;

    if (!file) {
      throw HttpError.badRequest("Profile image file is required");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw HttpError.badRequest("Only image uploads are allowed");
    }

    const image = await uploadImageToCloudinary(file, id);

    // Persist the Cloudinary URL to the college record in the DB
    await adminService.updateCollege(id, { profile: image.url });

    return HttpResponse.ok("College profile uploaded successfully", image);
  }
}

export default AdminController;

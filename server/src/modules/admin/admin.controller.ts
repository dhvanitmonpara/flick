import type { Request } from "express";
import { HttpResponse, Controller } from "@/core/http";

@Controller()
class AdminController {
  static async getOverview(req: Request) {
    const data = {
      users: 0,
      posts: 0,
      comments: 0,
    };
    return HttpResponse.ok("Dashboard overview fetched successfully", data);
  }
}

export default AdminController;

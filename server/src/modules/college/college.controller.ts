import { Request } from "express";
import ApiResponse from "@/core/http/ApiResponse.js";
import { AsyncHandler } from "@/core/http/asyncHandler.js";
import collegeService from "./college.service";

class CollegeController {

  @AsyncHandler()
  async createCollege(req: Request) {
    const { name, emailDomain, city, state, profile } = req.body;

    const newCollege = await collegeService.createCollege({
      name,
      emailDomain,
      city,
      state,
      profile,
    });

    return ApiResponse.created({
      message: "College created successfully",
      college: newCollege,
    });
  }

  @AsyncHandler()
  async getColleges(req: Request) {
    const { city, state } = req.query as { city?: string; state?: string };

    const colleges = await collegeService.getColleges({ city, state });

    return ApiResponse.ok({
      colleges,
      count: colleges.length,
    });
  }

  @AsyncHandler()
  async getCollegeById(req: Request) {
    const { id } = req.params;

    const college = await collegeService.getCollegeById(id);

    return ApiResponse.ok({
      college,
    });
  }

  @AsyncHandler()
  async updateCollege(req: Request) {
    const { id } = req.params;
    const updates = req.body;

    const updatedCollege = await collegeService.updateCollege(id, updates);

    return ApiResponse.ok({
      message: "College updated successfully",
      college: updatedCollege,
    });
  }

  @AsyncHandler()
  async deleteCollege(req: Request) {
    const { id } = req.params;

    await collegeService.deleteCollege(id);

    return ApiResponse.ok({
      message: "College deleted successfully",
    });
  }
}

export default new CollegeController();

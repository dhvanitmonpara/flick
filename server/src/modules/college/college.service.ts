import { ApiError } from "@/core/http";
import * as collegeRepo from "./college.repo";

class CollegeService {
  async createCollege(collegeData: {
    name: string;
    emailDomain: string;
    city: string;
    state: string;
    profile?: string;
  }) {
    // Check if college with this email domain already exists
    const existing = await collegeRepo.findByEmailDomain(collegeData.emailDomain);
    if (existing) {
      throw new ApiError({
        statusCode: 409,
        message: "College with this email domain already exists",
        code: "COLLEGE_ALREADY_EXISTS",
        data: { service: "CollegeService.createCollege" },
        errors: [
          {
            field: "emailDomain",
            message: "College with this email domain already exists",
          },
        ],
      });
    }

    const newCollege = await collegeRepo.create(collegeData);
    return newCollege;
  }

  async getColleges(filters?: { city?: string; state?: string }) {
    const colleges = await collegeRepo.findAll(filters);
    return colleges;
  }

  async getCollegeById(id: string) {
    const college = await collegeRepo.findById(id);
    if (!college) {
      throw new ApiError({
        statusCode: 404,
        message: "College not found",
        code: "COLLEGE_NOT_FOUND",
        data: { service: "CollegeService.getCollegeById" },
        errors: [{ field: "id", message: "College not found" }],
      });
    }
    return college;
  }

  async updateCollege(id: string, updates: {
    name?: string;
    emailDomain?: string;
    city?: string;
    state?: string;
    profile?: string;
  }) {
    // Check if college exists
    const existing = await collegeRepo.findById(id);
    if (!existing) {
      throw new ApiError({
        statusCode: 404,
        message: "College not found",
        code: "COLLEGE_NOT_FOUND",
        data: { service: "CollegeService.updateCollege" },
        errors: [{ field: "id", message: "College not found" }],
      });
    }

    // If updating email domain, check for conflicts
    if (updates.emailDomain && updates.emailDomain !== existing.emailDomain) {
      const emailConflict = await collegeRepo.findByEmailDomain(updates.emailDomain);
      if (emailConflict) {
        throw new ApiError({
          statusCode: 409,
          message: "College with this email domain already exists",
          code: "COLLEGE_ALREADY_EXISTS",
          data: { service: "CollegeService.updateCollege" },
          errors: [
            {
              field: "emailDomain",
              message: "College with this email domain already exists",
            },
          ],
        });
      }
    }

    const updatedCollege = await collegeRepo.updateById(id, updates);
    return updatedCollege;
  }

  async deleteCollege(id: string) {
    const existing = await collegeRepo.findById(id);
    if (!existing) {
      throw new ApiError({
        statusCode: 404,
        message: "College not found",
        code: "COLLEGE_NOT_FOUND",
        data: { service: "CollegeService.deleteCollege" },
        errors: [{ field: "id", message: "College not found" }],
      });
    }

    const deletedCollege = await collegeRepo.deleteById(id);
    return deletedCollege;
  }
}

export default new CollegeService();
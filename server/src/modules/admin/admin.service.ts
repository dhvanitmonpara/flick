import AdminRepo from "./admin.repo";
import logger from "@/core/logger";
import CollegeRepo from "@/modules/college/college.repo";
import { invalidateCollegeCaches } from "@/modules/college/college.cache-invalidation";

class AdminService {
  async getDashboardOverview() {
    logger.info("Fetching admin dashboard overview");
    const data = {
      users: 0,
      posts: 0,
      comments: 0,
    };
    logger.info("Admin dashboard overview fetched successfully");
    return data;
  }

  async getManageUsersQuery(username?: string, email?: string) {
    logger.info("Fetching manage users query", { username, email });
    const users = await AdminRepo.Read.getManageUsersQuery(username, email);
    logger.info("Manage users query fetched successfully", { count: users.length });
    return users;
  }

  async getReports(page: number, limit: number, statuses: string[]) {
    logger.info("Fetching reports", { page, limit, statuses });
    const reports = await AdminRepo.Read.getReports(page, limit, statuses);
    logger.info("Reports fetched successfully", { count: reports.data.length });
    return reports;
  }

  async getAllColleges() {
    logger.info("Fetching all colleges");
    const colleges = await AdminRepo.Read.getAllColleges();
    logger.info("All colleges fetched successfully", { count: colleges.length });
    return colleges;
  }

  async getLogs(page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc") {
    logger.info("Fetching logs", { page, limit, sortBy, sortOrder });
    const logs = await AdminRepo.Read.getLogs(page, limit, sortBy, sortOrder);
    logger.info("Logs fetched successfully", { count: logs.data.length });
    return logs;
  }

  async getAllFeedbacks() {
    logger.info("Fetching all feedbacks");
    const feedbacks = await AdminRepo.Read.getAllFeedbacks();
    logger.info("All feedbacks fetched successfully", { count: feedbacks.length });
    return feedbacks;
  }

  async createCollege(data: { name: string; emailDomain: string; city: string; state: string; profile?: string }) {
    logger.info("Creating new college", { name: data.name });
    const newCollege = await AdminRepo.Write.createCollege(data);

    await invalidateCollegeCaches({
      collegeId: newCollege.id,
      nextEmailDomain: newCollege.emailDomain,
    });

    logger.info("New college created successfully", { id: newCollege.id });
    return newCollege;
  }

  async updateCollege(id: string, updates: Partial<{ name: string; emailDomain: string; city: string; state: string; profile: string }>) {
    logger.info("Updating college", { id, updates });
    const existingCollege = await CollegeRepo.Read.findById(id);
    const updatedCollege = await AdminRepo.Write.updateCollege(id, updates);

    if (updatedCollege) {
      await invalidateCollegeCaches({
        collegeId: updatedCollege.id,
        previousEmailDomain: existingCollege?.emailDomain ?? null,
        nextEmailDomain: updatedCollege.emailDomain,
      });

      logger.info("College updated successfully", { id: updatedCollege.id });
    } else {
      logger.warn("Attempted to update non-existent college", { id });
    }

    return updatedCollege;
  }
}

export default new AdminService();

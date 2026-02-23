import AdminRepo from "./admin.repo";
import logger from "@/core/logger";

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
}

export default new AdminService();

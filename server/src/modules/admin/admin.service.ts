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
}

export default new AdminService();

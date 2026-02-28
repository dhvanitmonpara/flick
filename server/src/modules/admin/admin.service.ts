import cache from "@/infra/services/cache";
import AdminRepo from "./admin.repo";
import logger from "@/core/logger";
import collegeCacheKeys from "@/modules/college/college.cache-keys";

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

    // Invalidate the frontend's college cache
    const { default: cache } = await import("@/infra/services/cache");
    const { default: collegeCacheKeys } = await import("@/modules/college/college.cache-keys");

    await cache.del(collegeCacheKeys.all()); // clear "college:all:all:all"
    await cache.del(collegeCacheKeys.all({ city: data.city }));
    await cache.del(collegeCacheKeys.all({ state: data.state }));
    await cache.del(collegeCacheKeys.all({ city: data.city, state: data.state }));
    await cache.del(collegeCacheKeys.emailDomain(data.emailDomain));

    logger.info("New college created successfully", { id: newCollege.id });
    return newCollege;
  }

  async updateCollege(id: string, updates: Partial<{ name: string; emailDomain: string; city: string; state: string; profile: string }>) {
    logger.info("Updating college", { id, updates });
    const updatedCollege = await AdminRepo.Write.updateCollege(id, updates);

    if (updatedCollege) {
      await cache.del(collegeCacheKeys.all());
      if (updatedCollege.city) await cache.del(collegeCacheKeys.all({ city: updatedCollege.city }));
      if (updatedCollege.state) await cache.del(collegeCacheKeys.all({ state: updatedCollege.state }));
      if (updatedCollege.city || updatedCollege.state) await cache.del(collegeCacheKeys.all({ city: updatedCollege.city, state: updatedCollege.state }));
      if (updatedCollege.emailDomain) await cache.del(collegeCacheKeys.emailDomain(updatedCollege.emailDomain));

      logger.info("College updated successfully", { id: updatedCollege.id });
    } else {
      logger.warn("Attempted to update non-existent college", { id });
    }

    return updatedCollege;
  }
}

export default new AdminService();

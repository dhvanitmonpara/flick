import { HttpError } from "@/core/http";
import UserRepo from "@/modules/user/user.repo";
import logger from "@/core/logger";
import recordAudit from "@/lib/record-audit";
import AuthRepo from "../auth/auth.repo";

class UserService {
  getUserById = async (userId: string) => {
    logger.info("Fetching user by ID", { userId });

    const user = await UserRepo.CachedRead.findById(userId, {});

    if (!user) {
      logger.warn("User not found", { userId });
      throw HttpError.notFound("User doesn't exists", {
        meta: { source: "authService.getUserByIdService" },
      });
    }

    logger.info("User retrieved successfully", {
      userId,
      username: user.username,
    });
    return user;
  };

  searchUsers = async (query: string) => {
    logger.info("Searching users", { query });

    const users = await AuthRepo.CachedRead.searchUsers({
      query,
      limit: 10,
      collegeId: null,
      offset: 0,
    });

    logger.info("User search completed", { query, resultCount: users.length });
    return users;
  };

  acceptTerms = async (userId: string) => {
    await UserRepo.Write.updateById(userId, { isAcceptedTerms: true });

    recordAudit({
      action: "user:accepted:terms",
      entityId: userId.toString(),
      entityType: "user",
      before: { isAcceptedTerms: false },
      after: { isAcceptedTerms: true },
    });

    return true;
  };
}

export default new UserService();

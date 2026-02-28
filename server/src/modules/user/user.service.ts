import { HttpError } from "@/core/http";
import UserRepo from "@/modules/user/user.repo";
import logger from "@/core/logger";
import recordAudit from "@/lib/record-audit";
import AuthRepo from "../auth/auth.repo";

class UserService {
  getUserProfileById = async (userId: string) => {
    logger.info("Fetching user by ID", { userId });

    const user = await UserRepo.CachedRead.findById(userId, {});

    if (!user) {
      logger.warn("User not found", { userId });
      throw HttpError.notFound("User doesn't exists", {
        meta: { source: "authService.getUserProfileById" },
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

  getUserProfile = async (authId: string) => {
    return await UserRepo.CachedRead.findByAuthId(authId, {});
  }

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

  updateUserProfile = async (userId: string, updates: { branch: string }) => {
    logger.info("Updating user profile", { userId, updates });

    // We already check if user exists in the request middleware, but we can do a sanity check
    const existingUser = await UserRepo.CachedRead.findById(userId, {});
    if (!existingUser) {
      throw HttpError.notFound("User not found");
    }

    const updatedUser = await UserRepo.Write.updateById(userId, { branch: updates.branch });

    // Since we're modifying the DB directly, we should invalidate or trigger cache updates if necessary
    // Assuming cached responses will expire or are handled similarly to other places

    recordAudit({
      action: "other:action",
      entityId: userId,
      entityType: "user",
      before: { branch: existingUser.branch },
      after: { branch: updates.branch }
    });

    return updatedUser;
  }
}

export default new UserService();

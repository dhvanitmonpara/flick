import { HttpError } from "@/core/http";
import UserRepo from "@/modules/user/user.repo";
import logger from "@/core/logger";
import recordAudit from "@/lib/record-audit";
import AuthRepo from "../auth/auth.repo";
import cache from "@/infra/services/cache";

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

  acceptTerms = async (userId: string, authId: string) => {
    await UserRepo.Write.updateById(userId, { isAcceptedTerms: true });

    await cache.del(`user:authId:${authId}`)

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

    recordAudit({
      action: "other:action",
      entityId: userId,
      entityType: "user",
      before: { branch: existingUser.branch },
      after: { branch: updates.branch }
    });

    return updatedUser;
  }

  blockUser = async (requestingUserId: string, targetUserId: string) => {
    if (requestingUserId === targetUserId) {
      throw HttpError.badRequest("You cannot block yourself");
    }

    const requester = await UserRepo.Read.findById(requestingUserId, {});
    if (!requester) throw HttpError.notFound("Requesting user not found");

    const target = await UserRepo.Read.findById(targetUserId, {});
    if (!target) throw HttpError.notFound("Target user not found");

    await UserRepo.Write.createBlock(requester.authId, target.authId);

    logger.info("User blocked", { blockerId: requestingUserId, blockedId: targetUserId });
    return { blocked: true };
  };

  unblockUser = async (requestingUserId: string, targetUserId: string) => {
    const requester = await UserRepo.Read.findById(requestingUserId, {});
    if (!requester) throw HttpError.notFound("Requesting user not found");

    const target = await UserRepo.Read.findById(targetUserId, {});
    if (!target) throw HttpError.notFound("Target user not found");

    await UserRepo.Write.removeBlock(requester.authId, target.authId);

    logger.info("User unblocked", { blockerId: requestingUserId, blockedId: targetUserId });
    return { blocked: false };
  };

  getBlockedUsers = async (userId: string) => {
    const user = await UserRepo.Read.findById(userId, {});
    if (!user) throw HttpError.notFound("User not found");

    const blocked = await UserRepo.Blocks.getBlockedUsers(user.authId);
    return blocked;
  };
}

export default new UserService();

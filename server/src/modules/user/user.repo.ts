import * as userAdapter from "@/infra/db/adapters/user.adapter";
import { cached } from "@/lib/cached";
import { DB } from "@/infra/db/types";
import userCacheKeys from "./user.cache-keys";

const UserRepo = {
  Read: {
    findById: (userId: string, include: userAdapter.UserInclude, dbTx?: DB) => userAdapter.findById(userId, include, dbTx),

    findByEmail: (email: string, include: userAdapter.UserInclude, dbTx?: DB) => userAdapter.findByAuthId(email, include, dbTx),

    findByAuthId: (authId: string, include: userAdapter.UserInclude, dbTx?: DB) => userAdapter.findByAuthId(authId, include, dbTx),

    findByLookupEmail: (username: string, include: userAdapter.UserInclude, dbTx?: DB) => userAdapter.findByUsername(username, include, dbTx),
  },

  CachedRead: {
    findById: (userId: string, include: userAdapter.UserInclude, dbTx?: DB) =>
      cached(userCacheKeys.id(userId), () => userAdapter.findById(userId, include, dbTx)),

    findByAuthId: (authId: string, include: userAdapter.UserInclude, dbTx?: DB) =>
      cached(userCacheKeys.authId(authId), () => userAdapter.findByAuthId(authId, include, dbTx)),

    findByEmail: (email: string, include: userAdapter.UserInclude, dbTx?: DB) =>
      cached(userCacheKeys.email(email), () => userAdapter.findByAuthId(email, include, dbTx)),

    findByUsername: (username: string, include: userAdapter.UserInclude, dbTx?: DB) =>
      cached(userCacheKeys.username(username), () =>
        userAdapter.findByUsername(username, include, dbTx)
      ),
  },

  Write: {
    create: userAdapter.create,
    updateById: userAdapter.updateById,
    updateKarma: userAdapter.updateKarma,
    delete: userAdapter.deleteById,
    createBlock: userAdapter.createBlock,
    removeBlock: userAdapter.removeBlock,
  },

  Blocks: {
    getBlockedUsers: userAdapter.getBlockedUsers,
    hasBlockRelation: userAdapter.hasBlockRelation,
    getBlockedUserIdsInEitherDirection: userAdapter.getBlockedUserIdsInEitherDirection,
  }
}

export default UserRepo

import * as authAdapter from "@/infra/db/adapters/auth.adapter";
import { cached } from "@/lib/cached";
import { DB } from "@/infra/db/types";
import authCacheKeys from "./auth.cache-keys";

const AuthRepo = {
  Read: {
    findById: (userId: string, dbTx?: DB) => authAdapter.findById(userId, dbTx),

    findByEmail: (email: string, dbTx?: DB) => authAdapter.findByEmail(email, dbTx),

    findByLookupEmail: (lookupEmail: string, dbTx?: DB) => authAdapter.findByLookupEmail(lookupEmail, dbTx),

    searchUsers: (options: authAdapter.SearchUsersOptions, dbTx?: DB) => authAdapter.searchUsers(options, dbTx),
  },

  CachedRead: {
    findById: (userId: string, dbTx?: DB) =>
      cached(authCacheKeys.id(userId), () => authAdapter.findById(userId, dbTx)),

    findByEmail: (email: string, dbTx?: DB) =>
      cached(authCacheKeys.email(email), () => authAdapter.findByEmail(email, dbTx)),

    findByLookupEmail: (lookupEmail: string, dbTx?: DB) =>
      cached(authCacheKeys.email(lookupEmail), () => authAdapter.findByLookupEmail(lookupEmail, dbTx)),

    searchUsers: (options: authAdapter.SearchUsersOptions, dbTx?: DB) =>
      cached(authCacheKeys.search(options.query), () => authAdapter.searchUsers(options, dbTx)),
  },

  Write: {
    create: authAdapter.create,
  }
}

export default AuthRepo
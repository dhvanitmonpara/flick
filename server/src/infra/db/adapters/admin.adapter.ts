import { and, eq, ilike } from "drizzle-orm";
import db from "@/infra/db/index";
import type { DB } from "@/infra/db/types";
import { users, auth, colleges } from "../tables";

export const getManageUsersQuery = async (username?: string, email?: string, dbTx?: DB) => {
  const client = dbTx ?? db;

  const queryFilters = [];
  if (username) {
    queryFilters.push(ilike(users.username, `%${username}%`));
  }
  if (email) {
    queryFilters.push(ilike(auth.email, `%${email}%`));
  }

  const fetchedUsers = await client
    .select({
      _id: users.id,
      username: users.username,
      email: auth.email,
      branch: users.branch,
      college: {
        id: colleges.id,
        profile: colleges.profile
      },
      isBlocked: auth.banned,
      suspensionEnds: auth.banExpires,
      suspensionReason: auth.banReason
    })
    .from(users)
    .leftJoin(auth, eq(users.authId, auth.id))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(queryFilters.length > 0 ? and(...queryFilters) : undefined);

  const formattedUsers = fetchedUsers.map(user => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    branch: user.branch,
    college: user.college,
    isBlocked: user.isBlocked ?? false,
    suspension: {
      ends: user.suspensionEnds,
      reason: user.suspensionReason,
      howManyTimes: 0,
    }
  }));

  return formattedUsers;
};

import { and, eq, ilike, or, sql } from "drizzle-orm";
import db from "@/infra/db";
import type { DB } from "@/infra/db/types";
import { auth, colleges, users } from "@/infra/db/tables";
import { userBlocks } from "@/infra/db/tables/user-block.table";
export type UserInclude = {
  auth?: boolean;
  college?: boolean;
};

export const findById = async (
  userId: string,
  include: UserInclude = {},
  dbTx?: DB
) => {
  const client = dbTx ?? db;
  if (include.auth && include.college) {
    return client.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        college: true,
        auth: {
          columns: {
            id: true,
            emailVerified: true,
            role: true,
            banned: true,
          },
        },
      },
    });
  }

  if (include.auth) {
    return client.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        auth: {
          columns: {
            id: true,
            emailVerified: true,
            role: true,
            banned: true,
          },
        },
      },
    });
  }

  if (include.college) {
    return client.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        college: true,
      },
    });
  }

  return client.query.users.findFirst({
    where: eq(users.id, userId),
  });
};

export const findByAuthId = async (
  authId: string,
  include: UserInclude = {},
  dbTx?: DB
) => {
  const client = dbTx ?? db;
  if (include.auth && include.college) {
    return client.query.users.findFirst({
      where: eq(users.authId, authId),
      with: {
        college: true,
        auth: {
          columns: {
            id: true,
            emailVerified: true,
            role: true,
            banned: true,
          },
        },
      },
    });
  }

  if (include.auth) {
    return client.query.users.findFirst({
      where: eq(users.authId, authId),
      with: {
        auth: {
          columns: {
            id: true,
            emailVerified: true,
            role: true,
            banned: true,
          },
        },
      },
    });
  }

  if (include.college) {
    return client.query.users.findFirst({
      where: eq(users.authId, authId),
      with: {
        college: true,
      },
    });
  }

  return client.query.users.findFirst({
    where: eq(users.authId, authId),
  });
};

export const findByUsername = async (
  username: string,
  include: UserInclude = {},
  dbTx?: DB
) => {
  const client = dbTx ?? db;
  if (include.auth && include.college) {
    return client.query.users.findFirst({
      where: eq(users.username, username.toLowerCase()),
      with: {
        college: true,
        auth: {
          columns: {
            id: true,
            emailVerified: true,
            role: true,
            banned: true,
          },
        },
      },
    });
  }

  if (include.auth) {
    return client.query.users.findFirst({
      where: eq(users.username, username.toLowerCase()),
      with: {
        auth: {
          columns: {
            id: true,
            emailVerified: true,
            role: true,
            banned: true,
          },
        },
      },
    });
  }

  if (include.college) {
    return client.query.users.findFirst({
      where: eq(users.username, username.toLowerCase()),
      with: {
        college: true,
      },
    });
  }

  return client.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
  });
};

export const create = async (
  data: typeof users.$inferInsert,
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const [created] = await client
    .insert(users)
    .values({
      ...data,
      username: data.username.toLowerCase(),
    })
    .returning();

  return created;
};

export const deleteById = async (userId: string, dbTx?: DB) => {
  const client = dbTx ?? db;

  const [deleted] = await client
    .delete(users)
    .where(eq(users.id, userId))
    .returning();

  return deleted ?? null;
};

export const updateKarma = async (
  karmaChange: number,
  userId: string,
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const [updated] = await client
    .update(users)
    .set({
      karma: sql`${users.karma} + ${karmaChange}`,
    })
    .where(eq(users.id, userId))
    .returning({ karma: users.karma });

  return updated ?? null;
};

export const updateById = async (
  userId: string,
  updates: Partial<Omit<typeof users.$inferInsert, "authId" | "karma">>,
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const [updated] = await client
    .update(users)
    .set({
      ...updates,
      ...(updates.username && {
        username: updates.username.toLowerCase(),
      }),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated ?? null;
};

type ModerationUser = {
  id: string;
  username: string;
  email: string | null;
  roles: string | null;
  isBlocked: boolean;
  suspension: {
    ends: Date | null;
    reason: string | null;
  } | null;
  college: {
    id: string | null;
    name: string | null;
    profile: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

const toModerationUser = (row: {
  id: string;
  username: string;
  email: string | null;
  role: string | null;
  isBlocked: boolean | null;
  banEnds: Date | null;
  banReason: string | null;
  collegeId: string | null;
  collegeName: string | null;
  collegeProfile: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ModerationUser => ({
  id: row.id,
  username: row.username,
  email: row.email,
  roles: row.role,
  isBlocked: row.isBlocked ?? false,
  suspension: row.banEnds || row.banReason
    ? {
      ends: row.banEnds,
      reason: row.banReason,
    }
    : null,
  college: row.collegeId
    ? {
      id: row.collegeId,
      name: row.collegeName,
      profile: row.collegeProfile,
    }
    : null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const getModerationUserRow = async (userId: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const rows = await client
    .select({
      id: users.id,
      username: users.username,
      email: auth.email,
      role: auth.role,
      isBlocked: auth.banned,
      banEnds: auth.banExpires,
      banReason: auth.banReason,
      collegeId: colleges.id,
      collegeName: colleges.name,
      collegeProfile: colleges.profile,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      authId: users.authId,
    })
    .from(users)
    .leftJoin(auth, eq(users.authId, auth.id))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(eq(users.id, userId))
    .limit(1);

  return rows[0] ?? null;
};

export const findModerationById = async (userId: string, dbTx?: DB) => {
  const row = await getModerationUserRow(userId, dbTx);
  if (!row) return null;
  return toModerationUser(row);
};

export const blockUser = async (userId: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const row = await getModerationUserRow(userId, client);
  if (!row) return null;

  await client
    .update(auth)
    .set({
      banned: true,
      banReason: null,
      banExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(auth.id, row.authId));

  return findModerationById(userId, client);
};

export const unblockUser = async (userId: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const row = await getModerationUserRow(userId, client);
  if (!row) return null;

  await client
    .update(auth)
    .set({
      banned: false,
      banReason: null,
      banExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(auth.id, row.authId));

  return findModerationById(userId, client);
};

export const suspendUser = async (
  userId: string,
  suspension: { ends: Date; reason: string },
  dbTx?: DB
) => {
  const client = dbTx ?? db;
  const row = await getModerationUserRow(userId, client);
  if (!row) return null;

  await client
    .update(auth)
    .set({
      banned: true,
      banReason: suspension.reason,
      banExpires: suspension.ends,
      updatedAt: new Date(),
    })
    .where(eq(auth.id, row.authId));

  return findModerationById(userId, client);
};

export const getSuspensionStatus = async (userId: string, dbTx?: DB) => {
  const user = await findModerationById(userId, dbTx);
  if (!user) return null;
  return { suspension: user.suspension };
};

export const findByQuery = async (
  filters: { email?: string; username?: string },
  dbTx?: DB
) => {
  const client = dbTx ?? db;
  const conditions = [];

  if (filters.email) {
    conditions.push(ilike(auth.email, `%${filters.email.trim()}%`));
  }
  if (filters.username) {
    conditions.push(ilike(users.username, `%${filters.username.trim().toLowerCase()}%`));
  }

  const rows = await client
    .select({
      id: users.id,
      username: users.username,
      email: auth.email,
      role: auth.role,
      isBlocked: auth.banned,
      banEnds: auth.banExpires,
      banReason: auth.banReason,
      collegeId: colleges.id,
      collegeName: colleges.name,
      collegeProfile: colleges.profile,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(auth, eq(users.authId, auth.id))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(conditions.length ? and(...conditions) : undefined);

  return rows.map(toModerationUser);
};

export const createBlock = async (blockerId: string, blockedId: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const [created] = await client
    .insert(userBlocks)
    .values({
      blockerId,
      blockedId,
    })
    .onConflictDoNothing()
    .returning();
  return created ?? null;
};

export const removeBlock = async (blockerId: string, blockedId: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const [deleted] = await client
    .delete(userBlocks)
    .where(
      and(
        eq(userBlocks.blockerId, blockerId),
        eq(userBlocks.blockedId, blockedId)
      )
    )
    .returning();
  return deleted ?? null;
};

export const getBlockedUsers = async (blockerId: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const blocks = await client
    .select({
      id: users.id,
      username: users.username,
      authId: users.authId,
      collegeId: users.collegeId,
      branch: users.branch,
      college: {
        id: colleges.id,
        name: colleges.name,
      }
    })
    .from(userBlocks)
    .innerJoin(users, eq(userBlocks.blockedId, users.authId))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(eq(userBlocks.blockerId, blockerId));

  return blocks;
};

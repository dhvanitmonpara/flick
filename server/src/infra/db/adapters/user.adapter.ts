import { eq, sql } from "drizzle-orm";
import db from "@/infra/db";
import type { DB } from "@/infra/db/types";
import { users } from "@/infra/db/tables";

export type UserInclude = {
  auth?: boolean;
  college?: boolean;
};

const buildWith = (include: UserInclude) => ({
  college: include.college ? true : undefined,

  auth: include.auth
    ? {
      columns: {
        id: true,
        emailVerified: true,
        role: true,
        banned: true,
      },
    }
    : undefined,
});

export const findById = async (
  userId: string,
  include: UserInclude = {},
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  return client.query.users.findFirst({
    where: eq(users.id, userId),
    with: buildWith(include),
  });
};

export const findByAuthId = async (
  authId: string,
  include: UserInclude = {},
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  return client.query.users.findFirst({
    where: eq(users.authId, authId),
    with: buildWith(include),
  });
};

export const findByUsername = async (
  username: string,
  include: UserInclude = {},
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  return client.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
    with: buildWith(include),
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

import { eq } from "drizzle-orm";
import db from "@/infra/db";
import type { DB } from "@/infra/db/types";
import { auth } from "@/infra/db/tables/auth.table";

export const findById = async (authId: string, dbTx?: DB) => {
  const client = dbTx ?? db;

  return client.query.auth.findFirst({
    where: eq(auth.id, authId),
  });
};

export const findByEmail = async (email: string, dbTx?: DB) => {
  const client = dbTx ?? db;

  return client.query.auth.findFirst({
    where: eq(auth.email, email.toLowerCase()),
  });
};

export const findByLookupEmail = async (lookupEmail: string, dbTx?: DB) => {
  const client = dbTx ?? db;

  return client.query.auth.findFirst({
    where: eq(auth.lookupEmail, lookupEmail),
  });
};

export const create = async (
  data: typeof auth.$inferInsert,
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const [created] = await client.insert(auth).values(data).returning();
  return created;
};

export type SearchUsersOptions = {
  query: string;
  limit?: number;
  offset?: number;
  collegeId?: string;
};

export const searchUsers = async (
  options: SearchUsersOptions,
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const {
    query,
    limit = 10,
    offset = 0,
    collegeId,
  } = options;

  const normalizedQuery = query.toLowerCase();

  return client.query.users.findMany({
    where: (u, { and, sql, eq }) => {
      const conditions = [
        sql`LOWER(${u.username}) LIKE ${`%${normalizedQuery}%`}`,
      ];

      // Optional college filter
      if (collegeId) {
        conditions.push(eq(u.collegeId, collegeId));
      }

      return and(...conditions);
    },

    columns: {
      id: true,
      username: true,
      karma: true,
      collegeId: true,
    },

    limit,
    offset,
  });
};

import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import db from "@/infra/db";
import type { DB } from "@/infra/db/types";
import { auth, platformUser } from "@/infra/db/tables/auth.table";

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

export const create = async (
  data: typeof auth.$inferInsert,
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const [created] = await client.insert(auth).values(data).returning();
  return created;
};

export const update = async (
  authId: string,
  data: Partial<typeof auth.$inferInsert>,
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const [updated] = await client
    .update(auth)
    .set(data)
    .where(eq(auth.id, authId))
    .returning();
  return updated;
};

export type SearchUsersOptions = {
  query: string;
  limit?: number;
  offset?: number;
  collegeId?: string;
};

export type AdminUsersQueryOptions = {
  query?: string;
  limit?: number;
  offset?: number;
  roles?: string[];
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

export const listUsersForAdmin = async (
  options: AdminUsersQueryOptions,
  dbTx?: DB,
) => {
  const client = dbTx ?? db;
  const {
    query,
    limit = 20,
    offset = 0,
    roles,
  } = options;

  const conditions = [];

  if (query?.trim()) {
    const normalizedQuery = query.trim().toLowerCase();
    conditions.push(
      or(
        ilike(auth.email, `%${normalizedQuery}%`),
        ilike(platformUser.username, `%${normalizedQuery}%`),
      ),
    );
  }

  if (roles && roles.length > 0) {
    conditions.push(inArray(auth.role, roles));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await client
    .select({
      authId: auth.id,
      role: auth.role,
      email: auth.email,
      emailVerified: auth.emailVerified,
      banned: auth.banned,
      banReason: auth.banReason,
      banExpires: auth.banExpires,
      createdAt: auth.createdAt,
      updatedAt: auth.updatedAt,
      userId: platformUser.id,
      username: platformUser.username,
      collegeId: platformUser.collegeId,
      branch: platformUser.branch,
      karma: platformUser.karma,
      isAcceptedTerms: platformUser.isAcceptedTerms,
    })
    .from(auth)
    .leftJoin(platformUser, eq(platformUser.authId, auth.id))
    .where(whereClause)
    .orderBy(desc(auth.createdAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await client
    .select({ total: count() })
    .from(auth)
    .leftJoin(platformUser, eq(platformUser.authId, auth.id))
    .where(whereClause);

  return {
    users: rows,
    total: totalResult[0]?.total ?? 0,
    limit,
    offset,
  };
};

export const listAdmins = async (
  options: Omit<AdminUsersQueryOptions, "roles">,
  dbTx?: DB,
) => {
  return listUsersForAdmin(
    { ...options, roles: ["admin", "superadmin"] },
    dbTx,
  );
};

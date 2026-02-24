import { and, eq, ilike, inArray, desc, asc, sql } from "drizzle-orm";
import db from "@/infra/db/index";
import type { DB } from "@/infra/db/types";
import { users, auth, colleges, contentReports, posts, comments, auditLogs, feedbacks } from "../tables";

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
      id: users.id,
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
    id: user.id,
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

export const getReports = async (page: number, limit: number, statuses: string[], dbTx?: DB) => {
  const client = dbTx ?? db;

  const rawReports = await client
    .select({
      id: contentReports.id,
      type: contentReports.type,
      postId: contentReports.postId,
      commentId: contentReports.commentId,
      reason: contentReports.reason,
      status: contentReports.status,
      message: contentReports.message,
      createdAt: contentReports.createdAt,
      reporterId: users.id,
      reporterUsername: users.username,
      reporterIsBlocked: auth.banned,
      reporterBanExpires: auth.banExpires,
      reporterBanReason: auth.banReason,
      postTitle: posts.title,
      postContent: posts.content,
      postAuthor: posts.postedBy,
      postIsBanned: posts.isBanned,
      postIsShadowBanned: posts.isShadowBanned,
      commentContent: comments.content,
      commentAuthor: comments.commentedBy,
      commentIsBanned: comments.isBanned,
    })
    .from(contentReports)
    .leftJoin(users, eq(contentReports.reportedBy, users.id))
    .leftJoin(auth, eq(users.authId, auth.id))
    .leftJoin(posts, eq(contentReports.postId, posts.id))
    .leftJoin(comments, eq(contentReports.commentId, comments.id))
    .where(statuses && statuses.length > 0 ? inArray(contentReports.status, statuses as any) : undefined)
    .orderBy(desc(contentReports.createdAt));

  const grouped = new Map<string, any>();

  for (const r of rawReports) {
    const targetId = (r.type === 'Post' ? r.postId : r.commentId) as string;
    if (!targetId) continue;

    if (!grouped.has(targetId)) {
      grouped.set(targetId, {
        targetDetails: {
          id: targetId,
          title: r.type === 'Post' ? r.postTitle : '',
          content: r.type === 'Post' ? r.postContent : r.commentContent,
          postedBy: r.type === 'Post' ? r.postAuthor : r.commentAuthor,
          isBanned: r.type === 'Post' ? r.postIsBanned : r.commentIsBanned,
          isShadowBanned: r.type === 'Post' ? r.postIsShadowBanned : false,
        },
        type: r.type,
        reports: [],
      });
    }

    const group = grouped.get(targetId);
    group.reports.push({
      id: r.id,
      reason: r.reason,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt?.toISOString(),
      reporter: {
        id: r.reporterId,
        username: r.reporterUsername,
        isBlocked: r.reporterIsBlocked,
        suspension: {
          ends: r.reporterBanExpires?.toISOString() || null,
          reason: r.reporterBanReason || null,
          howManyTimes: 0,
        },
      },
    });
  }

  const allTargets = Array.from(grouped.values());
  const offset = (page - 1) * limit;
  const paginated = allTargets.slice(offset, offset + limit);

  return {
    data: paginated,
    pagination: {
      totalReports: allTargets.length,
      page,
      limit,
    }
  };
};

export const getAllColleges = async (dbTx?: DB) => {
  const client = dbTx ?? db;

  const fetchedColleges = await client
    .select({
      id: colleges.id,
      name: colleges.name,
      profile: colleges.profile,
      emailDomain: colleges.emailDomain,
      city: colleges.city,
      state: colleges.state,
    })
    .from(colleges);

  return fetchedColleges;
};

export const getLogs = async (page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc", dbTx?: DB) => {
  const client = dbTx ?? db;

  let orderByColumn: any = auditLogs.occuredAt;
  if (sortBy === "action") orderByColumn = auditLogs.action;
  else if (sortBy === "timestamp" || sortBy === "createdAt") orderByColumn = auditLogs.occuredAt;
  else if (sortBy === "platform") orderByColumn = auditLogs.userAgent;
  else if (sortBy === "status") orderByColumn = auditLogs.reason;

  const orderDirection = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  const rawLogs = await client
    .select()
    .from(auditLogs)
    .orderBy(orderDirection)
    .limit(limit)
    .offset((page - 1) * limit);

  const [{ count }] = await client.select({ count: sql<number>`count(*)` }).from(auditLogs);

  const data = rawLogs.map((log) => ({
    id: log.id,
    action: log.action,
    platform: log.userAgent || "System",
    status: log.reason ? "Failed" : "Success",
    timestamp: log.occuredAt?.toISOString(),
    userId: log.actorId,
    metadata: Array.isArray(log.metadata)
      ? log.metadata
      : (log.metadata ? [log.metadata] : []),
  }));

  return {
    data,
    pagination: {
      total: Number(count),
      page,
      limit,
      pages: Math.ceil(Number(count) / limit)
    }
  };
};

export const getAllFeedbacks = async (dbTx?: DB) => {
  const client = dbTx ?? db;

  const rawFeedback = await client
    .select({
      id: feedbacks.id,
      type: feedbacks.type,
      title: feedbacks.title,
      content: feedbacks.content,
      status: feedbacks.status,
      userId: users.id,
      userName: users.username,
      userEmail: auth.email,
    })
    .from(feedbacks)
    .leftJoin(users, eq(feedbacks.userId, users.id))
    .leftJoin(auth, eq(users.authId, auth.id))
    .orderBy(desc(feedbacks.createdAt));

  const data = rawFeedback.map((fb) => ({
    id: fb.id,
    userId: {
      id: fb.userId || "",
      name: fb.userName || "Unknown",
      email: fb.userEmail || "Unknown",
    },
    type: fb.type as "feedback" | "bug",
    title: fb.title,
    content: fb.content,
    status: fb.status as "new" | "reviewed" | "dismissed",
  }));

  return data;
};

export const createCollege = async (data: { name: string; emailDomain: string; city: string; state: string }, dbTx?: DB) => {
  const client = dbTx ?? db;
  const [newCollege] = await client.insert(colleges).values(data).returning();

  return {
    id: newCollege.id,
    name: newCollege.name,
    emailDomain: newCollege.emailDomain,
    city: newCollege.city,
    state: newCollege.state,
    profile: newCollege.profile,
  };
};

export const updateCollege = async (id: string, updates: Partial<typeof colleges.$inferInsert>, dbTx?: DB) => {
  const client = dbTx ?? db;
  const [updatedCollege] = await client
    .update(colleges)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(colleges.id, id))
    .returning();

  if (!updatedCollege) return null;

  return {
    id: updatedCollege.id,
    name: updatedCollege.name,
    emailDomain: updatedCollege.emailDomain,
    city: updatedCollege.city,
    state: updatedCollege.state,
    profile: updatedCollege.profile,
  };
};

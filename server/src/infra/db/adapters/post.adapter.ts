import { and, desc, eq, sql, asc, or, notExists } from "drizzle-orm";
import db from "@/infra/db/index";
import type { DB } from "@/infra/db/types";
import { posts, users, colleges, votes, bookmarks, comments } from "../tables";
import { userBlocks } from "../tables/user-block.table";

export const findById = async (id: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const post = await client.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  return post || null;
};

export const findAuthorId = async (id: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const result = await client
    .select({ postedBy: posts.postedBy })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  return result[0]?.postedBy || null;
};

export const findByIdWithDetails = async (
  id: string,
  userId?: string,
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const voteAgg = client.$with("vote_agg").as(
    client
      .select({
        targetId: votes.targetId, // Let Drizzle handle the column reference
        upvoteCount: sql<number>`
          (COUNT(*) FILTER (WHERE ${votes.voteType}::text = 'upvote'))::int
        `.as("upvoteCount"),
        downvoteCount: sql<number>`
          (COUNT(*) FILTER (WHERE ${votes.voteType}::text = 'downvote'))::int
        `.as("downvoteCount"),
        userVote: userId
          ? sql<string | null>`
              MAX(
                CASE
                  WHEN ${votes.userId} = ${userId}
                  THEN ${votes.voteType}::text
                END
              )
            `.as("userVote")
          : sql<null>`NULL::text`.as("userVote"),
      })
      .from(votes)
      .where(sql`${votes.targetType}::text = 'post'`)
      .groupBy(votes.targetId)
  );

  const commentCount = client.$with("comment_count").as(
    client
      .select({
        postId: comments.postId, // Let Drizzle handle the column reference
        count: sql<number>`COUNT(*)::int`.as("count"),
      })
      .from(comments)
      .where(eq(comments.isBanned, false))
      .groupBy(comments.postId)
  );

  const bookmarkCheck = client.$with("bookmark_check").as(
    client
      .select({
        postId: bookmarks.postId, // Let Drizzle handle the column reference
        bookmarked: sql<boolean>`TRUE::boolean`.as("bookmarked"),
      })
      .from(bookmarks)
      .where(userId ? eq(bookmarks.userId, userId) : sql`FALSE`)
  );

  const result = await client
    .with(voteAgg, commentCount, bookmarkCheck)
    .select({
      postId: posts.id,
      title: posts.title,
      content: posts.content,
      topic: posts.topic,
      isPrivate: posts.isPrivate,
      views: posts.views,
      isBanned: posts.isBanned,
      isShadowBanned: posts.isShadowBanned,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      upvoteCount: sql<number>`COALESCE(${voteAgg.upvoteCount}, 0)`.as("upvoteCount"),
      downvoteCount: sql<number>`COALESCE(${voteAgg.downvoteCount}, 0)`.as("downvoteCount"),
      userVote: voteAgg.userVote,
      commentsCount: sql<number>`COALESCE(${commentCount.count}, 0)`.as("commentsCount"),
      bookmarked: sql<boolean>`COALESCE(${bookmarkCheck.bookmarked}, false)`.as("bookmarked"),
      authorId: users.id,
      authorUsername: users.username,
      authorBranch: users.branch,
      collegeId: colleges.id,
      collegeName: colleges.name,
      collegeProfile: colleges.profile,
      collegeEmail: colleges.emailDomain,
    })
    .from(posts)
    // Use the explicit properties defined in the CTEs above
    .leftJoin(voteAgg, eq(voteAgg.targetId, posts.id))
    .leftJoin(commentCount, eq(commentCount.postId, posts.id))
    .leftJoin(bookmarkCheck, eq(bookmarkCheck.postId, posts.id))
    .leftJoin(users, eq(posts.postedBy, users.id))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(
      and(
        eq(posts.id, id),
        eq(posts.isBanned, false),
        eq(posts.isShadowBanned, false)
      )
    )
    .limit(1);

  const row = result[0];
  if (!row) return null;

  return {
    id: row.postId,
    title: row.title,
    content: row.content,
    topic: row.topic,
    isPrivate: row.isPrivate,
    views: row.views,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    upvoteCount: row.upvoteCount,
    downvoteCount: row.downvoteCount,
    userVote: row.userVote,
    commentsCount: row.commentsCount,
    bookmarked: row.bookmarked,

    postedBy: row.authorId
      ? {
        id: row.authorId,
        username: row.authorUsername,
        branch: row.authorBranch,
        college: row.collegeId
          ? {
            id: row.collegeId,
            name: row.collegeName,
            profile: row.collegeProfile,
          }
          : null,
      }
      : null,
  };
};

export const findMany = async (
  options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "views";
    sortOrder?: "asc" | "desc";
    topic?: string;
    collegeId?: string;
    branch?: string;
    userId?: string;
    userCollegeId?: string;
    authorId?: string;
    blockerAuthId?: string;
  },
  dbTx?: DB
) => {
  const client = dbTx ?? db;
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const sortBy = options?.sortBy || "createdAt";
  const sortOrder = options?.sortOrder || "desc";
  const userId = options?.userId;

  const voteAgg = client.$with("vote_agg").as(
    client
      .select({
        targetId: votes.targetId, // Let Drizzle handle the column reference
        upvoteCount: sql<number>`
          (COUNT(*) FILTER (WHERE ${votes.voteType}::text = 'upvote'))::int
        `.as("upvoteCount"),
        downvoteCount: sql<number>`
          (COUNT(*) FILTER (WHERE ${votes.voteType}::text = 'downvote'))::int
        `.as("downvoteCount"),
        userVote: userId
          ? sql<string | null>`
              MAX(
                CASE
                  WHEN ${votes.userId} = ${userId}
                  THEN ${votes.voteType}::text
                END
              )
            `.as("userVote")
          : sql<null>`NULL::text`.as("userVote"),
      })
      .from(votes)
      .where(sql`${votes.targetType}::text = 'post'`)
      .groupBy(votes.targetId)
  );

  const commentCount = client.$with("comment_count").as(
    client
      .select({
        postId: comments.postId, // Let Drizzle handle the column reference
        count: sql<number>`COUNT(*)::int`.as("count"),
      })
      .from(comments)
      .where(eq(comments.isBanned, false))
      .groupBy(comments.postId)
  );

  const bookmarkCheck = client.$with("bookmark_check").as(
    client
      .select({
        postId: bookmarks.postId, // Let Drizzle handle the column reference
        bookmarked: sql<boolean>`TRUE::boolean`.as("bookmarked"),
      })
      .from(bookmarks)
      .where(userId ? eq(bookmarks.userId, userId) : sql`FALSE`)
  );

  const whereConditions = [
    eq(posts.isBanned, false),
    eq(posts.isShadowBanned, false),
  ];

  if (options?.userCollegeId) {
    whereConditions.push(
      or(
        eq(posts.isPrivate, false),
        and(
          eq(posts.isPrivate, true),
          eq(users.collegeId, options.userCollegeId)
        )
      )!
    );
  } else {
    // Unauthenticated users only see public posts
    whereConditions.push(eq(posts.isPrivate, false));
  }

  if (options?.topic) {
    whereConditions.push(eq(posts.topic, options.topic as any));
  }

  if (options?.collegeId) {
    whereConditions.push(eq(colleges.id, options.collegeId));
  }

  if (options?.branch) {
    whereConditions.push(eq(users.branch, options.branch));
  }

  if (options?.authorId) {
    whereConditions.push(eq(posts.postedBy, options.authorId));
  }

  if (options?.blockerAuthId) {
    // Exclude posts from users who are blocked by or have blocked the requester
    whereConditions.push(
      notExists(
        db.select({ id: userBlocks.id })
          .from(userBlocks)
          .where(
            or(
              and(
                eq(userBlocks.blockerId, options.blockerAuthId),
                eq(userBlocks.blockedId, users.authId)
              ),
              and(
                eq(userBlocks.blockerId, users.authId),
                eq(userBlocks.blockedId, options.blockerAuthId)
              )
            )
          )
      )
    );
  }

  const orderBy = sortOrder === "asc" ? asc(posts[sortBy]) : desc(posts[sortBy]);

  const results = await client
    .with(voteAgg, commentCount, bookmarkCheck)
    .select({
      postId: posts.id,
      title: posts.title,
      content: posts.content,
      topic: posts.topic,
      isPrivate: posts.isPrivate,
      views: posts.views,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      upvoteCount: sql<number>`COALESCE(${voteAgg.upvoteCount}, 0)`.as("upvoteCount"),
      downvoteCount: sql<number>`COALESCE(${voteAgg.downvoteCount}, 0)`.as("downvoteCount"),
      userVote: voteAgg.userVote,
      commentsCount: sql<number>`COALESCE(${commentCount.count}, 0)`.as("commentsCount"),
      bookmarked: sql<boolean>`COALESCE(${bookmarkCheck.bookmarked}, false)`.as("bookmarked"),
      authorId: users.id,
      authorUsername: users.username,
      authorBranch: users.branch,
      collegeId: colleges.id,
      collegeName: colleges.name,
      collegeProfile: colleges.profile,
      collegeEmail: colleges.emailDomain,
    })
    .from(posts)
    // Use the explicit properties defined in the CTEs above
    .leftJoin(voteAgg, eq(voteAgg.targetId, posts.id))
    .leftJoin(commentCount, eq(commentCount.postId, posts.id))
    .leftJoin(bookmarkCheck, eq(bookmarkCheck.postId, posts.id))
    .leftJoin(users, eq(posts.postedBy, users.id))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit);

  return results.map((row) => ({
    id: row.postId,
    title: row.title,
    content: row.content,
    topic: row.topic,
    isPrivate: row.isPrivate,
    views: row.views,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    upvoteCount: row.upvoteCount,
    downvoteCount: row.downvoteCount,
    userVote: row.userVote,
    commentsCount: row.commentsCount,
    bookmarked: row.bookmarked,

    postedBy: row.authorId
      ? {
        id: row.authorId,
        username: row.authorUsername,
        branch: row.authorBranch,
        college: row.collegeId
          ? {
            id: row.collegeId,
            name: row.collegeName,
            profile: row.collegeProfile,
          }
          : null,
      }
      : null,
  }));
};

export const countAll = async (
  filters?: {
    topic?: string;
    collegeId?: string;
    branch?: string;
    userCollegeId?: string;
    authorId?: string;
    blockerAuthId?: string;
  },
  dbTx?: DB
) => {
  const client = dbTx ?? db;

  const whereConditions = [
    eq(posts.isBanned, false),
    eq(posts.isShadowBanned, false),
  ];

  if (filters?.userCollegeId) {
    whereConditions.push(
      or(
        eq(posts.isPrivate, false),
        and(
          eq(posts.isPrivate, true),
          eq(users.collegeId, filters.userCollegeId)
        )
      )!
    );
  } else {
    // Unauthenticated users only see public posts
    whereConditions.push(eq(posts.isPrivate, false));
  }

  if (filters?.topic) {
    whereConditions.push(eq(posts.topic, filters.topic as any));
  }

  if (filters?.collegeId) {
    whereConditions.push(eq(colleges.id, filters.collegeId));
  }

  if (filters?.branch) {
    whereConditions.push(eq(users.branch, filters.branch));
  }

  if (filters?.authorId) {
    whereConditions.push(eq(posts.postedBy, filters.authorId));
  }

  if (filters?.blockerAuthId) {
    whereConditions.push(
      notExists(
        db.select({ id: userBlocks.id })
          .from(userBlocks)
          .where(
            or(
              and(
                eq(userBlocks.blockerId, filters.blockerAuthId),
                eq(userBlocks.blockedId, users.authId)
              ),
              and(
                eq(userBlocks.blockerId, users.authId),
                eq(userBlocks.blockedId, filters.blockerAuthId)
              )
            )
          )
      )
    );
  }

  const result = await client
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .leftJoin(users, eq(posts.postedBy, users.id))
    .leftJoin(colleges, eq(users.collegeId, colleges.id))
    .where(and(...whereConditions));

  return result[0]?.count || 0;
};

export const create = async (post: typeof posts.$inferInsert, dbTx?: DB) => {
  const client = dbTx ?? db;
  return await client
    .insert(posts)
    .values(post)
    .returning()
    .then((r) => r?.[0] || null);
};

export const updateById = async (
  id: string,
  updates: Partial<typeof posts.$inferInsert>,
  dbTx?: DB
) => {
  const client = dbTx ?? db;
  return await client
    .update(posts)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning()
    .then((r) => r?.[0] || null);
};

export const deleteById = async (id: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  return await client
    .delete(posts)
    .where(eq(posts.id, id))
    .returning()
    .then((r) => r?.[0] || null);
};

export const incrementViews = async (id: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  return await client
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(eq(posts.id, id))
    .returning()
    .then((r) => r?.[0] || null);
};

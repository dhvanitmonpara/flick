import { and, desc, eq, sql, asc, notExists, or } from "drizzle-orm";
import db from "@/infra/db/index";
import type { DB } from "@/infra/db/types";
import { comments, posts, users, colleges, votes } from "../tables";
import { userBlocks } from "../tables/user-block.table";

export const findById = async (id: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const comment = await client.query.comments.findFirst({
    where: eq(comments.id, id),
  });

  return comment;
};

export const findAuthorId = async (id: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const result = await client.select({ postedBy: comments.postedBy })
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);

  return result[0] ?? null;
};

export const findByPostId = async (
  postId: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    userId?: string;
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
        commentId: votes.targetId,
        upvoteCount: sql<number>`
          COUNT(*) FILTER (WHERE ${votes.voteType} = 'upvote')
        `.as("upvoteCount"),
        downvoteCount: sql<number>`
          COUNT(*) FILTER (WHERE ${votes.voteType} = 'downvote')
        `.as("downvoteCount"),
        userVote: userId ? sql<"upvote" | "downvote" | null>`
          MAX(
            CASE
              WHEN ${votes.userId} = ${userId}
              THEN ${votes.voteType}
            END
          )
        `.as("userVote") : sql<null>`NULL`.as("userVote"),
      })
      .from(votes)
      .where(eq(votes.targetType, "comment"))
      .groupBy(votes.targetId)
  );

  const orderBy = sortOrder === "asc"
    ? asc(comments[sortBy])
    : desc(comments[sortBy]);

  const whereConditions: any[] = [
    eq(comments.postId, postId),
    eq(comments.isBanned, false),
  ];

  if (options?.blockerAuthId) {
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

  const rows = await client
    .with(voteAgg)
    .select({
      // Comment
      commentId: comments.id,
      content: comments.content,
      postId: comments.postId,
      parentCommentId: comments.parentCommentId,
      isBanned: comments.isBanned,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,

      // Votes
      upvoteCount: sql<number>`COALESCE(${voteAgg.upvoteCount}, 0)`,
      downvoteCount: sql<number>`COALESCE(${voteAgg.downvoteCount}, 0)`,
      userVote: voteAgg.userVote,

      // Author
      authorId: users.id,
      authorUsername: users.username,
      authorBranch: users.branch,

      // College
      collegeId: colleges.id,
      collegeName: colleges.name,
      collegeProfile: colleges.profile,
    })
    .from(comments)
    .leftJoin(voteAgg, eq(voteAgg.commentId, comments.id))
    .leftJoin(users, sql`${comments.commentedBy}::text = ${users.id}::text`)
    .leftJoin(colleges, sql`${users.collegeId}::text = ${colleges.id}::text`)
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit);

  const results = rows.map((r) => ({
    id: r.commentId,
    content: r.content,
    postId: r.postId,
    parentCommentId: r.parentCommentId,
    isBanned: r.isBanned,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    upvoteCount: r.upvoteCount,
    downvoteCount: r.downvoteCount,
    userVote: r.userVote,

    commentedBy: r.authorId
      ? {
        id: r.authorId,
        username: r.authorUsername,
        branch: r.authorBranch,
        college: r.collegeId
          ? {
            id: r.collegeId,
            name: r.collegeName,
            profile: r.collegeProfile,
          }
          : null,
      }
      : null,
  }));

  return results;
};

export const countByPostId = async (postId: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const result = await client
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(
      and(
        eq(comments.postId, postId),
        eq(comments.isBanned, false)
      )
    );

  return result[0]?.count || 0;
};

export const create = async (comment: typeof comments.$inferInsert, dbTx?: DB) => {
  const client = dbTx ?? db;
  const createdComment = await client
    .insert(comments)
    .values(comment)
    .returning()
    .then((r) => r?.[0] || null);

  return createdComment;
};

export const updateById = async (
  id: string,
  updates: Partial<typeof comments.$inferInsert>,
  dbTx?: DB
) => {
  const client = dbTx ?? db;
  const updatedComment = await client
    .update(comments)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(eq(comments.id, id))
    .returning()
    .then((r) => r?.[0] || null);

  return updatedComment;
};

export const deleteById = async (id: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const deletedComment = await client
    .delete(comments)
    .where(eq(comments.id, id))
    .returning()
    .then((r) => r?.[0] || null);

  return deletedComment;
};

export const findByIdWithAuthor = async (id: string, dbTx?: DB) => {
  const client = dbTx ?? db;
  const result = await client
    .select({
      commentId: comments.id,
      content: comments.content,
      postId: comments.postId,
      parentCommentId: comments.parentCommentId,
      isBanned: comments.isBanned,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      commentedBy: comments.commentedBy,

      authorId: users.id,
      authorUsername: users.username,
      authorBranch: users.branch,

      // College
      collegeId: colleges.id,
      collegeName: colleges.name,
      collegeProfile: colleges.profile,
    })
    .from(comments)
    .leftJoin(users, sql`${comments.commentedBy}::text = ${users.id}::text`)
    .leftJoin(colleges, sql`${users.collegeId}::text = ${colleges.id}::text`)
    .where(eq(comments.id, id))
    .limit(1);

  const row = result[0];
  if (!row) return null;

  return {
    id: row.commentId,
    content: row.content,
    postId: row.postId,
    parentCommentId: row.parentCommentId,
    isBanned: row.isBanned,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    upvoteCount: 0,
    downvoteCount: 0,
    userVote: null,

    commentedBy: row.authorId
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

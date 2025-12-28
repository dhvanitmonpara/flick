import { CommentAdapter } from "@/infra/db/adapters";
import { DB } from "@/infra/db/types";
import { cached } from "@/lib/cached";

const keys = {
  id: (id: string) => `comment:id:${id}`,
  postComments: (postId: string, page: number, limit: number, sortBy: string, sortOrder: string, userId?: string) => 
    `comment:post:${postId}:${page}:${limit}:${sortBy}:${sortOrder}:${userId || 'anonymous'}`,
  postCount: (postId: string) => `comment:count:post:${postId}`,
};

export const findById = (id: string, dbTx?: DB) =>
  cached(keys.id(id), () => CommentAdapter.findById(id, dbTx));

export const findByIdWithAuthor = (id: string, dbTx?: DB) =>
  cached(keys.id(id), () => CommentAdapter.findByIdWithAuthor(id, dbTx));

export const findByPostId = (
  postId: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    userId?: string;
  },
  dbTx?: DB
) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const sortBy = options?.sortBy || "createdAt";
  const sortOrder = options?.sortOrder || "desc";
  const userId = options?.userId;

  return cached(
    keys.postComments(postId, page, limit, sortBy, sortOrder, userId),
    () => CommentAdapter.findByPostId(postId, options, dbTx)
  );
};

export const countByPostId = (postId: string, dbTx?: DB) =>
  cached(keys.postCount(postId), () => CommentAdapter.countByPostId(postId, dbTx));

export const create = (comment: Parameters<typeof CommentAdapter.create>[0], dbTx?: DB) =>
  CommentAdapter.create(comment, dbTx);

export const updateById = (
  id: string,
  updates: Parameters<typeof CommentAdapter.updateById>[1],
  dbTx?: DB
) => CommentAdapter.updateById(id, updates, dbTx);

export const deleteById = (id: string, dbTx?: DB) =>
  CommentAdapter.deleteById(id, dbTx);
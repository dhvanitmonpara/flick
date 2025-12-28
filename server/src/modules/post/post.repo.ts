import { PostAdapter } from "@/infra/db/adapters";
import { DB } from "@/infra/db/types";
import { cached } from "@/lib/cached";

const keys = {
  id: (id: string) => `post:id:${id}`,
  idWithDetails: (id: string, userId?: string) => `post:details:${id}:${userId || 'anonymous'}`,
  many: (page: number, limit: number, sortBy: string, sortOrder: string, topic?: string, collegeId?: string, branch?: string, userId?: string) => 
    `post:many:${page}:${limit}:${sortBy}:${sortOrder}:${topic || 'all'}:${collegeId || 'all'}:${branch || 'all'}:${userId || 'anonymous'}`,
  count: (topic?: string, collegeId?: string, branch?: string) => 
    `post:count:${topic || 'all'}:${collegeId || 'all'}:${branch || 'all'}`,
};

export const findById = (id: string, dbTx?: DB) =>
  cached(keys.id(id), () => PostAdapter.findById(id, dbTx));

export const findByIdWithDetails = (id: string, userId?: string, dbTx?: DB) =>
  cached(keys.idWithDetails(id, userId), () => PostAdapter.findByIdWithDetails(id, userId, dbTx));

export const findMany = (
  options?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "views";
    sortOrder?: "asc" | "desc";
    topic?: string;
    collegeId?: string;
    branch?: string;
    userId?: string;
  },
  dbTx?: DB
) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const sortBy = options?.sortBy || "createdAt";
  const sortOrder = options?.sortOrder || "desc";
  const topic = options?.topic;
  const collegeId = options?.collegeId;
  const branch = options?.branch;
  const userId = options?.userId;

  return cached(
    keys.many(page, limit, sortBy, sortOrder, topic, collegeId, branch, userId),
    () => PostAdapter.findMany(options, dbTx)
  );
};

export const countAll = (
  filters?: {
    topic?: string;
    collegeId?: string;
    branch?: string;
  },
  dbTx?: DB
) => cached(keys.count(filters?.topic, filters?.collegeId, filters?.branch), () => PostAdapter.countAll(filters, dbTx));

export const create = (post: Parameters<typeof PostAdapter.create>[0], dbTx?: DB) =>
  PostAdapter.create(post, dbTx);

export const updateById = (
  id: string,
  updates: Parameters<typeof PostAdapter.updateById>[1],
  dbTx?: DB
) => PostAdapter.updateById(id, updates, dbTx);

export const deleteById = (id: string, dbTx?: DB) =>
  PostAdapter.deleteById(id, dbTx);

export const incrementViews = (id: string, dbTx?: DB) =>
  PostAdapter.incrementViews(id, dbTx);
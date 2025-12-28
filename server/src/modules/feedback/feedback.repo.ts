import { FeedbackAdapter } from "@/infra/db/adapters";
import { DB } from "@/infra/db/types";
import { cached } from "@/lib/cached";

const keys = {
  id: (id: string) => `feedback:id:${id}`,
  all: (limit: number, skip: number, type?: string, status?: string) => 
    `feedback:all:${limit}:${skip}:${type || 'all'}:${status || 'all'}`,
  count: (type?: string, status?: string) => 
    `feedback:count:${type || 'all'}:${status || 'all'}`,
};

export const findById = (id: string, dbTx?: DB) =>
  cached(keys.id(id), () => FeedbackAdapter.findById(id, dbTx));

export const findByIdWithUser = (id: string, dbTx?: DB) =>
  cached(keys.id(id), () => FeedbackAdapter.findByIdWithUser(id, dbTx));

export const findAll = (
  options?: {
    limit?: number;
    skip?: number;
    type?: string;
    status?: string;
  },
  dbTx?: DB
) => {
  const limit = options?.limit || 50;
  const skip = options?.skip || 0;
  const type = options?.type;
  const status = options?.status;

  return cached(
    keys.all(limit, skip, type, status),
    () => FeedbackAdapter.findAll(options, dbTx)
  );
};

export const countAll = (
  filters?: {
    type?: string;
    status?: string;
  },
  dbTx?: DB
) => cached(keys.count(filters?.type, filters?.status), () => FeedbackAdapter.countAll(filters, dbTx));

export const create = (feedback: Parameters<typeof FeedbackAdapter.create>[0], dbTx?: DB) =>
  FeedbackAdapter.create(feedback, dbTx);

export const updateById = (
  id: string,
  updates: Parameters<typeof FeedbackAdapter.updateById>[1],
  dbTx?: DB
) => FeedbackAdapter.updateById(id, updates, dbTx);

export const deleteById = (id: string, dbTx?: DB) =>
  FeedbackAdapter.deleteById(id, dbTx);
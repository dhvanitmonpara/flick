import { CollegeAdapter } from "@/infra/db/adapters";
import { DB } from "@/infra/db/types";
import { cached } from "@/lib/cached";

const keys = {
  id: (id: string) => `college:id:${id}`,
  emailDomain: (emailDomain: string) => `college:emailDomain:${emailDomain}`,
  all: (filters?: { city?: string; state?: string }) => 
    `college:all:${filters?.city || 'all'}:${filters?.state || 'all'}`,
};

export const findById = (id: string, dbTx?: DB) =>
  cached(keys.id(id), () => CollegeAdapter.findById(id, dbTx));

export const findByEmailDomain = (emailDomain: string, dbTx?: DB) =>
  cached(keys.emailDomain(emailDomain), () => CollegeAdapter.findByEmailDomain(emailDomain, dbTx));

export const findAll = (filters?: { city?: string; state?: string }, dbTx?: DB) =>
  cached(keys.all(filters), () => CollegeAdapter.findAll(filters, dbTx));

export const create = (college: Parameters<typeof CollegeAdapter.create>[0], dbTx?: DB) =>
  CollegeAdapter.create(college, dbTx);

export const updateById = (id: string, updates: Parameters<typeof CollegeAdapter.updateById>[1], dbTx?: DB) =>
  CollegeAdapter.updateById(id, updates, dbTx);

export const deleteById = (id: string, dbTx?: DB) =>
  CollegeAdapter.deleteById(id, dbTx);
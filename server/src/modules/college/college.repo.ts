import { CollegeAdapter } from "@/infra/db/adapters";
import type { DB } from "@/infra/db/types";
import { cached } from "@/lib/cached";
import collegeCacheKeys from "./college.cache-keys";

const CollegeRepo = {
	CachedRead: {
		findById: (id: string, dbTx?: DB) =>
			cached(collegeCacheKeys.id(id), () => CollegeAdapter.findById(id, dbTx)),

		findByEmailDomain: (emailDomain: string, dbTx?: DB) =>
			cached(collegeCacheKeys.emailDomain(emailDomain), () =>
				CollegeAdapter.findByEmailDomain(emailDomain, dbTx),
			),

		findAll: async (filters?: { city?: string; state?: string }, dbTx?: DB) =>
			cached(await collegeCacheKeys.all(filters), () =>
				CollegeAdapter.findAll(filters, dbTx),
			),

		findBranchesByCollegeId: (collegeId: string, dbTx?: DB) =>
			cached(collegeCacheKeys.branches(collegeId), () =>
				CollegeAdapter.findBranchesByCollegeId(collegeId, dbTx),
			),
	},

	Read: {
		findById: (id: string, dbTx?: DB) => CollegeAdapter.findById(id, dbTx),

		findByEmailDomain: (emailDomain: string, dbTx?: DB) =>
			CollegeAdapter.findByEmailDomain(emailDomain, dbTx),
		findRequestByEmailDomain: (emailDomain: string, dbTx?: DB) =>
			CollegeAdapter.findRequestByEmailDomain(emailDomain, dbTx),

		findAll: (filters?: { city?: string; state?: string }, dbTx?: DB) =>
			CollegeAdapter.findAll(filters, dbTx),

		findBranchesByCollegeId: (collegeId: string, dbTx?: DB) =>
			CollegeAdapter.findBranchesByCollegeId(collegeId, dbTx),
		findAllRequests: (dbTx?: DB) => CollegeAdapter.findAllRequests(dbTx),
	},

	Write: {
		create: CollegeAdapter.create,
		updateById: CollegeAdapter.updateById,
		deleteById: CollegeAdapter.deleteById,
		setCollegeBranches: CollegeAdapter.setCollegeBranches,
		createRequest: CollegeAdapter.createRequest,
		updateRequestById: CollegeAdapter.updateRequestById,
	},
};

export default CollegeRepo;

import { and, eq, ilike, inArray } from "drizzle-orm";
import db from "@/infra/db/index";
import type { DB } from "@/infra/db/types";
import { branches, collegeBranches, colleges } from "../tables";

export const findById = async (id: string, dbTx?: DB) => {
	const client = dbTx ?? db;
	const college = await client.query.colleges.findFirst({
		where: eq(colleges.id, id),
	});

	if (!college) return college;

	const branchIds = await client
		.select({ branchId: collegeBranches.branchId })
		.from(collegeBranches)
		.where(eq(collegeBranches.collegeId, id));

	return {
		...college,
		branches: branchIds.map((b) => b.branchId),
	};
};

export const findByEmailDomain = async (emailDomain: string, dbTx?: DB) => {
	const client = dbTx ?? db;
	const college = await client.query.colleges.findFirst({
		where: eq(colleges.emailDomain, emailDomain),
	});

	return college;
};

export const findAll = async (
	filters?: { city?: string; state?: string },
	dbTx?: DB,
) => {
	const client = dbTx ?? db;

	const whereConditions = [];

	if (filters?.city) {
		whereConditions.push(ilike(colleges.city, `%${filters.city}%`));
	}

	if (filters?.state) {
		whereConditions.push(ilike(colleges.state, `%${filters.state}%`));
	}

	const collegeList = await client.query.colleges.findMany({
		where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
		orderBy: (colleges, { asc }) => [asc(colleges.name)],
	});

	const collegeIds = collegeList.map((c) => c.id);

	if (collegeIds.length === 0) return collegeList;

	const branchIdRecords = await client
		.select({
			collegeId: collegeBranches.collegeId,
			branchId: collegeBranches.branchId,
		})
		.from(collegeBranches)
		.where(inArray(collegeBranches.collegeId, collegeIds));

	const branchMap = new Map<string, string[]>();
	for (const record of branchIdRecords) {
		const existing = branchMap.get(record.collegeId) || [];
		existing.push(record.branchId);
		branchMap.set(record.collegeId, existing);
	}

	return collegeList.map((college) => ({
		...college,
		branches: branchMap.get(college.id) || [],
	}));
};

export const create = async (
	college: typeof colleges.$inferInsert,
	dbTx?: DB,
) => {
	const client = dbTx ?? db;
	const createdCollege = await client
		.insert(colleges)
		.values(college)
		.returning()
		.then((r) => r?.[0] || null);

	return createdCollege;
};

export const updateById = async (
	id: string,
	updates: Partial<typeof colleges.$inferInsert>,
	dbTx?: DB,
) => {
	const client = dbTx ?? db;
	const updatedCollege = await client
		.update(colleges)
		.set({ ...updates, updatedAt: new Date() })
		.where(eq(colleges.id, id))
		.returning()
		.then((r) => r?.[0] || null);

	return updatedCollege;
};

export const deleteById = async (id: string, dbTx?: DB) => {
	const client = dbTx ?? db;
	const deletedCollege = await client
		.delete(colleges)
		.where(eq(colleges.id, id))
		.returning()
		.then((r) => r?.[0] || null);

	return deletedCollege;
};

export const findBranchesByCollegeId = async (collegeId: string, dbTx?: DB) => {
	const client = dbTx ?? db;
	const result = await client
		.select({
			id: branches.id,
			name: branches.name,
			code: branches.code,
		})
		.from(branches)
		.innerJoin(collegeBranches, eq(branches.id, collegeBranches.branchId))
		.where(eq(collegeBranches.collegeId, collegeId));

	return result;
};

export const findCollegeBranchIds = async (collegeId: string, dbTx?: DB) => {
	const client = dbTx ?? db;
	const result = await client
		.select({ branchId: collegeBranches.branchId })
		.from(collegeBranches)
		.where(eq(collegeBranches.collegeId, collegeId));

	return result.map((r) => r.branchId);
};

export const addBranchesToCollege = async (
	collegeId: string,
	branchIds: string[],
	dbTx?: DB,
) => {
	const client = dbTx ?? db;
	const values = branchIds.map((branchId) => ({
		collegeId,
		branchId,
	}));

	await client.insert(collegeBranches).values(values).onConflictDoNothing();
};

export const removeBranchesFromCollege = async (
	collegeId: string,
	branchIds: string[],
	dbTx?: DB,
) => {
	const client = dbTx ?? db;
	await client
		.delete(collegeBranches)
		.where(
			and(
				eq(collegeBranches.collegeId, collegeId),
				inArray(collegeBranches.branchId, branchIds),
			),
		);
};

export const setCollegeBranches = async (
	collegeId: string,
	branchIds: string[],
	dbTx?: DB,
) => {
	const client = dbTx ?? db;

	await client.transaction(async (tx) => {
		await tx
			.delete(collegeBranches)
			.where(eq(collegeBranches.collegeId, collegeId));

		if (branchIds.length > 0) {
			const values = branchIds.map((branchId) => ({
				collegeId,
				branchId,
			}));
			await tx.insert(collegeBranches).values(values);
		}
	});
};

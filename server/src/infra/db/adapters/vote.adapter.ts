import { and, eq } from "drizzle-orm";
import db from "@/infra/db/index";
import type { DB } from "@/infra/db/types";
import { users } from "../tables";
import { type VoteInsert, votes } from "../tables/vote.table";

export const create = async (values: VoteInsert, dbTx?: DB) => {
	const client = dbTx ?? db;
	const [vote] = await client.insert(votes).values(values).returning();
	return vote;
};

export const findById = async (id: string, dbTx?: DB) => {
	const client = dbTx ?? db;
	const user = await client.query.users.findFirst({
		where: eq(users.id, id),
	});

	return user;
};

export const findByUsername = async (username: string, dbTx?: DB) => {
	const client = dbTx ?? db;
	const user = await client.query.users.findFirst({
		where: eq(users.username, username),
	});

	return user;
};

export const findByUserAndTarget = async (
	userId: string,
	targetId: string,
	targetType: "post" | "comment",
	dbTx?: DB,
) => {
	const client = dbTx ?? db;
	return await client.query.votes.findFirst({
		where: and(
			eq(votes.userId, userId),
			eq(votes.targetId, targetId),
			eq(votes.targetType, targetType),
		),
	});
};

export const updateById = async (
	id: string,
	updates: Partial<typeof votes.$inferInsert>,
	dbTx?: DB,
) => {
	const client = dbTx ?? db;
	const updatedVote = await client
		.update(votes)
		.set({ ...updates })
		.where(eq(votes.id, id))
		.returning()
		.then((r) => r?.[0] || null);

	return updatedVote;
};

export const deleteByUserAndTarget = async (
	userId: string,
	targetId: string,
	targetType: "post" | "comment",
	dbTx?: DB,
) => {
	const client = dbTx ?? db;

	return await client
		.delete(votes)
		.where(
			and(
				eq(votes.userId, userId),
				eq(votes.targetId, targetId),
				eq(votes.targetType, targetType),
			),
		)
		.returning()
		.then((r) => r?.[0] ?? null);
};

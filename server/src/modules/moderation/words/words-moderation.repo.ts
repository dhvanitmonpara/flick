import { asc, eq, max } from "drizzle-orm";
import db from "@/infra/db";
import { bannedWords } from "@/infra/db/tables";

export type BannedWordSeverity = "mild" | "moderate" | "severe";

export type BannedWordRecord = {
	id: string;
	word: string;
	strictMode: boolean;
	severity: BannedWordSeverity;
	createdAt: Date;
	updatedAt: Date;
};

export async function listBannedWords(): Promise<BannedWordRecord[]> {
	const rows = await db
		.select()
		.from(bannedWords)
		.orderBy(asc(bannedWords.word));

	return rows as BannedWordRecord[];
}

export async function getModerationConfigWords(): Promise<{
	strictWords: string[];
	normalWords: string[];
}> {
	const rows = await listBannedWords();
	const strictWords: string[] = [];
	const normalWords: string[] = [];

	for (const row of rows) {
		if (row.strictMode) {
			strictWords.push(row.word);
			continue;
		}

		normalWords.push(row.word);
	}

	return { strictWords, normalWords };
}

export async function createBannedWord(input: {
	word: string;
	strictMode?: boolean;
	severity: BannedWordSeverity;
}): Promise<BannedWordRecord> {
	const [created] = await db
		.insert(bannedWords)
		.values({
			word: input.word.trim().toLowerCase(),
			strictMode: input.strictMode ?? false,
			severity: input.severity,
		})
		.returning();

	return created;
}

export async function updateBannedWord(
	id: string,
	updates: {
		word?: string;
		strictMode?: boolean;
		severity?: BannedWordSeverity;
	},
): Promise<BannedWordRecord | null> {
	const payload: Partial<typeof bannedWords.$inferInsert> = {
		updatedAt: new Date(),
	};

	if (updates.word !== undefined) {
		payload.word = updates.word.trim().toLowerCase();
	}
	if (updates.strictMode !== undefined) {
		payload.strictMode = updates.strictMode;
	}
	if (updates.severity !== undefined) {
		payload.severity = updates.severity;
	}

	const [updated] = await db
		.update(bannedWords)
		.set(payload)
		.where(eq(bannedWords.id, id))
		.returning();

	return (updated as BannedWordRecord | undefined) ?? null;
}

export async function deleteBannedWord(
	id: string,
): Promise<BannedWordRecord | null> {
	const [deleted] = await db
		.delete(bannedWords)
		.where(eq(bannedWords.id, id))
		.returning();

	return (deleted as BannedWordRecord | undefined) ?? null;
}

export async function getBannedWordsVersion(): Promise<Date | null> {
	const [result] = await db
		.select({ lastUpdated: max(bannedWords.updatedAt) })
		.from(bannedWords);

	return result?.lastUpdated ?? null;
}

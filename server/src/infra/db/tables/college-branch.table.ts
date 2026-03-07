import {
	index,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { branches } from "./branch.table";
import { colleges } from "./college.table";

export const collegeBranches = pgTable(
	"college_branches",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		collegeId: uuid("collegeId")
			.references(() => colleges.id, { onDelete: "cascade" })
			.notNull(),
		branchId: uuid("branchId")
			.references(() => branches.id, { onDelete: "cascade" })
			.notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("idx_college_branch_unique").on(
			table.collegeId,
			table.branchId,
		),
		index("idx_college_branches_college").on(table.collegeId),
		index("idx_college_branches_branch").on(table.branchId),
	],
);

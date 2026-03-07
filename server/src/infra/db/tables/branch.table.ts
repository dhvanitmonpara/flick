import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const branches = pgTable(
	"branches",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		code: text("code").notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt").defaultNow().notNull(),
	},
	(table) => [
		index("idx_branch_name").on(table.name),
		index("idx_branch_code").on(table.code),
	],
);

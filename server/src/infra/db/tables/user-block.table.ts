import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { auth } from "./auth.table";

export const userBlocks = pgTable(
  "user_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blockerId: text("blocker_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_blocks_unique_idx").on(table.blockerId, table.blockedId),
  ]
);

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocker: one(auth, {
    fields: [userBlocks.blockerId],
    references: [auth.id],
    relationName: "blocked_users",
  }),
  blocked: one(auth, {
    fields: [userBlocks.blockedId],
    references: [auth.id],
    relationName: "blocked_by",
  }),
}));

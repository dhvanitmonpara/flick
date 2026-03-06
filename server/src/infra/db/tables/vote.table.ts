import {
  pgTable,
  uuid,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { platformUser } from "./auth.table";
import { voteEntityEnum, voteTypeEnum } from "./enums";

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => platformUser.id, { onDelete: "cascade" }),

    targetType: voteEntityEnum("target_type").notNull(),

    targetId: uuid("target_id").notNull(),

    voteType: voteTypeEnum("vote_type").notNull(),
  },
  (table) => [
    uniqueIndex("votes_user_target_unique").on(
      table.userId,
      table.targetType,
      table.targetId
    ),
    index("votes_target_lookup_idx").on(
      table.targetType,
      table.targetId
    ),
  ]
);

export type VoteSelect = typeof votes.$inferSelect;
export type VoteInsert = typeof votes.$inferInsert;

import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.table";
import { topicEnum } from "./enums";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  postedBy: uuid("postedBy").references(() => users.id),
  topic: topicEnum("topic").notNull(),
  isBanned: boolean("isBanned").default(false),
  isShadowBanned: boolean("isShadowBanned").default(false),
  views: integer("views").default(0),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("posts_visibility_idx").on(table.isBanned, table.isShadowBanned, table.createdAt.desc()),
]);

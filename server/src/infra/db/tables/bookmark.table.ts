import { pgTable, uuid, index, timestamp, text } from "drizzle-orm/pg-core";
import { posts } from "./post.table";
import { platformUser } from "./auth.table";

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("postId").references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("userId").references(() => platformUser.id, { onDelete: "cascade" }).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("bookmark_user_id_idx").on(table.userId, table.postId),
]);

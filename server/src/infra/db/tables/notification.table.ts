import {
  pgTable,
  text,
  jsonb,
  timestamp,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { posts } from "./post.table";
import { notificationType } from "./enums";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  seen: boolean("seen").notNull().default(false),
  postId: uuid("postId").references(() => posts.id).default(null),
  receiverId: text("receiverId").notNull(),
  actorUsernames: jsonb("actorUsernames").$type<string[]>().notNull(),
  content: text("content").default(null),
  type: notificationType("type").notNull().default("general"),

  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

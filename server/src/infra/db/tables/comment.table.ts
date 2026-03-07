import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { platformUser } from "./auth.table";
import { posts } from "./post.table";

export const comments = pgTable("comments", {
	id: uuid("id").defaultRandom().primaryKey(),
	content: text("content").notNull(),
	postId: uuid("postId")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	commentedBy: uuid("commentedBy")
		.notNull()
		.references(() => platformUser.id, { onDelete: "cascade" }),
	isBanned: boolean("isBanned").notNull().default(false),
	parentCommentId: uuid("parentCommentId").references(() => comments.id, {
		onDelete: "set null",
	}),

	createdAt: timestamp("createdAt", { mode: "string" }).notNull().defaultNow(),
	updatedAt: timestamp("updatedAt", { mode: "string" }).notNull().defaultNow(),
});

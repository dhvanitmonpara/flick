import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { platformUser } from "./auth.table";
import { comments } from "./comment.table";
import { contentReportTypeEnum } from "./enums";
import { posts } from "./post.table";

export const contentReports = pgTable("content_reports", {
	id: uuid("id").defaultRandom().primaryKey(),
	type: contentReportTypeEnum("type").notNull(), // "Post" | "Comment"
	postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
	commentId: uuid("comment_id").references(() => comments.id, {
		onDelete: "cascade",
	}),
	reportedBy: uuid("reported_by")
		.notNull()
		.references(() => platformUser.id, { onDelete: "cascade" }),
	reason: text("reason").notNull(),
	status: varchar("status", { length: 20 }).notNull().default("pending"),
	message: text("message").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ContentReportSelect = typeof contentReports.$inferSelect;
export type ContentReportInsert = typeof contentReports.$inferInsert;

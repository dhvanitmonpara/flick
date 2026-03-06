import { relations } from "drizzle-orm";
import { platformUser as users, auth } from "./auth.table";
import { posts } from "./post.table";
import { bookmarks } from "./bookmark.table";
import { votes } from "./vote.table";
import { contentReports } from "./content-report.table";
import { comments } from "./comment.table";
import { userBlocks } from "./user-block.table";
import { colleges } from "./college.table";
import { branches } from "./branch.table";
import { collegeBranches } from "./college-branch.table";

// Auth — has user blocks
export const authUserBlocksRelations = relations(auth, ({ many }) => ({
  blockedUsers: many(userBlocks, { relationName: "blocked_users" }),
  blockedBy: many(userBlocks, { relationName: "blocked_by" }),
}));

// User — has posts, bookmarks, votes
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  bookmarks: many(bookmarks),
  votes: many(votes),
}));

// Post — belongs to user; has votes; has bookmarks
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.postedBy],
    references: [users.id],
  }),
  votes: many(votes),
  bookmarks: many(bookmarks),
  comments: many(comments),
}));

// Bookmark — belongs to user and post
export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [bookmarks.postId],
    references: [posts.id],
  }),
}));

// Vote — belongs to user and post
export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.targetId],
    references: [posts.id],
  }),
}));

export const contentReportRelations = relations(contentReports, ({ one }) => ({
  user: one(users, {
    fields: [contentReports.reportedBy],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [contentReports.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [contentReports.commentId],
    references: [comments.id],
  }),
}));

// College — has many branches (many-to-many via junction table)
export const collegesRelations = relations(colleges, ({ many }) => ({
  collegeBranches: many(collegeBranches),
}));

// Branch — has many colleges (many-to-many via junction table)
export const branchesRelations = relations(branches, ({ many }) => ({
  collegeBranches: many(collegeBranches),
}));

// Junction table — belongs to college and branch
export const collegeBranchesRelations = relations(collegeBranches, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeBranches.collegeId],
    references: [colleges.id],
  }),
  branch: one(branches, {
    fields: [collegeBranches.branchId],
    references: [branches.id],
  }),
}));
